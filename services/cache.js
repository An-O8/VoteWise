const cache = new Map();
const MAX_SIZE = 100;
const TTL_MS = 30 * 60 * 1000;

/**
 * Get a cached value by key
 * @param {string} key
 * @returns {string|null}
 */
function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) { cache.delete(key); return null; }
  return entry.value;
}

/**
 * Store a value in the cache
 * @param {string} key
 * @param {string} value
 */
function set(key, value) {
  if (cache.size >= MAX_SIZE) cache.delete(cache.keys().next().value);
  cache.set(key, { value, ts: Date.now() });
}

module.exports = { get, set };