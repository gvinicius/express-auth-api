// Provider: Wikisource PT (https://pt.wikisource.org)
// Scrapes MediaWiki API search + content (best-effort) for Portuguese poems.

const API = 'https://pt.wikisource.org/w/api.php';

function buildSearchUrl(params = {}) {
  const qp = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: (params.author ? `${params.author} poema` : (params.q || 'poesia')),
    srlimit: String(Math.min(Math.max(parseInt(params.limit || 5, 10) || 5, 1), 20))
  });
  return `${API}?${qp.toString()}`;
}

function buildContentUrl(title) {
  const qp = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'revisions',
    rvprop: 'content',
    formatversion: '2',
    titles: title
  });
  return `${API}?${qp.toString()}`;
}

function wikitextToPlain(text) {
  if (!text) return '';
  let t = text;
  // Remove templates and categories
  t = t.replace(/\{\{[^}]+}}/g, '');
  t = t.replace(/\[\[Categoria:[^\]]+]]/gi, '');
  // Convert links [[Texto|Alvo]] or [[Texto]] -> Texto
  t = t.replace(/\[\[([^\]|]+)\|?([^\]]*)]]/g, (_, a, b) => (b || a));
  // Remove headings and markup
  t = t.replace(/^==+\s*(.*?)\s*==+$/gm, '$1');
  t = t.replace(/'''+(.*?)'''/g, '$1').replace(/''(.*?)''/g, '$1');
  // Trim and keep first ~220 chars by lines
  const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  let total = 0;
  const max = 220;
  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i];
    if (total + l.length + (out.length ? 1 : 0) > max) break;
    out.push(l);
    total += l.length + (out.length ? 1 : 0);
  }
  return out.join('\n');
}

async function fetchJson(url, fetchImpl, signal) {
  const res = await fetchImpl(url, { signal, headers: { 'User-Agent': 'express-auth-api/poetry' } });
  if (!res.ok) throw new Error(`wikisource-pt http ${res.status}`);
  return res.json();
}

async function fetchPageExtract(title, fetchImpl, signal) {
  try {
    const data = await fetchJson(buildContentUrl(title), fetchImpl, signal);
    const pages = (data && data.query && data.query.pages) || [];
    const rev = pages[0] && pages[0].revisions && pages[0].revisions[0];
    const content = (rev && (rev.content || rev['*'])) || '';
    return wikitextToPlain(content);
  }
  catch (e) {
    return '';
  }
}

async function search(params = {}, { fetchImpl = fetch, signal } = {}) {
  const data = await fetchJson(buildSearchUrl(params), fetchImpl, signal);
  const items = (data && data.query && Array.isArray(data.query.search)) ? data.query.search : [];
  const picked = items.slice(0, Math.min(items.length, Math.min(parseInt(params.limit || 5, 10) || 5, 20)));

  const results = [];
  for (let i = 0; i < picked.length; i += 1) {
    const it = picked[i];
    const text = await fetchPageExtract(it.title, fetchImpl, signal); // eslint-disable-line no-await-in-loop
    if (!text) continue; // eslint-disable-line no-continue
    results.push({
      text,
      author: params.author || 'Desconhecido',
      title: it.title,
      source: 'wikisource-pt',
      language: 'pt',
      tags: ['poesia'],
      url: `https://pt.wikisource.org/wiki/${encodeURIComponent(it.title.replace(/\s/g, '_'))}`
    });
  }

  return results;
}

module.exports = { key: 'wikisource-pt', search };

