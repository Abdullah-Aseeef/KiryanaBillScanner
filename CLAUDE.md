# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tajir** is a bill scanning and inventory management system for Kiryana (small grocery) shops in Pakistan. Store owners send bill photos via WhatsApp or web upload; Google Gemini 1.5 Flash parses the images into structured line items; humans review and verify the extracted data via a React dashboard.

## Architecture

Two-tier MERN stack with dual ingestion paths:

```
client/ (React + Vite, port 5173)
  └── Proxies /api and /webhook → backend in dev

server/ (Express, port 5001)
  ├── routes/upload.js     — web image upload (sync, returns parsed bill)
  ├── routes/webhook.js    — WhatsApp ingestion (async background processing)
  ├── routes/bills.js      — CRUD: list, get, update items, verify
  ├── routes/analytics.js  — MongoDB aggregations for dashboard KPIs
  ├── services/geminiParser.js — Gemini API integration with model fallback chain
  ├── models/Bill.js       — Bill schema (source, status, items[], confidence)
  └── models/LineItem.js   — Line item schema (standardName, qty, unit, price)
```

**Key design decisions:**
- Multer uses memory storage (no disk I/O) — stateless and Render-compatible
- WhatsApp webhook returns `200 OK` immediately, processes image in background
- `geminiParser.js` tries model fallback: `gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash`
- Bills auto-verify if Gemini confidence ≥ 0.65
- Pao → kg and dozen → piece unit normalization for analytics consistency
- Roman Urdu item names are normalized by Gemini (e.g., "Aalu", "Chawal")

**Legacy:** `main.py` is an earlier Python/FastAPI + SQLite implementation — not actively used.

## Commands

### Backend
```bash
cd server
npm install
npm run dev       # nodemon auto-restart
npm start         # production
node seeder.js    # seed 5 sample bills with Pakistani grocery items
```

### Frontend
```bash
cd client
npm install
npm run dev       # Vite dev server
npm run build     # production build to dist/
npm run lint      # ESLint
```

### Environment
Copy `.env.example` to `.env` and fill in:
- `MONGODB_URI` — local or Atlas connection string
- `GEMINI_API_KEY` — Google AI Studio key
- `WA_TOKEN` — Meta WhatsApp Business token
- `WA_VERIFY_TOKEN` — webhook verification token
- `PORT` — defaults to 5001

### Webhook testing
```bash
curl "http://localhost:5001/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test123"
```

## Data Flow

1. Image arrives (web `POST /api/upload` or WhatsApp `POST /webhook`)
2. `geminiParser.js` sends image buffer to Gemini with a structured prompt requesting JSON
3. Gemini returns `{ items: [...], totalAmount, confidence, rawText }`
4. `LineItem` docs are created and referenced from a `Bill` doc
5. Frontend `ReviewPanel` allows inline editing of items before verification
6. `PUT /api/bills/:id/verify` sets status to `'verified'`
7. `GET /api/analytics/summary` aggregates verified bills for dashboard KPIs

## Frontend State Patterns

- `App.jsx` manages `activeTab` and a `refreshKey` integer; incrementing `refreshKey` forces child remounts after uploads
- `api.js` is the single Axios client module — add all new API calls there
- `ReviewPanel` uses controlled inputs for inline cell editing with local state before saving


## Working Principles for Claude Code

### Token efficiency
- Do NOT explain what you're about to do before doing it. Just do it.
- Do NOT summarize what you just did after doing it. The diff speaks for itself.
- Do NOT ask clarifying questions unless something is genuinely ambiguous and would cause data loss or irreversible damage if wrong.
- Prefer one complete, correct implementation over multiple partial drafts asking for approval.
- If a file needs to be read before editing, read only the relevant sections (use line ranges).
- Do NOT repeat back the requirements. Acknowledge with one line max and proceed.

### Autonomous reasoning
- When you notice a bug, inconsistency, or improvement opportunity while working on something else, fix it or leave a `// TODO(claude):` comment — do not stop to ask.
- Prefer inferring intent from context. If the CLAUDE.md, schema, and routes are consistent, trust them.
- After any significant change, reason about downstream effects (routes, frontend state, analytics) and handle them in the same pass.

### What NOT to do
- Do not scaffold boilerplate files unless explicitly asked.
- Do not add console.log debugging unless the task is specifically debugging.
- Do not install additional packages without stating why the existing stack can't handle it.
- Do not rewrite working code just to match a style preference.

## Assignment Context (Take-Home 2026)

### Goal
Build a useful tool for a kiryana/pan shop/mart owner. The product must be:
- A public web app (no login/signup)
- Seeded with realistic Pakistani grocery store data
- Polished enough to look like a real startup product
- Solving a *real* problem validated by store owner interviews


### Constraints
- No native mobile apps — web only (mobile-responsive is fine)
- No authentication walls on the public URL
- Must be deployed (Vercel/Render/Railway acceptable)
- Seed data must make it look like an active account

### MVP scope (what Claude should build)
- WhatsApp number receives bill photos → Gemini parses → saved to DB under that sender's number
- Web upload as fallback (same parsing pipeline)
- Web dashboard shows: total revenue, items sold, top items — filtered by phone number or all accounts
- WhatsApp reply after processing: confirmation message with parsed item count and total
- Seed data: 3-4 fake phone numbers with 10-15 bills each so dashboard looks active

### Out of scope (do not build unless asked)
- User login or signup
- Multi-shop management UI
- Inventory alerts or low-stock warnings
- Supplier management
- Payment tracking (udhar/credit)
- Multi-user/auth flows
- Payment integrations
- Complex reporting beyond the core problem


## Active Plan: Vision OCR + Gemini Migration

Replace direct image-to-Gemini parsing with a two-stage pipeline: Google Cloud Vision extracts OCR text, then Gemini structures that OCR text using your provided Pakistani kiryana prompt. Update backend and frontend to a new item schema (item, quantity, price), migrate existing stored line-items, and keep route/API behavior stable for upload, webhook, review, and analytics.

**Steps**
1. Phase 1 — Service architecture and dependencies
2. Add Google Vision dependency to server package and environment contract.
3. Define new env vars and validation: GOOGLE_APPLICATION_CREDENTIALS (required), GEMINI_API_KEY (required), GEMINI_MODEL optional, and parser flags for strict JSON handling.
4. Split parsing service responsibilities:
5. Vision OCR function takes image buffer/mime type and returns normalized OCR text plus raw Vision payload snippet for observability.
6. Gemini structuring function takes OCR text and your prompt template, then returns strict parsed JSON array with fallback parse extraction.
7. Compose orchestration function parseImage that performs Vision then Gemini and returns parsedData plus rawText (rawText now stores OCR text and/or structured response envelope).
8. Phase 2 — Schema migration and compatibility
9. Update LineItem schema from standardName/rawName/qty/unit/price/subtotal to item/quantity/price/subtotal (subtotal retained for analytics speed).
10. Add a migration script to convert existing LineItem docs in-place:
11. standardName/rawName -> item (prefer standardName, fallback rawName).
12. qty -> quantity.
13. subtotal recomputed as quantity * price when missing/invalid.
14. Remove deprecated fields after successful migration validation.
15. Update Bill and all route serializers to use new item schema.
16. Phase 3 — Route-level integration
17. Refactor upload route to call new parser pipeline, map structured output to LineItem docs using new fields, and compute totals robustly.
18. Refactor WhatsApp webhook route to use same parser pipeline and field mapping.
19. Keep existing response envelope shape for Bill resources so client routes remain stable while item field names update.
20. Ensure all error paths clearly distinguish Vision OCR failure vs Gemini structuring failure and preserve HTTP semantics.
21. Phase 4 — Analytics and review UX updates
22. Update analytics aggregation to group by item and sum quantity/subtotal.
23. Update review panel state model and editor fields from standardName/rawName/qty/unit/price to item/quantity/price.
24. Update verify/update payload builders in client to emit new item schema.
25. Keep subtotal and total behavior unchanged from user perspective.
26. Phase 5 — Data migration execution and verification
27. Run migration script once in target DB; verify no remaining docs with legacy keys.
28. Run end-to-end smoke tests:
29. Upload API with image.
30. Webhook processing path with image media.
31. Review/verify path.
32. Analytics summary path.
33. Confirm structured output matches your strict prompt contract and null behavior for unclear fields.

**Relevant files**
- geminiParser.js — replace single-step image parsing with Vision OCR + Gemini structuring pipeline and strict prompt handling.
- upload.js — consume new parser output and map to new LineItem fields.
- webhook.js — consume new parser output for WhatsApp ingestion and reply messaging.
- LineItem.js — migrate schema to item/quantity/price/subtotal.
- bills.js — verify/update endpoints field mapping and subtotal/total recomputation logic.
- analytics.js — group and aggregate using item and quantity fields.
- package.json — add Google Cloud Vision dependency and migration script entry.
- .env.example — document Vision credentials and model variables.
- ReviewPanel.jsx — update editor table fields and verify payload contract.
- Dashboard.jsx — ensure top item labeling remains correct with new analytics field source.
- api.js — confirm endpoint payloads remain consistent after schema change.
- seeder.js — align seed data with new line-item schema.
- server/scripts/migrateLineItemsToV2.js — new migration script for existing documents.

**Verification**
1. Install and dependency check: npm install in server; ensure @google-cloud/vision resolves.
2. Credential validation: startup check fails fast when GOOGLE_APPLICATION_CREDENTIALS is missing/unreadable.
3. Unit-level parser validation:
4. Vision OCR returns non-empty text for known sample image.
5. Gemini structurer returns strict JSON array for provided OCR text format.
6. Integration checks:
7. POST /api/upload with image returns 201 and populated Bill with item/quantity/price/subtotal.
8. POST /webhook image flow persists bill and sends success reply.
9. PUT /api/bills/:id/verify accepts updated item schema and persists correctly.
10. GET /api/analytics/summary reflects migrated and newly ingested records.
11. Migration checks:
12. Before/after counts for legacy fields and new fields.
13. No document loss, subtotal integrity, and bill totals preserved.
14. Frontend checks:
15. Review table edits and confirms without runtime errors.
16. Dashboard top items and revenue cards render expected values.

**Decisions**
- Vision credentials source: GOOGLE_APPLICATION_CREDENTIALS file path env.
- OCR fallback policy: No fallback to direct-image Gemini; Vision OCR is required.
- Output schema policy: Change to item/quantity/price (subtotal retained internally).
- Backward compatibility policy: Migrate existing LineItem documents in-place (no mixed schema period).

**Further considerations**
1. Prompt placement recommendation: store long structuring prompt in a dedicated server prompt constant file for easier iteration and testing.
2. Observability recommendation: include parser_used values vision+gemini and log OCR character length to monitor extraction quality over time.
3. Cost/performance recommendation: cap OCR image dimensions before Vision call for very large uploads to control latency and API usage.

If this plan looks good, I’ll proceed with implementation exactly in this order.
start implementation

### Current Phase
Complete

### Completed
- Phase 1 — Service architecture and dependencies (Vision OCR + Gemini structuring pipeline, kiryanaBillPrompt.js, @google-cloud/vision dependency, credential validation on startup)
- Phase 2 — Schema migration (LineItem: standardName/rawName/qty/unit → item/quantity/price/subtotal; migration script; bills.js updated)
- Phase 3 — Route integration (upload.js and webhook.js consume new parser output, map to new LineItem fields, distinct error messages for Vision vs Gemini failures)
- Phase 4 — Analytics and review UX (analytics.js aggregates by item/quantity; ReviewPanel uses item/quantity/price, no unit/rawName columns; verify payload updated)
- Phase 5 — seeder.js migrated to new schema; @google-cloud/vision installed; migration script at server/scripts/migrateLineItemsToV2.js (run: npm run migrate)

---

## Feature Roadmap (Priority Order)

### Phase 6 — Enhanced WhatsApp Experience & UX Polish

#### 1. Smart WhatsApp Summary Replies
**Current:** Generic success message with item count and total.
**Target:** Include link to web dashboard (`https://kiryana-bill-scanner.vercel.app`) and formatted summary showing top 3 items from bill.
**Implementation:** Modify `webhook.js` WhatsApp reply logic to:
- Extract top 3 items by quantity or value from parsed LineItems
- Format reply with inline link: "For more details, visit: https://kiryana-bill-scanner.vercel.app"
- Include formatted item list (e.g., "Aalu (5kg), Chawal (2kg), Namak (1kg)")

#### 2. WhatsApp Interactive Menu (Deferred to Phase 7)
**Vision:** User sends message "menu" → WhatsApp interactive buttons (View Revenue, Top Items, Weekly Summary, Send Bill).
**Blocker:** Requires Meta WhatsApp Business API interactive message template approval process. Defer until core features stabilize.
**Note:** Document as feature request for future reference.

#### 3. Website Bill Upload Instructions & WhatsApp CTA
**Current:** Upload form is standalone, no guidance.
**Target:** 
- Add "Sample Bill" section showing before/after (parsed example)
- Display WhatsApp CTA card: "Or send bill photo to +1 (555) 629-1286 on WhatsApp for instant parsing"
- Update `UploadForm.jsx` with instructions panel; add new component `WhatsAppCTA.jsx`
- Place CTA prominently above or below upload form

#### 4. Urdu/English Language Toggle
**Current:** Hardcoded English UI labels.
**Target:** Site-wide language toggle storing preference in localStorage.
**Implementation:** 
- Create `src/context/LanguageContext.jsx` with i18n keys
- Add toggle button to header (or sidebar)
- Update all component labels: Dashboard, ReviewPanel, UploadForm, Analytics cards
- Use translation object structure: `{ en: "...", ur: "..." }`
- Include translations for: "Total Revenue", "Top Items", "Items Sold", "Upload Bill", "Verify", "Sample", etc.

#### 5. WhatsApp Audio Voice Messages (Deferred to Phase 8)
**Current:** Only image-based bills.
**Vision:** User sends voice memo → extract speech-to-text → parse as bill items.
**Blocker:** Requires speech-to-text API (Google Cloud Speech or Whisper); significant scope creep. **Defer.**
**Note:** Revisit once image pipeline is proven stable in production; estimate +50 API tokens per audio message.

#### 6. Improved OCR with Column Detection Strategy
**Current:** Gemini structuring assumes flexible bill format.
**Target:** Pre-process Vision OCR output to detect bill layout and optimize parsing:
- **2-column layout** (item | total price): Parse as `{ item, price }`
- **3-column layout** (item | price-per-unit | quantity): Parse as `{ item, price, quantity }`
- Update `kiryanaBillPrompt.js` to accept layout hint from Vision OCR heuristic
- Implementation: Add `detectBillColumns()` function in `geminiParser.js` that analyzes raw OCR text for column patterns and whitespace alignment before Gemini structuring

---

## Implementation Priority Matrix

| Phase | Feature | Est. Effort | Dependency | Priority |
|-------|---------|-------------|-----------|----------|
| 6.1   | WhatsApp Summary Reply | 2–3 hrs | None | **HIGH** |
| 6.3   | Website Instructions + CTA | 2 hrs | None | **HIGH** |
| 6.4   | Urdu/English Toggle | 3–4 hrs | None | **MEDIUM** |
| 6.6   | OCR Column Detection | 4–5 hrs | Current Vision pipeline | **MEDIUM** |
| 7     | WhatsApp Interactive Menu | 3 hrs | Meta API approval | LOW |
| 8     | Audio Voice Messages | 6–8 hrs | Speech-to-text API | LOW |

---

## Guidance for Claude Code (Phase 6+)

When requesting Phase 6+ features:
1. **Reference the phase and feature number** — e.g., "Implement Phase 6.1: WhatsApp Summary Reply"
2. **Link to this roadmap** — "See CLAUDE.md § Feature Roadmap for context"
3. **Specify scope boundaries** — e.g., "Only add top 3 items; keep reply under 160 chars"
4. **Provide constants upfront:**
   - WhatsApp number: `+1 (555) 629-1286`
   - Website URL: `https://kiryana-bill-scanner.vercel.app`
   - Translation keys for Urdu/English
5. **Suggest test vectors** — real bill examples, sample OCR outputs for column detection

---

## Next Steps

1. ✅ **Phase 6.1 (WhatsApp Summary)** — DONE: top-3 items by subtotal, dashboard link, item list in reply
2. ✅ **Phase 6.3 (Website Instructions)** — DONE: How It Works steps, sample output panel, WhatsAppCTA component
3. ✅ **Phase 6.4 (Language Toggle)** — DONE: LanguageContext with en/ur translations, toggle in header, all components wired, localStorage persistence
4. ✅ **Phase 6.6 (OCR Columns)** — DONE: detectBillColumns() heuristic, buildKiryanaBillPrompt(layout) with layout hints, layout logged + stored in rawText
5. ⏸ **Phase 7 (WhatsApp Interactive Menu)** — blocked: requires Meta API template approval
6. ⏸ **Phase 8 (Audio Voice Messages)** — blocked: requires speech-to-text API integration