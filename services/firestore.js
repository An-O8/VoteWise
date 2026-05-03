let db = null;
let Firestore = null;

try {
  if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const firestoreModule = require("@google-cloud/firestore");
    Firestore = firestoreModule.Firestore;
    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    console.log("[firestore] Connected to Google Cloud Firestore");
  } else {
    console.log("[firestore] No credentials — interactions will not be persisted");
  }
} catch (e) {
  console.warn("[firestore] Firestore unavailable:", e.message);
}

async function logInteraction(sessionId, userMessage, botResponse, lang) {
  if (!db) return;
  await db.collection("interactions").add({
    sessionId, userMessage, botResponse, lang,
    timestamp: Firestore.Timestamp.now(),
  });
}

async function getHistory(sessionId) {
  if (!db) return [];
  const snap = await db
    .collection("interactions")
    .where("sessionId", "==", sessionId)
    .orderBy("timestamp", "asc")
    .limit(50)
    .get();
  return snap.docs.map((d) => ({
    id: d.id, ...d.data(),
    timestamp: d.data().timestamp.toDate().toISOString(),
  }));
}

module.exports = { logInteraction, getHistory, firestoreAvailable: () => !!db };