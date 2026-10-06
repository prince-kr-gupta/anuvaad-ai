# Anuvaad AI

<p>Live - https://anuvaad-ai-nine.vercel.app/</p>

A hackathon-ready multilingual communication workspace for Indian languages.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- AI: OPENROUTER API
- Voice input/output: Web Speech APIs
- OCR: Tesseract.js

## Run locally

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
```

Add your OPENROUTER KEY to `backend/.env`:

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openrouter/free
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173
```

Run:

```bash
npm run dev
```

Backend: `http://localhost:5000`
Health endpoint: `http://localhost:5000/api/health`

### 2. Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Features

- Context-aware translation across 23 language options
- Voice input through browser speech recognition
- Speech output through browser text-to-speech
- Image OCR with Tesseract.js
- Simple Mode for easier explanations
- Responsive hackathon-style dashboard UI

## Security

Keep `OPENROUTER_API_KEY` only in `backend/.env`. Never put it in React or commit it to GitHub.
