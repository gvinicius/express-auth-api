// Provider: Poemist (https://www.poemist.com/api/v1/randompoems)
// Random poems only; limited metadata. No API key.

const BASE = 'https://www.poemist.com/api/v1';

async function search(params = {}, { fetchImpl = fetch, signal } = {}) {
  // Poemist supports only random poems; return some and then filter client-side
  const count = Math.min(Math.max(parseInt(params.limit || 5, 10) || 5, 1), 20);
  const url = `${BASE}/randompoems`;
  const res = await fetchImpl(url, { signal, headers: { 'User-Agent': 'express-auth-api/poetry' } });
  if (!res.ok) throw new Error(`poemist http ${res.status}`);
  const data = await res.json();
  const items = Array.isArray(data) ? data.slice(0, count) : [];

  let out = items.map((p) => ({
    text: (p.content || '').trim(),
    author: (p.poet && p.poet.name) || 'Unknown',
    title: p.title || undefined,
    source: 'poemist',
    language: 'en', // API appears to be mostly English
    tags: p.tags || undefined,
    url: p.url || undefined
  })).filter((x) => x.text && x.text.length);

  const { author, q, genre, lang } = params;
  if (author) {
    const alc = author.toLowerCase();
    out = out.filter((x) => x.author.toLowerCase().includes(alc));
  }
  if (q) {
    const qlc = q.toLowerCase();
    out = out.filter((x) => x.text.toLowerCase().includes(qlc)
      || (x.title || '').toLowerCase().includes(qlc));
  }
  if (genre) {
    const glc = genre.toLowerCase();
    out = out.filter((x) => Array.isArray(x.tags) && x.tags.some((t) => (t || '').toLowerCase().includes(glc)));
  }
  if (lang) {
    const llc = lang.toLowerCase();
    out = out.filter((x) => (x.language || '').toLowerCase().startsWith(llc));
  }

  return out;
}

module.exports = { key: 'poemist', search };

