const request = require("supertest");

jest.mock("../services/gemini", () => ({
  getChatResponse: jest.fn().mockResolvedValue("Voter registration requires Form 6 at voterportal.eci.gov.in."),
}));

jest.mock("../services/translate", () => ({
  translateText: jest.fn().mockResolvedValue({ translatedText: "मतदाता पंजीकरण", targetLang: "hi", languageName: "Hindi" }),
  detectLanguage: jest.fn().mockResolvedValue("en"),
  LANGUAGES: { en: "English", hi: "Hindi" },
}));

jest.mock("../services/tts", () => ({
  synthesize: jest.fn().mockResolvedValue("bW9ja2F1ZGlv"),
}));

jest.mock("../services/firestore", () => ({
  logInteraction: jest.fn().mockResolvedValue(undefined),
  getHistory: jest.fn().mockResolvedValue([
    { id: "1", sessionId: "sess-1", userMessage: "How to vote?", botResponse: "Visit ECI.", lang: "en", timestamp: "2024-01-01T00:00:00.000Z" },
  ]),
}));

const app = require("../server");

// ── Health ──────────────────────────────────────────────────────
describe("GET /api/health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

// ── Chat ────────────────────────────────────────────────────────
describe("POST /api/chat", () => {
  it("responds with AI message and sessionId", async () => {
    const res = await request(app).post("/api/chat").send({ message: "How do I register to vote?" });
    expect(res.status).toBe(200);
    expect(res.body.response).toBeDefined();
    expect(res.body.sessionId).toBeDefined();
  });

  it("reuses provided sessionId", async () => {
    const res = await request(app).post("/api/chat").send({ message: "What is EVM?", sessionId: "test-123" });
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBe("test-123");
  });

  it("translates when targetLang is set", async () => {
    const res = await request(app).post("/api/chat").send({ message: "What is EVM?", targetLang: "hi" });
    expect(res.status).toBe(200);
  });

  it("returns 400 for empty message", async () => {
    const res = await request(app).post("/api/chat").send({ message: "" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing message", async () => {
    const res = await request(app).post("/api/chat").send({});
    expect(res.status).toBe(400);
  });

  it("returns 400 when message exceeds 1000 chars", async () => {
    const res = await request(app).post("/api/chat").send({ message: "x".repeat(1001) });
    expect(res.status).toBe(400);
  });
});

// ── Translate ───────────────────────────────────────────────────
describe("POST /api/translate", () => {
  it("translates text", async () => {
    const res = await request(app).post("/api/translate").send({ text: "Election", targetLang: "hi" });
    expect(res.status).toBe(200);
    expect(res.body.translatedText).toBeDefined();
  });

  it("returns 400 for missing text", async () => {
    const res = await request(app).post("/api/translate").send({ targetLang: "hi" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing targetLang", async () => {
    const res = await request(app).post("/api/translate").send({ text: "Election" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/translate/languages", () => {
  it("returns language list", async () => {
    const res = await request(app).get("/api/translate/languages");
    expect(res.status).toBe(200);
    expect(res.body.languages.en).toBe("English");
  });
});

// ── TTS ─────────────────────────────────────────────────────────
describe("POST /api/tts", () => {
  it("returns base64 audio", async () => {
    const res = await request(app).post("/api/tts").send({ text: "How to vote", lang: "en" });
    expect(res.status).toBe(200);
    expect(res.body.audioContent).toBeDefined();
    expect(res.body.format).toBe("mp3");
  });

  it("returns 400 for missing text", async () => {
    const res = await request(app).post("/api/tts").send({});
    expect(res.status).toBe(400);
  });

  it("defaults lang to en when not provided", async () => {
    const res = await request(app).post("/api/tts").send({ text: "Voting matters" });
    expect(res.status).toBe(200);
  });
});

// ── History ─────────────────────────────────────────────────────
describe("GET /api/history/:sessionId", () => {
  it("returns session history", async () => {
    const res = await request(app).get("/api/history/sess-1");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.history)).toBe(true);
    expect(res.body.history[0].userMessage).toBeDefined();
  });

  it("returns 400 for oversized session ID", async () => {
    const res = await request(app).get(`/api/history/${"x".repeat(101)}`);
    expect(res.status).toBe(400);
  });
});

// ── Security middleware ──────────────────────────────────────────
describe("Security", () => {
  it("strips null bytes from input", async () => {
    const res = await request(app).post("/api/chat").send({ message: "How\x00 to vote?" });
    expect(res.status).toBe(200);
  });

  it("rejects message exceeding 1000 chars", async () => {
    const res = await request(app).post("/api/chat").send({ message: "x".repeat(1001) });
    expect(res.status).toBe(400);
  });

  it("health check returns uptime", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(typeof res.body.uptime).toBe("number");
  });
});