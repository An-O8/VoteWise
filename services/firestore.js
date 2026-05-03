const store = new Map();

/**
 * Log a chat interaction for a session
 * @param {string} sessionId
 * @param {string} userMessage
 * @param {string} botResponse
 * @param {string} lang
 */
function logInteraction(sessionId, userMessage, botResponse, lang) {
  if (!store.has(sessionId)) store.set(sessionId, []);
  store.get(sessionId).push({
    id: Date.now().toString(),
    sessionId,
    userMessage,
    botResponse,
    lang,
    timestamp: new Date().toISOString(),
  });
  return Promise.resolve();
}

/**
 * Retrieve interaction history for a session
 * @param {string} sessionId
 * @returns {Promise<Array>}
 */
function getHistory(sessionId) {
  return Promise.resolve(store.get(sessionId) || []);
}

module.exports = { logInteraction, getHistory };