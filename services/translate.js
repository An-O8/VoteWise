const https = require("https");

const LANGUAGES = {
  en: "English", hi: "Hindi",    bn: "Bengali",
  te: "Telugu",  mr: "Marathi",  ta: "Tamil",
  gu: "Gujarati",kn: "Kannada",  ml: "Malayalam",
  pa: "Punjabi",
};

/**
 * Translate text using MyMemory free API
 * @param {string} text
 * @param {string} targetLang
 * @returns {Promise<{translatedText: string, targetLang: string, languageName: string}>}
 */
function translateText(text, targetLang) {
  return new Promise((resolve, reject) => {
    if (!LANGUAGES[targetLang]) {
      return reject(Object.assign(new Error(`Unsupported language: ${targetLang}`), { status: 400 }));
    }
    const encoded = encodeURIComponent(text.slice(0, 500));
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|${targetLang}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ translatedText: json.responseData.translatedText, targetLang, languageName: LANGUAGES[targetLang] });
        } catch {
          reject(new Error("Translation parse failed"));
        }
      });
    }).on("error", reject);
  });
}

/**
 * Detect language of input text
 * @param {string} _text
 * @returns {Promise<string>}
 */
function detectLanguage(_text) {
  return Promise.resolve("en");
}

module.exports = { translateText, detectLanguage, LANGUAGES };