// Provider: PoetryDB (https://poetrydb.org)
// Public domain/classic English poetry. No API key required.

const BASE = 'https://poetrydb.org';

function buildUrl(params = {}) {
  const { author, q, limit } = params;
  if (author) return `${BASE}/author/${encodeURIComponent(author)}`;
  if (q) return `${BASE}/lines/${encodeURIComponent(q)}`;
  // Fallback to random poems
  const n = Math.min(Math.max(parseInt(limit || 5, 10) || 5, 1), 20);
  return `${BASE}/random/${n}`;
}

function linesToQuote(lines) {
  if (!Array.isArray(lines) || !lines.length) return '';
  const maxLen = 220;
  const out = [];
  let total = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const l = (lines[i] || '').trim();
    if (!l) continue; // eslint-disable-line no-continue
    if (total + l.length + (out.length ? 1 : 0) > maxLen) break;
    out.push(l);
    total += l.length + (out.length ? 1 : 0);
  }
  return out.join('\n');
}

async function fetchPoems(url, fetchImpl, abortSignal) {
  const res = await fetchImpl(url, { signal: abortSignal, headers: { 'User-Agent': 'express-auth-api/poetry' } });
  if (!res.ok) throw new Error(`poetrydb http ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

function normalize(poems) {
  return poems.map((p) => ({
    text: linesToQuote(p.lines),
    author: p.author || 'Unknown',
    title: p.title || undefined,
    source: 'poetrydb',
    language: 'en',
    tags: p.linecount ? [`lines:${p.linecount}`] : undefined,
    url: undefined
  })).filter((x) => x.text && x.text.length);
}

async function search(params = {}, { fetchImpl = fetch, signal } = {}) {
  const url = buildUrl(params);
  const poems = await fetchPoems(url, fetchImpl, signal);
  let out = normalize(poems);

  // Client-side filter when free search provided but endpoint returned poems (e.g., author search)
  if (params.q) {
    const qlc = params.q.toLowerCase();
    out = out.filter((q) => q.text.toLowerCase().includes(qlc)
      || (q.title || '').toLowerCase().includes(qlc)
      || (q.author || '').toLowerCase().includes(qlc));
  }
  return out;
}

module.exports = { key: 'poetrydb', search };

