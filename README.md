# 🗳️ VoteWise — AI Election Education Assistant

Multilingual AI chatbot educating citizens about India's election process.  
Built for **PromptWars Virtual Hackathon** · *Election Process Education* vertical.

---

## Chosen Vertical
**Election Process Education** — Helping every citizen understand voting rights, registration, EVMs, and democratic participation in their native language.

---

## Approach & Logic

1. User asks a question via chat UI
2. **Google Translate** detects the input language
3. **Google Gemini 1.5 Flash** generates a factual, non-partisan answer
4. If a non-English language is selected, response is **translated** automatically
5. Interaction is **logged to Firestore** for session continuity
6. User can click 🔊 to hear the answer via **Google Text-to-Speech**

---

## Google Services

| Service | Package | Role |
|---|---|---|
| Gemini 1.5 Flash | `@google/generative-ai` | Core AI responses |
| Cloud Translation API | `@google-cloud/translate` | Language detection + translation into 10 Indian languages |
| Cloud Text-to-Speech | `@google-cloud/text-to-speech` | Audio responses in 9 Indian language voices |
| Cloud Firestore | `@google-cloud/firestore` | Session logging and history retrieval |

---

## Project Structure

```
votewise/
├── server.js
├── middleware/
│   ├── rateLimiter.js
│   └── errorHandler.js
├── routes/
│   ├── chat.js
│   ├── translate.js
│   ├── tts.js
│   └── history.js
├── services/
│   ├── gemini.js
│   ├── translate.js
│   ├── tts.js
│   └── firestore.js
├── public/
│   └── index.html
├── tests/
│   └── routes.test.js
├── Dockerfile
└── .env.example
```

---

## Setup

```bash
git clone <repo-url> && cd votewise
npm install
cp .env.example .env        # fill in API keys
node server.js              # visit http://localhost:8080
```

## Tests

```bash
npm test
```

## Deploy to Cloud Run

```bash
gcloud run deploy votewise --source . --allow-unauthenticated --region=asia-south1
```

---

## Security
- `helmet` for HTTP headers
- Rate limiting: 100 req / 15 min per IP
- Input validation and length limits on all routes
- Non-root Docker user
- All secrets via environment variables — never committed

---

## Assumptions
- AI is focused on Indian elections; can discuss other democracies when asked
- System prompt enforces strict political neutrality
- TTS capped at 800 chars per request to respect quota
- Sessions identified by server-generated UUID
