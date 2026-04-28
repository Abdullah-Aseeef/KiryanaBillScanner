const LAYOUT_HINTS = {
  '2-column':
    'Layout detected: 2 columns (item name | total price). ' +
    'Each line has one item and one price value. Set quantity to 1 unless explicitly stated.',
  '3-column':
    'Layout detected: 3 columns (item name | quantity | unit price, possibly with a total column). ' +
    'Extract item, quantity, and the per-unit price — not the row total.',
  unknown:
    'Layout is unclear. Use your best judgment to identify items, quantities, and prices.',
};

function buildKiryanaBillPrompt(layout = 'unknown') {
  const layoutHint = LAYOUT_HINTS[layout] || LAYOUT_HINTS.unknown;

  return `You are an expert at reading Pakistani kiryana (grocery) shop bills written in English, Roman Urdu, or Urdu script.

Given OCR text extracted from a bill image, extract all purchased line items and return them as a strict JSON array.

${layoutHint}

Rules:
- Normalize all Roman Urdu/phonetic variations to standard names:
  "Aloo"/"Alu" → "Aalu", "Dood"/"Dhodh" → "Doodh", "Aata"/"Aatta" → "Atta",
  "Chaini"/"Cheeni" → "Cheeni", "Chawal"/"Chaawal" → "Chawal",
  "Daal"/"Dal" → "Daal", "Gosht"/"Gusht" → "Gosht"
- quantity: positive number; use 1 if not visible
- price: per-unit price in Pakistani Rupees; use null if not visible
- Skip header rows, total/subtotal rows, store name lines, and blank lines
- If an item name cannot be read at all, skip that row
- Return ONLY a valid JSON array — no markdown fences, no explanation

Output format (strict):
[
  { "item": "Aalu", "quantity": 2, "price": 60 },
  { "item": "Doodh", "quantity": 4, "price": 170 }
]`;
}

function buildAudioTranscriptPrompt() {
  return `You are an expert at understanding Pakistani kiryana (grocery) shop purchases spoken in Urdu or English.

Given a voice message transcript, extract all purchased items mentioned and return them as a strict JSON array.

Common Urdu number words to numeric mappings:
ek=1, do=2, teen=3, char=4, panch=5, cheh=6, saat=7, aath=8, nau=9, das=10,
gyarah=11, barah=12, tera=13, choda=14, pandara=15, sola=16, satra=17, atharah=18, unnees=19,
bis=20, tees=30, chalis=40, pachaas=50, saath=60, sattar=70, assi=80, nabbe=90, sau=100

Rules:
- Normalize Roman Urdu/phonetic variations to standard names:
  "Aloo"/"Alu" → "Aalu", "Dood"/"Dhodh" → "Doodh", "Aata"/"Aatta" → "Atta",
  "Chaini"/"Cheeni" → "Cheeni", "Chawal"/"Chaawal" → "Chawal",
  "Daal"/"Dal" → "Daal", "Gosht"/"Gusht" → "Gosht"
- quantity: convert spoken Urdu number words to numeric values; use 1 if not mentioned
- price: per-unit price in Rupees if explicitly stated; otherwise use null
- Skip any item that is too unclear or ambiguous to identify
- Return ONLY a valid JSON array — no markdown fences, no explanation

Output format (strict):
[
  { "item": "Aalu", "quantity": 2, "price": null },
  { "item": "Doodh", "quantity": 4, "price": 170 }
]`;
}

module.exports = { buildKiryanaBillPrompt, buildAudioTranscriptPrompt };
