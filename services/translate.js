const { translateWithGemini } = require("./gemini");

let cloudTranslateClient = null;
try {
  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    const { Translate } = require("@google-cloud/translate").v2;
    cloudTranslateClient = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });
    console.log("[translate] Using Google Cloud Translation API");
  } else {
    console.log("[translate] No Cloud Translate key — using Gemini translation fallback");
  }
} catch (e) {
  console.warn("[translate] Cloud Translate unavailable:", e.message);
}

const LANGUAGES = {
  en: "English",  hi: "Hindi",    bn: "Bengali",
  te: "Telugu",   mr: "Marathi",  ta: "Tamil",
  gu: "Gujarati", kn: "Kannada",  ml: "Malayalam",
  pa: "Punjabi",
};

async function translateText(text, targetLang) {
  if (!LANGUAGES[targetLang]) {
    throw Object.assign(new Error(`Unsupported language: ${targetLang}`), { status: 400 });
  }

  if (cloudTranslateClient) {
    const [translated] = await cloudTranslateClient.translate(text, targetLang);
    return { translatedText: translated, targetLang, languageName: LANGUAGES[targetLang], provider: "google-cloud" };
  }

  const translated = await translateWithGemini(text, LANGUAGES[targetLang]);
  return { translatedText: translated, targetLang, languageName: LANGUAGES[targetLang], provider: "gemini" };
}

async function detectLanguage(text) {
  if (cloudTranslateClient) {
    const [result] = await cloudTranslateClient.detect(text);
    return result.language;
  }
  return "en";
}

module.exports = { translateText, detectLanguage, LANGUAGES };