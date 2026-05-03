const express = require("express");
const { synthesize, cloudTTSAvailable } = require("../services/tts");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { text, lang = "en" } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required." });

    if (!cloudTTSAvailable()) {
      return res.json({ audioContent: null, format: null, fallback: "webspeech" });
    }

    const audioBase64 = await synthesize(text.trim(), lang);
    res.json({ audioContent: audioBase64, format: "mp3", fallback: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;