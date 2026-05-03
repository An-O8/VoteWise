const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getChatResponse } = require("../services/gemini");
const { translateText } = require("../services/translate");
const { logInteraction } = require("../services/firestore");
const cache = require("../services/cache");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { message, sessionId, history = [], targetLang = "en" } = req.body;

    if (!message?.trim()) return res.status(400).json({ error: "Message is required." });
    if (message.length > 1000) return res.status(400).json({ error: "Message too long (max 1000 chars)." });

    const sid = sessionId || uuidv4();
    const trimmed = message.trim();

    const cacheKey = `${trimmed}::${targetLang}`;
    const cached = history.length === 0 ? cache.get(cacheKey) : null;

    let response;
    if (cached) {
      response = cached;
    } else {
      response = await getChatResponse(trimmed, history);
      if (targetLang !== "en") {
        const translated = await translateText(response, targetLang).catch(() => null);
        if (translated) response = translated.translatedText;
      }
      if (history.length === 0) cache.set(cacheKey, response);
    }

    logInteraction(sid, trimmed, response, targetLang).catch(console.error);

    res.json({ sessionId: sid, response, detectedLang: targetLang });
  } catch (err) {
    next(err);
  }
});

module.exports = router;