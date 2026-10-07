# Anuvaad AI

<p>Live - https://anuvaad-ai-nine.vercel.app/</p>

> AI-powered multilingual communication platform for Indian languages.

Anuvaad AI is designed to reduce language barriers by combining **AI translation, voice input, speech playback, OCR-based text extraction, and Simple Mode** inside one easy-to-use interface.

The goal is simple: a user should be able to **type, speak, scan, translate, understand, and listen** — all from one place.
1

## 💡 Problem Statement

India is a multilingual country where people frequently face communication barriers because:

- Users may understand only one or two languages.
- Government, healthcare, travel, and educational content can be difficult to understand.
- Existing translation tools often focus only on text translation.
- Voice, OCR, simplification, and translation are usually available as separate tools.
- Many users need simpler language instead of literal translation.

Anuvaad AI solves this by combining multiple communication tools into one platform.

---

## ✅ Our Solution

Anuvaad AI provides a unified multilingual workspace where users can:

- Type text manually
- Speak using a microphone
- Extract text from images
- Translate between Indian languages
- Listen to translated output
- Simplify difficult text
- Switch context such as Healthcare, Government, Education, Travel, or General

This makes the platform useful for real-world communication instead of only basic word-to-word translation.

---

## ✨ Key Features

### 🌍 AI-Powered Translation
- Translate text between multiple Indian languages
- Context-aware translation
- Supports natural and conversational input
- Handles code-mixed and informal text better than strict literal translation
- Preserves names, numbers, and meaning

### 🎙️ Voice Input
- Speak directly through the browser
- Speech is converted into text using the Web Speech API
- Source language can be selected before recording
- Useful for users who prefer speaking instead of typing

### 🔊 Listen to Translation
- Translated output can be spoken aloud
- Uses browser Speech Synthesis
- Automatically selects available voices
- Helpful for pronunciation and accessibility

> Note: Text-to-speech availability depends on the voices supported by the user's browser and operating system.

### 📷 Smart Scan OCR
- Upload an image containing text
- OCR extracts the text automatically
- Extracted text can then be translated
- Built using Tesseract.js

### ✨ Simple Mode
Simple Mode rewrites difficult or formal text into easier language.

Useful in cases such as:

- Healthcare instructions
- Government notices
- Education
- Travel information
- Formal documents
- Everyday communication

### 🧠 Context-Aware Translation
Users can select a context before translation:

- General
- Healthcare
- Government
- Education
- Travel

This helps the AI generate output that matches the real situation.

### 🔄 Language Swap
- Swap source and target languages instantly
- Reuse translated text as input

### 📋 Copy Translation
- Copy translated output directly to clipboard

### 🎨 Interactive User Interface
- Modern dashboard layout
- Futuristic multilingual theme
- Interactive 3D language visualization
- Responsive interface
- Searchable language dropdown

---

## 🌐 Supported Language Options

Anuvaad AI currently provides options for:

- English
- Hindi
- Bengali
- Assamese
- Gujarati
- Kannada
- Malayalam
- Marathi
- Odia
- Punjabi
- Tamil
- Telugu
- Urdu
- Nepali
- Sanskrit
- Maithili
- Dogri
- Konkani
- Bodo
- Kashmiri
- Manipuri
- Santali
- Sindhi

---

## 🧠 System Workflow

User Input
   │
   ├── Text Input
   ├── Voice Input
   └── Image OCR
   │
   ▼
React Frontend
   │
   ▼
Node.js + Express Backend
   │
   ▼
OpenRouter AI
   │
   ├── Translation
   └── Simple Mode
   │
   ▼
AI Output
   │
   ├── Display Translation
   ├── Copy Output
   └── Listen using Browser TTS

---

## 🏗️ Architecture

Frontend
   │
   │ REST API
   ▼
Backend
   │
   │ AI Request
   ▼
OpenRouter
   │
   ▼
AI Response
   │
   ▼
Frontend Output

Additional browser-side services:

- Web Speech API → Voice Input
- Speech Synthesis API → Text-to-Speech
- Tesseract.js → OCR

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React
- Tesseract.js
- Web Speech API
- Browser Speech Synthesis

### Backend
- Node.js
- Express.js
- OpenRouter API
- CORS
- dotenv

### Deployment
- Frontend → Vercel
- Backend → Render
- Source Code → GitHub

---

## 📂 Project Structure

Anuvaad-AI/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── styles.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── server.js
    ├── package.json
    ├── .env
    └── .gitignore

---

## ⚙️ Local Setup

### 1. Clone Repository

git clone <your-repository-url>

cd Anuvaad-AI

---

### 2. Backend Setup

cd backend

npm install

Create a `.env` file:

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

Start backend:

npm start

Backend runs on:

http://localhost:5000

---

### 3. Frontend Setup

Open another terminal:

cd frontend

npm install

npm run dev

Create a frontend `.env` file:

VITE_API_URL=http://localhost:5000

Open the Vite URL shown in the terminal.

Usually:

http://localhost:5173

or

http://localhost:5174

---

## 🚀 Production Configuration

### Frontend Environment Variable

VITE_API_URL=https://anuvaad-ai-haxu.onrender.com

### Backend Environment Variables

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
ALLOWED_ORIGINS=https://anuvaad-ai-nine.vercel.app

---

## 🔐 Security

- API keys are stored only on the backend.
- `.env` files are excluded from GitHub.
- Frontend only receives the backend URL.
- Sensitive OpenRouter API credentials are never exposed in browser code.

Recommended `.gitignore`:

.env
node_modules

---

## ⚠️ Current Limitations

### Browser TTS Availability
Some Indian languages may not have a text-to-speech voice installed in every browser or operating system.

For example, English and Hindi may work while some languages such as Assamese may not have a local browser voice.

### Browser Speech Recognition
Speech recognition support depends on the browser.

Chrome and Edge provide the best experience.

### AI Free Model Availability
The project currently uses OpenRouter's free model routing.

Model availability and response behavior may vary depending on free model availability.

### OCR Accuracy
OCR accuracy depends on:

- Image quality
- Font size
- Lighting
- Script
- Text clarity

---

## 🔮 Future Scope

We plan to improve Anuvaad AI with:

### Real-Time Conversation Mode
Two users speaking different languages will be able to communicate live.

### Server-Side Multilingual TTS
Add reliable speech output for languages not supported by browser voices.

### Better Indian Script OCR
Improve OCR support for handwritten and regional-language text.

### Translation History
Save previous translations.

### User Accounts
Allow users to save preferences and conversations.

### Document Translation
Upload PDFs and documents for translation.

### Mobile PWA
Make Anuvaad AI installable as a mobile application.

### Offline Support
Provide limited translation and OCR features for low-connectivity environments.

---

## 🎯 Why Anuvaad AI?

Anuvaad AI is not just a translator.

It combines:

Translation + Voice + OCR + Simplification + Context Awareness

into a single multilingual communication platform.

The project focuses on making technology easier to use for people who may face language or accessibility barriers.

---

## 👥 Team

# Cyber Runners

### Team Leader
**Prince Kumar Gupta**

### Members
- **ArKendu Kundu**
- **Archit Pande**

---

## ❤️ Built With Purpose

Anuvaad AI was built by **Team Cyber Runners** with the goal of making multilingual communication simpler, faster, and more accessible.

> Speak freely. Understand everyone.
