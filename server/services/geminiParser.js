const vision = require('@google-cloud/vision');
const speech = require('@google-cloud/speech');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildKiryanaBillPrompt, buildAudioTranscriptPrompt } = require('./kiryanaBillPrompt');

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

function buildCredentials() {
  const projectId = process.env.GOOGLE_PROJECT_ID;

  if (process.env.GOOGLE_CREDENTIALS_B64) {
    try {
      const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_B64, 'base64').toString('utf-8');
      const credentials = JSON.parse(credentialsJson);
      return { projectId: credentials.project_id, credentials };
    } catch (error) {
      console.error('Failed to decode GOOGLE_CREDENTIALS_B64:', error.message);
      throw new Error('Invalid GOOGLE_CREDENTIALS_B64 environment variable');
    }
  }

  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      projectId,
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    };
  }

  return { projectId };
}

function buildVisionClient() {
  return new vision.ImageAnnotatorClient(buildCredentials());
}

function buildSpeechClient() {
  return new speech.SpeechClient(buildCredentials());
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

function detectBillColumns(ocrText) {
  const lines = ocrText.split('\n').filter((l) => l.trim().length > 3);
  const numPattern = /[\d,]+(?:\.\d+)?/g;

  let twoNumLines = 0;
  let threeOrMoreNumLines = 0;
  let candidateLines = 0;

  for (const line of lines) {
    const nums = (line.match(numPattern) || []).filter(
      (n) => Number(n.replace(/,/g, '')) > 0
    );
    if (nums.length >= 3) {
      threeOrMoreNumLines++;
      candidateLines++;
    } else if (nums.length === 2) {
      twoNumLines++;
      candidateLines++;
    }
  }

  if (candidateLines === 0) return 'unknown';
  if (threeOrMoreNumLines / candidateLines > 0.4) return '3-column';
  if (twoNumLines / candidateLines > 0.4) return '2-column';
  return 'unknown';
}

async function structureWithGemini(ocrText) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const layout = detectBillColumns(ocrText);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const prompt = `${buildKiryanaBillPrompt(layout)}\n\nOCR TEXT:\n${ocrText}`;
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

async function transcribeAudio(audioBuffer, mimeType) {
  const client = buildSpeechClient();

  // WhatsApp voice notes are OGG/Opus; sampleRateHertz is auto-detected from container header
  let encoding = 'OGG_OPUS';
  if (mimeType && (mimeType.includes('mp4') || mimeType.includes('mpeg') || mimeType.includes('mp3'))) {
    encoding = 'MP3';
  } else if (mimeType && mimeType.includes('wav')) {
    encoding = 'LINEAR16';
  }

  const config = {
    encoding,
    // OGG_OPUS requires explicit sample rate — WhatsApp voice notes default to 16000 Hz
    sampleRateHertz: encoding === 'MP3' ? undefined : 16000,
    languageCode: 'ur-PK',
    alternativeLanguageCodes: ['en-PK'],
    model: 'default',
    enableAutomaticPunctuation: true,
  };

  if (config.sampleRateHertz === undefined) {
    delete config.sampleRateHertz;
  }

  const [response] = await client.recognize({
    audio: { content: audioBuffer.toString('base64') },
    config,
  });

  const transcript = (response.results || [])
    .map((r) => r.alternatives[0]?.transcript || '')
    .join(' ')
    .trim();

  if (!transcript) {
    throw new Error('Speech-to-Text returned empty transcript');
  }

  return transcript;
}

async function structureAudioWithGemini(transcript) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const prompt = `${buildAudioTranscriptPrompt()}\n\nTRANSCRIPT:\n${transcript}`;
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
    const layout = detectBillColumns(ocrText);
    console.log(`Vision OCR: extracted ${ocrText.length} chars, layout=${layout} (mimeType=${mimeType})`);
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
    layout_detected: detectBillColumns(ocrText),
    ocr_snippet: rawSnippet,
    ocr_preview: ocrText.substring(0, 500),
    structured: items,
  });

  return {
    parsedData: { items, total },
    rawText,
  };
};

const parseAudio = async (audioBuffer, mimeType) => {
  let transcript;

  try {
    transcript = await transcribeAudio(audioBuffer, mimeType);
    console.log(`Speech-to-Text: transcribed ${transcript.length} chars (mimeType=${mimeType})`);
  } catch (error) {
    console.error('Speech-to-Text failure:', error.message);
    throw new Error(`Speech-to-Text failed: ${error.message}`);
  }

  let items;
  try {
    items = await structureAudioWithGemini(transcript);
  } catch (error) {
    console.error('Gemini audio structuring failure:', error.message);
    throw new Error(`Gemini audio structuring failed: ${error.message}`);
  }

  const total = items.reduce((sum, it) => {
    return sum + (Number(it.quantity) || 0) * (Number(it.price) || 0);
  }, 0);

  const rawText = JSON.stringify({
    parser_used: 'speech+gemini',
    transcript_chars: transcript.length,
    transcript_preview: transcript.substring(0, 500),
    structured: items,
  });

  return {
    parsedData: { items, total },
    rawText,
  };
};

module.exports = { parseImage, parseAudio };
