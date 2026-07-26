// Provider: Quotable (https://api.quotable.io)
// General quotes API. We'll restrict to poetry tag when possible.

const BASE = 'https://api.quotable.io/quotes';

function buildUrl(params = {}) {
  const qp = new URLSearchParams();
  // Always prefer poetry-related quotes
  const tags = new Set();
  if (params.genre) tags.add(params.genre);
  tags.add('poetry');
  qp.set('tags', Array.from(tags).join(','));
  if (params.author) qp.set('author', params.author);
  if (params.q) qp.set('query', params.q);
  qp.set('limit', String(Math.min(Math.max(parseInt(params.limit || 10, 10) || 10, 1), 20)));
  return `${BASE}?${qp.toString()}`;
}

async function search(params = {}, { fetchImpl = fetch, signal } = {}) {
  const url = buildUrl(params);
  const res = await fetchImpl(url, {
    signal,
    headers: { 'User-Agent': 'express-auth-api/poetry' }
  });
  if (!res.ok) throw new Error(`quotable http ${res.status}`);
  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results : [];
  let out = results.map((q) => ({
    text: q.content || '',
    author: q.author || 'Unknown',
    title: undefined,
    source: 'quotable',
    language: q.language || 'en',
    tags: q.tags || undefined,
    url: q.permalink || undefined
  })).filter((x) => x.text && x.text.length);

  if (params.lang) {
    const llc = params.lang.toLowerCase();
    out = out.filter((x) => (x.language || '').toLowerCase().startsWith(llc));
  }
  return out;
}

module.exports = { key: 'quotable', search };
