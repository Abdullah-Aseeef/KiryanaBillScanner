# Kiryana Bill Scanner

A full-stack, WhatsApp-first retail assistant for small shop owners. The system accepts bill images and voice notes, extracts line items using OCR/speech + LLM structuring, stores records in MongoDB, and exposes a web dashboard for verification, revenue insights, and top-selling products.


## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [API Surface (High-Level)](#api-surface-high-level)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Deployment Guide](#deployment-guide)
- [Technical Challenges and Implementation Notes](#technical-challenges-and-implementation-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap Ideas](#roadmap-ideas)

## Overview

**Kiryana Bill Scanner** helps neighborhood retailers digitize billing and sales tracking through WhatsApp and a lightweight dashboard.

### What it does

1. Receives receipt/bill images or audio item lists.
2. Extracts structured item data (English + Urdu support).
3. Computes totals and stores bills + line items.
4. Lets users review/verify bills in a web dashboard.
5. Shows key analytics such as total revenue and top items.

## Core Features

### WhatsApp Bot

- Accepts receipt **images** and **audio messages**.
- Handles multilingual input (English + Urdu workflow).
- Sends automatic summary replies with extracted totals and item previews.
- Provides an interactive WhatsApp menu for quick business stats.
- Supports webhook verification flow for Meta WhatsApp Cloud API.

### Parsing & Data Extraction

- OCR-based bill text extraction for image uploads.
- Speech-to-text pipeline for audio uploads.
- LLM-based structuring into normalized item/quantity/price records.
- Fallback total calculation from line item subtotals.

### Web Dashboard

- Upload image/audio directly from the browser.
- Review unverified bills and edit extracted line items.
- Verify final bills to include them in business analytics.
- Track revenue and top-selling items.

## Tech Stack

### Frontend

- **React (Vite)** in this repository
- Deployable on **Vercel**
- Axios for API integration

### Backend

- **Node.js + Express**
- Deployable on **Render**
- REST API + WhatsApp webhook handlers

### Database

- **MongoDB Atlas** via Mongoose

### AI / Cloud Services

- Google Cloud Vision (OCR)
- Google Cloud Speech-to-Text
- Gemini API for structured parsing
- WhatsApp Cloud API (Meta Graph)

## System Architecture

```text
WhatsApp User / Web Uploader
				|
				v
 Node.js + Express API (Render target)
  - /webhook (WhatsApp events)
  - /api/upload (image/audio)
  - parsing + normalization
				|
				v
	MongoDB Atlas (Bills, LineItems)
				|
				v
 React Dashboard (Vercel target)
  - review, verify, analytics
```

### Request/Processing Flow

1. User sends bill image or audio through WhatsApp (or uploads from web).
2. Backend downloads media and calls OCR/Speech services.
3. LLM parser converts unstructured text into JSON line items.
4. API persists bills and line items in MongoDB.
5. Dashboard fetches analytics and bill status for visualization and manual verification.

## Project Structure

```text
.
├── README.md
├── client/
│   ├── .env.example
│   ├── .env.production
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api.js
│       ├── App.jsx
│       ├── components/
│       │   ├── Dashboard.jsx
│       │   ├── UploadForm.jsx
│       │   ├── ReviewPanel.jsx
│       │   ├── HelpPanel.jsx
│       │   └── WhatsAppCTA.jsx
│       └── context/
│           └── LanguageContext.jsx
└── server/
	 ├── .env.example
	 ├── package.json
	 ├── server.js
	 ├── seeder.js
	 ├── config/
	 │   └── db.js
	 ├── routes/
	 │   ├── upload.js
	 │   ├── webhook.js
	 │   ├── bills.js
	 │   └── analytics.js
	 ├── models/
	 │   ├── Bill.js
	 │   └── LineItem.js
	 ├── services/
	 │   ├── geminiParser.js
	 │   └── kiryanaBillPrompt.js
	 └── scripts/
		  └── migrateLineItemsToV2.js
```

## API Surface (High-Level)

### Health

- `GET /api/health` - service + integration readiness

### Upload

- `POST /api/upload` - image bill upload
- `POST /api/upload/audio` - audio upload

### Bills

- `GET /api/bills` - list bills
- `GET /api/bills/:id` - bill detail
- `PUT /api/bills/:id` - update bill/items
- `PUT /api/bills/:id/verify` - verify bill

### Analytics

- `GET /api/analytics/summary` - revenue, counts, top items, recents

### WhatsApp

- `GET /webhook` - verification handshake
- `POST /webhook` - message event ingestion

## Local Development Setup

### 1) Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas connection string (or local MongoDB)
- Meta WhatsApp Cloud API credentials
- Google Cloud credentials (for Vision/Speech)
- Gemini API key

### 2) Clone and Install

```bash
# from repository root
cd client && npm install
cd ../server && npm install
```

### 3) Configure Environment Variables

Create env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Then edit values in both files (templates below).

### 4) Run Development Servers

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Defaults:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

The Vite dev server proxies `/api` and `/webhook` to backend locally.

## Environment Variables

The project currently uses the following server-side names. A mapping table is included to align with common naming used in assessments.

### Server `.env` Template

```env
# Required core
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
GEMINI_API_KEY=<your_gemini_api_key>
GOOGLE_PROJECT_ID=<your_google_project_id>

# Google credentials (choose ONE strategy)
# A) Local JSON file path
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# B) Explicit service account fields (often used on Render)
GOOGLE_CLIENT_EMAIL=<service_account_email>
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# C) Base64 JSON blob (supported by backend)
GOOGLE_CREDENTIALS_B64=<base64_service_account_json>

# WhatsApp Cloud API
WA_TOKEN=<whatsapp_access_token>
WA_VERIFY_TOKEN=<custom_verify_token>
WA_PHONE_NUMBER_ID=<phone_number_id>
WA_API_VERSION=v22.0

# Optional dashboard URL used in bot reply links
DASHBOARD_URL=https://<frontend-domain>
```

### Client `.env` Template

```env
# Empty in local dev (Vite proxy handles backend)
# Set for production deployments
VITE_API_URL=https://<render-backend-domain>
```

### Naming Compatibility (Assessment-Friendly)

- `MONGO_URI` -> `MONGODB_URI`
- `WHATSAPP_TOKEN` -> `WA_TOKEN`
- `WIF_CREDENTIALS` -> Use `GOOGLE_CREDENTIALS_B64` (or `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY`)

## Deployment Guide

### Frontend Deployment (Vercel)

1. Push repository to GitHub.
2. In Vercel, import the repo and set project root to `client`.
3. Build settings:
	- Build Command: `npm run build`
	- Output Directory: `dist`
4. Add env var:
	- `VITE_API_URL=https://<your-render-service>.onrender.com`
5. Deploy.

### Backend Deployment (Render)

1. Create a **Web Service** from the same repo.
2. Set root directory to `server`.
3. Build and start:
	- Build Command: `npm install`
	- Start Command: `npm start`
4. Add all required server env vars from the template.
5. Ensure `MONGODB_URI` points to MongoDB Atlas.
6. After deploy, set WhatsApp webhook callback URL:
	- `https://<your-render-service>.onrender.com/webhook`
	- Verify token must match `WA_VERIFY_TOKEN`.

## Post-Deployment Checklist

- `GET /api/health` returns healthy config flags.
- WhatsApp webhook verification succeeds.
- Image and audio parsing both create bill records.
- Frontend can read analytics and bill list from backend.

## Technical Challenges and Implementation Notes

### 1) Multilingual OCR (English + Urdu)

- Bill text may contain mixed scripts and inconsistent layouts.
- OCR output is normalized before structured parsing.
- LLM prompts enforce item/quantity/price schema even with noisy inputs.

### 2) Voice-to-Bill Conversion

- Audio transcription can omit prices or units.
- Backend gracefully handles partial extraction and allows dashboard correction.

### 3) Data Reliability

- Bills are stored as `unverified` first.
- Human-in-the-loop verification improves analytics trustworthiness.

### 4) Production Credential Strategy

- Supports file-based local creds and env-based cloud creds.
- Backend fails fast on missing critical credentials for safer startup.

## Troubleshooting

- **500 on startup:** check required env vars (`MONGODB_URI`, `GEMINI_API_KEY`, Google credentials).
- **Webhook verify fails:** confirm callback URL and `WA_VERIFY_TOKEN` match exactly.
- **No OCR results:** verify Google Vision credentials and image quality.
- **Frontend cannot reach API in production:** set `VITE_API_URL` to backend base URL.
- **CORS/API errors:** ensure backend is running and public URL is correct.

## Roadmap Ideas

- Add role-based auth for multi-user shops
- Add daily/weekly PDF reports
- Add inventory depletion predictions
- Add automated CI workflow YAMLs for staging and production
