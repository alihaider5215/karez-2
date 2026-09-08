markdown
# Karez 2.0 — PPRA Compliance Engine

AI-native procurement compliance platform for Pakistani government 
tenders under PPRA Rules 2004.

## What It Does

Upload any NHA, LDA, C&W or PPRA tender PDF. Karez 2.0:

- Renders up to 12 pages and extracts every eligibility requirement
- Generates a real-time compliance audit against your company profile
- Drafts a complete 6-section technical proposal
- Produces a 10-document submission checklist
- Exports as PDF and shares via WhatsApp in English or Urdu

## Who It's For

- Freelance procurement consultants managing multiple client companies
- In-house bid managers at Tier-1 construction firms
- SMEs bidding on government tenders for the first time

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript |
| Auth & Database | Firebase Auth + Firestore |
| AI — Primary | Gemini 3.5 Flash |
| AI — Fallback | Alibaba Cloud Qwen |
| PDF Rendering | pdf.js (multi-page) |
| Hosting | Vercel |

## Key Features

- Multi-client architecture — one consultant, many companies
- Zero synthetic data — fails loudly rather than returning fake results
- Bilingual — English and Urdu interface and WhatsApp sharing
- Rate limiting — 20 analyses per hour per user
- Error boundaries — panel-level crash recovery
- PWA-ready — installable on Android and iOS

## Running Locally

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your keys
3. Run `npm install`
4. Run `npm run dev`

## Environment Variables

GEMINI_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=


## License

Built for the Alibaba Cloud Hackathon Pakistan 2026.
