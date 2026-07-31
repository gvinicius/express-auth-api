// PoetryDB poems client — full poem text (not truncated quotes)
// https://poetrydb.org

const BASE = 'https://poetrydb.org';

function clampLimit(value, fallback) {
  const n = parseInt(value, 10);
  const base = Number.isFinite(n) ? n : fallback;
  return Math.min(Math.max(base, 1), 20);
}

function buildUrl(params = {}) {
  const { title, author, q, limit } = params;
  if (title) return `${BASE}/title/${encodeURIComponent(title)}`;
  if (author) return `${BASE}/author/${encodeURIComponent(author)}`;
  if (q) return `${BASE}/lines/${encodeURIComponent(q)}`;
  const n = clampLimit(limit, 5);
  return `${BASE}/random/${n}`;
}

function normalize(poems) {
  if (!Array.isArray(poems)) return [];
  return poems.map((p) => {
    const lines = Array.isArray(p.lines)
      ? p.lines.map((l) => (l || '').trim()).filter(Boolean)
      : [];
    if (!lines.length) return null;
    const linecount = parseInt(p.linecount, 10);
    return {
      title: p.title || undefined,
      author: p.author || 'Unknown',
      lines,
      linecount: Number.isFinite(linecount) ? linecount : lines.length,
      source: 'poetrydb',
      language: 'en'
    };
  }).filter(Boolean);
}

async function fetchPoems(url, fetchImpl, abortSignal) {
  const res = await fetchImpl(url, {
    signal: abortSignal,
    headers: { 'User-Agent': 'express-auth-api/poetry' }
  });
  if (!res.ok) throw new Error(`poetrydb http ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

function matchesFilters(poem, params = {}) {
  const { title, author, q } = params;
  if (title && !(poem.title || '').toLowerCase().includes(String(title).toLowerCase())) {
    return false;
  }
  if (author && !(poem.author || '').toLowerCase().includes(String(author).toLowerCase())) {
    return false;
  }
  if (q) {
    const qlc = String(q).toLowerCase();
    const hay = [
      poem.title || '',
      poem.author || '',
      ...(poem.lines || [])
    ].join('\n').toLowerCase();
    if (!hay.includes(qlc)) return false;
  }
  return true;
}

async function list(params = {}, { fetchImpl = fetch, signal } = {}) {
  const limit = clampLimit(params.limit, 5);
  const url = buildUrl({ limit });
  const poems = await fetchPoems(url, fetchImpl, signal);
  return normalize(poems).slice(0, limit);
}

async function search(params = {}, { fetchImpl = fetch, signal } = {}) {
  const { author, title, q } = params;
  if (!author && !title && !q) {
    const err = new Error('Provide author, title, or q');
    err.code = 'VALIDATION';
    throw err;
  }
  const limit = clampLimit(params.limit, 10);
  const url = buildUrl({ author, title, q, limit });
  const poems = await fetchPoems(url, fetchImpl, signal);
  let out = normalize(poems);
  // Apply remaining params as client-side filters when endpoint was chosen by priority
  out = out.filter((p) => matchesFilters(p, { author, title, q }));
  return out.slice(0, limit);
}

module.exports = {
  BASE,
  clampLimit,
  buildUrl,
  normalize,
  list,
  search
};
