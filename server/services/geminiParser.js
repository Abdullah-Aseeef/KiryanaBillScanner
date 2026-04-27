const vision = require('@google-cloud/vision');
const { ExternalAccountClient } = require('google-auth-library');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { KIRYANA_STRUCTURING_PROMPT } = require('./kiryanaBillPrompt');

const MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash',
];

function getCandidateModels() {
  const configured = process.env.GEMINI_MODEL;
  if (configured && configured.trim()) {
    return [configured.trim(), ...MODEL_FALLBACKS.filter((m) => m !== configured.trim())];
  }
  return MODEL_FALLBACKS;
}

function isModelUnavailableError(error) {
  const message = String(error?.message || '');
  return error?.status === 404 || message.includes('404') || message.includes('not found for API version');
}

function parseStructuredOutput(text) {
  let jsonString = text.trim();

  const codeBlockMatch = jsonString.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  if (codeBlockMatch) {
    jsonString = codeBlockMatch[1].trim();
  }

  if (!jsonString.startsWith('[')) {
    const startIdx = jsonString.indexOf('[');
    const endIdx = jsonString.lastIndexOf(']');
    if (startIdx !== -1 && endIdx > startIdx) {
      jsonString = jsonString.substring(startIdx, endIdx + 1);
    }
  }

  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response is not a JSON array');
  }
  return parsed;
}

function buildVisionClient() {
  // On Render, RENDER_OIDC_TOKEN_URL is auto-provisioned when OIDC is enabled.
  // Use Workload Identity Federation — no private key stored anywhere.
  if (process.env.RENDER_OIDC_TOKEN_URL) {
    const auth = ExternalAccountClient.fromJSON({
      type: 'external_account',
      audience: process.env.GOOGLE_WIF_AUDIENCE,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      token_url: 'https://sts.googleapis.com/v1/token',
      service_account_impersonation_url:
        `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
      credential_source: {
        url: process.env.RENDER_OIDC_TOKEN_URL,
        format: { type: 'json', subject_token_field_name: 'value' },
      },
    });
    return new vision.ImageAnnotatorClient({ auth, projectId: process.env.GOOGLE_PROJECT_ID });
  }

  // Local dev: use Application Default Credentials (gcloud auth application-default login).
  return new vision.ImageAnnotatorClient({ projectId: process.env.GOOGLE_PROJECT_ID });
}

async function extractOcrText(imageBuffer) {
  const client = buildVisionClient();

  const [result] = await client.documentTextDetection({
    image: { content: imageBuffer.toString('base64') },
  });

  const fullText = result.fullTextAnnotation?.text || '';

  if (!fullText.trim()) {
    throw new Error('Vision OCR returned no text from image');
  }

  const rawSnippet = {
    pages: result.fullTextAnnotation?.pages?.length || 0,
    charCount: fullText.length,
  };

  return { ocrText: fullText, rawSnippet };
}

async function structureWithGemini(ocrText) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const prompt = `${KIRYANA_STRUCTURING_PROMPT}\n\nOCR TEXT:\n${ocrText}`;
  const modelsToTry = getCandidateModels();
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      try {
        return parseStructuredOutput(text);
      } catch {
        const strictPrompt = `${prompt}\n\nRETURN ONLY VALID JSON ARRAY. No markdown fences, no prose, no explanation.`;
        const retryResult = await model.generateContent(strictPrompt);
        return parseStructuredOutput(retryResult.response.text());
      }
    } catch (error) {
      lastError = error;
      if (!isModelUnavailableError(error)) throw error;
      console.warn(`Gemini model unavailable: ${modelName}. Trying next candidate...`);
    }
  }

  throw new Error(
    `No compatible Gemini model found. Tried: ${modelsToTry.join(', ')}. Last error: ${lastError?.message || 'unknown'}`
  );
}

const parseImage = async (imageBuffer, mimeType) => {
  let ocrText, rawSnippet;

  try {
    ({ ocrText, rawSnippet } = await extractOcrText(imageBuffer));
    console.log(`Vision OCR: extracted ${ocrText.length} chars (mimeType=${mimeType})`);
    console.log(`Vision OCR: extracted ${ocrText} chars (mimeType=${mimeType})`);
  } catch (error) {
    console.error('Vision OCR failure:', error.message);
    throw new Error(`Vision OCR failed: ${error.message}`);
  }

  let items;
  try {
    items = await structureWithGemini(ocrText);
  } catch (error) {
    console.error('Gemini structuring failure:', error.message);
    throw new Error(`Gemini structuring failed: ${error.message}`);
  }

  const total = items.reduce((sum, it) => {
    return sum + (Number(it.quantity) || 0) * (Number(it.price) || 0);
  }, 0);

  const rawText = JSON.stringify({
    parser_used: 'vision+gemini',
    ocr_chars: ocrText.length,
    ocr_snippet: rawSnippet,
    ocr_preview: ocrText.substring(0, 500),
    structured: items,
  });

  return {
    parsedData: { items, total },
    rawText,
  };
};

module.exports = { parseImage };
