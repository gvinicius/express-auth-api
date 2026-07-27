const { AbortController } = global;

const poetrydb = require('./providers/poetrydb');
const poemist = require('./providers/poemist');
const quotable = require('./providers/quotable');
const wikisourcePt = require('./providers/wikisource-pt');

const providers = [poetrydb, poemist, quotable, wikisourcePt];

// Simple in-memory TTL cache for aggregate() results
const CACHE_TTL_MS = parseInt(process.env.QUOTES_CACHE_TTL_MS || '15000', 10);
const cache = new Map();

function makeKey(params) {
  const keys = Object.keys(params || {}).sort();
  const obj = {};
  keys.forEach((k) => {
    obj[k] = params[k];
  });
  return JSON.stringify(obj);
}

function pickProviders(limitTo) {
  if (!limitTo) return providers;
  const set = new Set(limitTo.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean));
  return providers.filter((p) => set.has(p.key));
}

async function aggregate(params = {}, options = {}) {
  const { source, timeoutMs = 8000 } = params;
  const selected = pickProviders(source);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort('timeout'), timeoutMs);
  try {
    const key = makeKey(params);
    const now = Date.now();
    const entry = cache.get(key);
    if (entry && entry.exp > now) return entry.val;
    const settled = await Promise.allSettled(
      selected.map((p) => p.search(
        params,
        { ...options, signal: controller.signal }
      ))
    );
    const results = [];
    settled.forEach((s, i) => {
      if (s.status === 'fulfilled' && Array.isArray(s.value)) results.push(...s.value);
      else if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`Provider ${selected[i].key} failed`, s.reason && s.reason.message);
      }
    });
    cache.set(key, { val: results, exp: now + CACHE_TTL_MS });
    return results;
  }
  finally {
    clearTimeout(t);
  }
}

module.exports = { aggregate };
