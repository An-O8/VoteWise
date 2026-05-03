const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getChatResponse } = require("../services/gemini");
const { detectLanguage, translateText } = require("../services/translate");
const { logInteraction } = require("../services/firestore");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { message, sessionId, history = [], targetLang } = req.body;

    if (!message?.trim()) return res.status(400).json({ error: "Message is required." });
    if (message.length > 1000) return res.status(400).json({ error: "Message too long (max 1000 chars)." });

    const sid = sessionId || uuidv4();

    // Detect user's language for logging
    const detectedLang = await detectLanguage(message).catch(() => "en");

    // Get AI response in English
    let response = await getChatResponse(message.trim(), history);

    // Translate response if user requested a different language
    const lang = targetLang || detectedLang;
    if (lang !== "en") {
      const translated = await translateText(response, lang).catch(() => null);
      if (translated) response = translated.translatedText;
    }

    // Log to Firestore (non-blocking)
    logInteraction(sid, message.trim(), response, lang).catch(console.error);

    res.json({ sessionId: sid, response, detectedLang });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
