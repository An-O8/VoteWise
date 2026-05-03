# 🗳️ VoteWise — AI Election Education Assistant

Multilingual AI chatbot educating citizens about India's election process.  
Built for **PromptWars Virtual Hackathon** · *Election Process Education* vertical.

---

## Chosen Vertical
**Election Process Education** — Helping every citizen understand voting rights, registration, EVMs, and democratic participation in their native language.

---

## Approach & Logic

1. User asks a question via chat UI
2. **Google Gemini 1.5 Flash** generates a factual, non-partisan answer
3. If a non-English language is selected, response is **translated** via MyMemory API
4. User can click 🔊 to hear the answer via **browser Text-to-Speech**
5. Interaction is **logged in-memory** for session continuity
6. Repeated questions are served instantly from **response cache**

---

## Google Services

| Service | Package | Role |
|---|---|---|
| Gemini 1.5 Flash | `@google/generative-ai` | Core AI responses |
| Cloud Translation API | `@google-cloud/translate` | Translation into 10 Indian languages |
| Cloud Text-to-Speech | `@google-cloud/text-to-speech` | Audio responses in 9 Indian language voices |
| Cloud Firestore | `@google-cloud/firestore` | Session logging and history retrieval |

---

## Project Structure

```
votewise/
├── server.js
├── middleware/
│   ├── rateLimiter.js
│   ├── errorHandler.js
│   └── security.js
├── routes/
│   ├── chat.js
│   ├── translate.js
│   ├── tts.js
│   └── history.js
├── services/
│   ├── gemini.js
│   ├── translate.js
│   ├── tts.js
│   ├── firestore.js
│   └── cache.js
├── public/
│   └── index.html
├── tests/
│   └── routes.test.js
├── .eslintrc.json
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

## Lint

```bash
npm run lint
```

## Deploy to Render

Connect your GitHub repo at render.com → New Web Service  
Set start command: `node server.js`  
Add env var: `GEMINI_API_KEY`

---

## Security
- `helmet` with full Content Security Policy
- Rate limiting: 100 req / 15 min per IP
- Input sanitization — strips null bytes and control characters
- Parameter pollution prevention
- `x-powered-by` header disabled
- Non-root Docker user
- All secrets via environment variables — never committed

---

## Accessibility
- Skip-to-content link for keyboard users
- ARIA live regions for screen reader announcements
- Full keyboard navigation support
- Text-to-Speech in 9 Indian languages
- Dynamic `lang` attribute updates on language change
- High contrast UI with focus indicators

---

## Assumptions
- AI focused on Indian elections; can discuss other democracies when asked
- System prompt enforces strict political neutrality
- Sessions identified by server-generated UUID
- Response cache TTL: 30 minutes, max 100 entries