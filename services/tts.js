let cloudTTSClient = null;
try {
  if (process.env.GOOGLE_TTS_API_KEY) {
    const textToSpeech = require("@google-cloud/text-to-speech");
    cloudTTSClient = new textToSpeech.TextToSpeechClient({ apiKey: process.env.GOOGLE_TTS_API_KEY });
    console.log("[tts] Using Google Cloud Text-to-Speech API");
  } else {
    console.log("[tts] No Cloud TTS key — client will use Web Speech API fallback");
  }
} catch (e) {
  console.warn("[tts] Cloud TTS unavailable:", e.message);
}

const VOICES = {
  en: { languageCode: "en-IN", name: "en-IN-Wavenet-A" },
  hi: { languageCode: "hi-IN", name: "hi-IN-Wavenet-A" },
  ta: { languageCode: "ta-IN", name: "ta-IN-Wavenet-A" },
  te: { languageCode: "te-IN", name: "te-IN-Wavenet-A" },
  bn: { languageCode: "bn-IN", name: "bn-IN-Wavenet-A" },
  mr: { languageCode: "mr-IN", name: "mr-IN-Wavenet-A" },
  gu: { languageCode: "gu-IN", name: "gu-IN-Wavenet-A" },
  kn: { languageCode: "kn-IN", name: "kn-IN-Wavenet-A" },
  ml: { languageCode: "ml-IN", name: "ml-IN-Wavenet-A" },
};

async function synthesize(text, lang = "en") {
  if (!cloudTTSClient) return null;

  const voice = VOICES[lang] || VOICES.en;
  const [response] = await cloudTTSClient.synthesizeSpeech({
    input: { text: text.slice(0, 5000) },
    voice: { ...voice, ssmlGender: "FEMALE" },
    audioConfig: { audioEncoding: "MP3", speakingRate: 0.9 },
  });
  return response.audioContent.toString("base64");
}

module.exports = { synthesize, cloudTTSAvailable: () => !!cloudTTSClient };