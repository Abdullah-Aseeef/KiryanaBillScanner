# Kiryana Bill OCR — MERN Stack Rebuild

Rebuild the existing Python/FastAPI/SQLite application into a full MERN stack (MongoDB, Express, React, Node.js) with Google Gemini 1.5 Flash integration and dual-ingestion (Web Upload + WhatsApp Webhook).

## User Review Required

> [!IMPORTANT]
> **MongoDB Atlas vs Local MongoDB**: Your `.env` currently has `mongodb://localhost:27017/kiryana`. The prompt says MongoDB Atlas — should I configure for Atlas (requiring a connection string like `mongodb+srv://...`) or keep local MongoDB for development? I'll default to **supporting both** via the `MONGODB_URI` env var.

> [!WARNING]
> **Existing Python code will NOT be deleted.** The MERN app will be created in a new `server/` and `client/` directory structure alongside the existing code. You can remove the Python files manually once you're satisfied.

> [!IMPORTANT]
> **Gemini API Key**: Your `.env.example` has a key commented out. I'll wire everything through env vars. You'll need a valid `GEMINI_API_KEY` for the AI parser to work.

## Open Questions

1. **WhatsApp reply**: Should the webhook send a reply message back to the WhatsApp user after processing (e.g., "Bill parsed: ₹990, 3 items")? The current Python app doesn't do this. I'll skip it unless you want it.
2. **Image storage**: Since Render has ephemeral disk, images won't be stored. The current app saves images to `~/Downloads`. Should I add Cloudinary/S3 upload, or is it fine to just process in-memory and discard? I'll default to **in-memory only**.
3. **Authentication**: No auth is mentioned. I'll skip it. Confirm if that's correct.

## Proposed Changes

### Project Structure

```
/Users/abdullahasif/Documents/Tajir/
├── server/                    # Express backend
│   ├── package.json
│   ├── .env.example
│   ├── server.js              # Express app, routes, middleware
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── Bill.js            # Bill mongoose schema
│   │   └── LineItem.js        # LineItem mongoose schema
│   ├── services/
│   │   └── geminiParser.js    # Gemini 1.5 Flash AI parser
│   ├── routes/
│   │   ├── upload.js          # POST /api/upload (web)
│   │   ├── webhook.js         # GET/POST /webhook (WhatsApp)
│   │   ├── bills.js           # GET/PUT /api/bills (CRUD + verify)
│   │   └── analytics.js       # GET /api/analytics (dashboard data)
│   └── seeder.js              # Seed 5 sample bills
├── client/                    # React frontend (Vite)
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── api.js             # Axios helpers
│   │   └── components/
│   │       ├── Dashboard.jsx  # Revenue + Top Items
│   │       ├── Dashboard.css
│   │       ├── ReviewPanel.jsx # Editable bill table + Confirm
│   │       ├── ReviewPanel.css
│   │       ├── UploadForm.jsx  # Image upload form
│   │       └── UploadForm.css
│   └── vite.config.js
└── (existing Python files untouched)
```

---

### Backend — Database Schema

#### [NEW] [Bill.js](file:///Users/abdullahasif/Documents/Tajir/server/models/Bill.js)

Mongoose schema for the `Bill` model:

| Field | Type | Details |
|-------|------|---------|
| `source` | String, enum | `'web'` or `'whatsapp'` |
| `senderWaId` | String | WhatsApp sender ID (nullable) |
| `mediaId` | String | WhatsApp media ID (nullable) |
| `totalAmount` | Number | Sum of all line item subtotals |
| `items` | [ObjectId] | Refs to `LineItem` |
| `status` | String, enum | `'unverified'` / `'verified'`, default `'unverified'` |
| `confidence` | Number | AI confidence score 0-1 |
| `rawText` | String | Raw text from Gemini response |
| `createdAt` | Date | Mongoose timestamps |

#### [NEW] [LineItem.js](file:///Users/abdullahasif/Documents/Tajir/server/models/LineItem.js)

| Field | Type | Details |
|-------|------|---------|
| `billId` | ObjectId | Ref to `Bill` |
| `standardName` | String | Normalized name (e.g., `'Aalu'`) |
| `rawName` | String | Original OCR text |
| `qty` | Number | Quantity |
| `unit` | String | kg, g, piece, pao, dozen |
| `price` | Number | Unit price |
| `subtotal` | Number | qty × price |

---

### Backend — AI Parser Service

#### [NEW] [geminiParser.js](file:///Users/abdullahasif/Documents/Tajir/server/services/geminiParser.js)

- Uses `@google/generative-ai` SDK (not raw REST API)
- Accepts an image buffer + mime type
- Sends to Gemini 1.5 Flash with the exact system instruction from the prompt
- Parses response as JSON with fallback extraction (handles markdown code blocks)
- Returns `{ items: [...], total: number }`

Key design decisions:
- **Buffer-based**: No file I/O — works on Render's ephemeral disk
- **Strict JSON prompt**: Tells Gemini "Return ONLY a valid JSON object" to prevent crashes
- **Retry logic**: One retry on JSON parse failure

---

### Backend — Routes

#### [NEW] [upload.js](file:///Users/abdullahasif/Documents/Tajir/server/routes/upload.js) — Web Upload

`POST /api/upload` — multipart/form-data with `image` field
1. `multer` with memory storage receives the file
2. Buffer sent to `geminiParser.parseImage(buffer, mimeType)`
3. Creates `LineItem` docs, then `Bill` doc with refs
4. Returns the populated bill JSON

#### [NEW] [webhook.js](file:///Users/abdullahasif/Documents/Tajir/server/routes/webhook.js) — WhatsApp

- `GET /webhook` — Meta verification handshake (hub.mode, hub.verify_token, hub.challenge)
- `POST /webhook` — **Immediately returns `200 OK`**, then processes in background:
  1. Extract `media_id` from payload
  2. Download image buffer from Meta Graph API using `axios` + Bearer token
  3. Send buffer to Gemini parser
  4. Save to MongoDB

#### [NEW] [bills.js](file:///Users/abdullahasif/Documents/Tajir/server/routes/bills.js) — Bill CRUD

- `GET /api/bills` — List all bills (with populated items), sorted by newest
- `GET /api/bills/:id` — Get single bill with items
- `PUT /api/bills/:id` — Update bill fields + items (for the editable review panel)
- `PUT /api/bills/:id/verify` — Set `status: 'verified'`

#### [NEW] [analytics.js](file:///Users/abdullahasif/Documents/Tajir/server/routes/analytics.js) — Dashboard Data

- `GET /api/analytics/summary` — Returns:
  - `totalRevenue`: Sum of `totalAmount` where `status === 'verified'`
  - `topItems`: Aggregate `LineItem` by `standardName`, count occurrences + sum qty, sorted desc
  - `billCount`, `unverifiedCount`

---

### Backend — Main Server

#### [NEW] [server.js](file:///Users/abdullahasif/Documents/Tajir/server/server.js)

- Express app with `cors`, `express.json()`
- Connects to MongoDB via `config/db.js`
- Mounts all route files
- Stateless — no sessions, no local file storage
- Listens on `process.env.PORT || 5001`

#### [NEW] [db.js](file:///Users/abdullahasif/Documents/Tajir/server/config/db.js)

- `mongoose.connect(process.env.MONGODB_URI)` with error handling

---

### Backend — Seeder

#### [NEW] [seeder.js](file:///Users/abdullahasif/Documents/Tajir/server/seeder.js)

Populates 5 sample bills with Roman Urdu items:

| Bill | Items |
|------|-------|
| 1 | Atta (5kg, ₹160/kg), Cheeni (1kg, ₹190/kg) |
| 2 | Doodh (4 pcs, ₹170), Chai Patti (0.5kg, ₹1200/kg) |
| 3 | Basmati Chawal (3kg, ₹360/kg), Masoor Daal (2kg, ₹340/kg) |
| 4 | Anday (24 pcs, ₹28), Cooking Oil (2 pcs, ₹640) |
| 5 | Sabun (3 pcs, ₹85), Aalu (2kg, ₹60/kg) |

Mix of `unverified` and `verified` statuses for realistic dashboard data.

---

### Frontend — React (Vite)

#### [NEW] [App.jsx](file:///Users/abdullahasif/Documents/Tajir/client/src/App.jsx)

- Tab-based navigation: **Dashboard** | **Upload & Review**
- State management: `useState` + `useEffect` for data fetching
- Proxy to backend via Vite config

#### [NEW] [Dashboard.jsx](file:///Users/abdullahasif/Documents/Tajir/client/src/components/Dashboard.jsx)

- **Total Revenue** card (from verified bills)
- **Top Selling Items** table (standardName, count, total qty)
- **Bill Count** / **Unverified Count** stats
- Fetches from `GET /api/analytics/summary`

#### [NEW] [ReviewPanel.jsx](file:///Users/abdullahasif/Documents/Tajir/client/src/components/ReviewPanel.jsx)

- Shows the latest scanned bill in an **editable table**
- Every cell (standardName, rawName, qty, unit, price, subtotal) is editable via controlled inputs
- **Confirm** button: PUTs updated data to `/api/bills/:id/verify`, sets status to `verified`
- List of recent bills on the left to select which one to review

#### [NEW] [UploadForm.jsx](file:///Users/abdullahasif/Documents/Tajir/client/src/components/UploadForm.jsx)

- File input for image upload
- Drag-and-drop zone
- Sends `POST /api/upload` with `FormData`
- Shows loading spinner during Gemini processing
- On success, redirects to ReviewPanel with the new bill

---

### Environment Variables

#### Server `.env`

```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://localhost:27017/kiryana
PORT=5001
WA_TOKEN=your_whatsapp_access_token
WA_VERIFY_TOKEN=karyana_magic_123
WA_PHONE_NUMBER_ID=your_phone_number_id
```

#### Client `.env`

```
VITE_API_URL=http://localhost:5001
```

---

## Verification Plan

### Automated Tests

1. **Seeder**: Run `node seeder.js` → verify 5 bills + 10 line items in MongoDB
2. **API smoke test**: `curl POST /api/upload` with a test image → verify JSON response
3. **Webhook verification**: `curl GET /webhook?hub.mode=subscribe&hub.verify_token=karyana_magic_123&hub.challenge=test123` → expect `test123`
4. **Frontend build**: `npm run build` in client → no errors

### Manual Verification

1. Start backend (`npm run dev` in `server/`)
2. Start frontend (`npm run dev` in `client/`)
3. Open browser → verify Dashboard shows seeded data
4. Upload a bill image → verify it appears in Review Panel
5. Edit cells in Review Panel → click Confirm → verify status changes to `verified`
6. Dashboard revenue updates after verification
