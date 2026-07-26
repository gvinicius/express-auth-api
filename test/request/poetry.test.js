const testConfig = require('../../testConfig');

const { request, app } = testConfig;

testConfig.config();

describe('Poetry API', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    // Low rate limit for test
    process.env.RATE_LIMIT_WINDOW_MS = '500';
    process.env.RATE_LIMIT_MAX = '2';

    // Mock fetch for providers
    global.fetch = jest.fn(async (url) => {
      const u = String(url);
      // PoetryDB
      if (u.includes('poetrydb.org')) {
        return {
          ok: true,
          json: async () => ([
            { title: 'The Waste Land', author: 'T. S. Eliot', lines: ['April is the cruellest month,', 'breeding lilacs out of the dead land;'] },
            { title: 'Ode', author: 'Fernando Pessoa', lines: ['Ó mar salgado, quanto do teu sal', 'São lágrimas de Portugal!'] }
          ])
        };
      }
      // Quotable
      if (u.includes('api.quotable.io/quotes')) {
        return {
          ok: true,
          json: async () => ({
            results: [
              {
                content: 'Poetry is when an emotion has found its thought.',
                author: 'Robert Frost',
                language: 'en',
                tags: ['poetry']
              },
              {
                content: 'Tudo vale a pena se a alma não é pequena.',
                author: 'Fernando Pessoa',
                language: 'pt',
                tags: ['poesia']
              }
            ]
          })
        };
      }
      // Poemist
      if (u.includes('poemist.com')) {
        return {
          ok: true,
          json: async () => ([
            {
              title: 'Random Poem',
              content: 'Some random poetic lines.',
              poet: { name: 'Anon' },
              tags: ['poetry']
            }
          ])
        };
      }
      // Wikisource PT: search first, then content
      if (u.includes('pt.wikisource.org') && u.includes('list=search')) {
        return {
          ok: true,
          json: async () => ({ query: { search: [{ title: 'Poema de Teste' }] } })
        };
      }
      if (u.includes('pt.wikisource.org') && u.includes('prop=revisions')) {
        return {
          ok: true,
          json: async () => ({ query: { pages: [{ revisions: [{ content: "''Poema''\nLinha A\nLinha B\n" }] }] } })
        };
      }
      // Fallback
      return { ok: true, json: async () => ([]) };
    });
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /quotes filters by author and q', async () => {
    const res = await request(app)
      .get('/quotes')
      .query({
        author: 'T. S. Eliot',
        q: 'April',
        source: 'poetrydb',
        limit: 3
      });
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    const first = res.body.results[0];
    expect(first.author).toMatch(/eliot/i);
    expect(first.text).toMatch(/April/);
  });

  it('GET /authors returns unique author names', async () => {
    const res = await request(app)
      .get('/authors')
      .query({
        source: 'poetrydb,quotable'
      });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThanOrEqual(2);
    expect(new Set(res.body.results).size).toBe(res.body.results.length);
  });

  it('applies rate limiting', async () => {
    const r1 = await request(app).get('/quotes');
    expect(r1.status).toBe(200);
    const r2 = await request(app).get('/quotes');
    expect(r2.status).toBe(200);
    const r3 = await request(app).get('/quotes');
    expect(r3.status).toBe(429);
  });
});
