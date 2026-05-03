const express = require("express");
const { translateText, LANGUAGES } = require("../services/translate");

const router = express.Router();

router.get("/languages", (_req, res) => res.json({ languages: LANGUAGES }));

router.post("/", async (req, res, next) => {
  try {
    const { text, targetLang } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required." });
    if (!targetLang) return res.status(400).json({ error: "targetLang is required." });

    const result = await translateText(text.trim(), targetLang);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
