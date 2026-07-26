const AbortController = global.AbortController || require('abort-controller');

const providers = [
  require('./providers/poetrydb'),
  require('./providers/poemist'),
  require('./providers/quotable')
];

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
    const settled = await Promise.allSettled(selected.map((p) => p.search(params, { ...options, signal: controller.signal })));
    const results = [];
    settled.forEach((s, i) => {
      if (s.status === 'fulfilled' && Array.isArray(s.value)) results.push(...s.value);
      else if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`Provider ${selected[i].key} failed`, s.reason && s.reason.message);
      }
    });
    return results;
  }
  finally {
    clearTimeout(t);
  }
}

module.exports = { aggregate };

