const testConfig = require('../../testConfig');

const { request, app } = testConfig;

testConfig.config();

describe('Poems API', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    process.env.RATE_LIMIT_WINDOW_MS = '500';
    process.env.RATE_LIMIT_MAX = '2';

    global.fetch = jest.fn(async (url) => {
      const u = String(url);
      if (u.includes('poetrydb.org/random')) {
        return {
          ok: true,
          json: async () => ([
            {
              title: 'The Waste Land',
              author: 'T. S. Eliot',
              lines: ['April is the cruellest month,', 'breeding lilacs out of the dead land;'],
              linecount: '2'
            }
          ])
        };
      }
      if (u.includes('poetrydb.org/author/')) {
        return {
          ok: true,
          json: async () => ([
            {
              title: 'The Waste Land',
              author: 'T. S. Eliot',
              lines: ['April is the cruellest month,'],
              linecount: '1'
            },
            {
              title: 'Prufrock',
              author: 'T. S. Eliot',
              lines: ['Let us go then, you and I'],
              linecount: '1'
            }
          ])
        };
      }
      if (u.includes('poetrydb.org/title/')) {
        return {
          ok: true,
          json: async () => ([
            {
              title: 'Ozymandias',
              author: 'Percy Bysshe Shelley',
              lines: ['Look on my Works, ye Mighty, and despair!'],
              linecount: '1'
            }
          ])
        };
      }
      if (u.includes('poetrydb.org/lines/')) {
        return {
          ok: true,
          json: async () => ([
            {
              title: 'The Waste Land',
              author: 'T. S. Eliot',
              lines: ['April is the cruellest month,'],
              linecount: '1'
            }
          ])
        };
      }
      return { ok: true, json: async () => ([]) };
    });
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  it('GET /poems returns sample poems with full lines', async () => {
    const res = await request(app).get('/poems').query({ limit: 3 });
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    const first = res.body.results[0];
    expect(first.title).toBeTruthy();
    expect(Array.isArray(first.lines)).toBe(true);
    expect(first.lines.length).toBeGreaterThan(0);
    expect(first.source).toBe('poetrydb');
  });

  it('GET /poems/search requires author, title, or q', async () => {
    const res = await request(app).get('/poems/search');
    expect(res.status).toBe(400);
    expect(res.body.err).toMatch(/author, title, or q/i);
  });

  it('GET /poems/search finds poems by author', async () => {
    const res = await request(app)
      .get('/poems/search')
      .query({ author: 'T. S. Eliot', limit: 5 });
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.results.every((p) => /eliot/i.test(p.author))).toBe(true);
  });

  it('GET /poems/search finds poems by title', async () => {
    const res = await request(app)
      .get('/poems/search')
      .query({ title: 'Ozymandias' });
    expect(res.status).toBe(200);
    expect(res.body.results[0].title).toMatch(/Ozymandias/i);
    expect(res.body.results[0].lines[0]).toMatch(/Works/i);
  });

  it('GET /poems/search finds poems by q', async () => {
    const res = await request(app)
      .get('/poems/search')
      .query({ q: 'cruellest' });
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.results[0].lines.join('\n')).toMatch(/cruellest/i);
  });

  it('GET /poems soft-fails when upstream errors', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 503 }));
    const res = await request(app).get('/poems');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 0, results: [] });
  });

  it('applies rate limiting to /poems', async () => {
    const r1 = await request(app).get('/poems');
    expect(r1.status).toBe(200);
    const r2 = await request(app).get('/poems');
    expect(r2.status).toBe(200);
    const r3 = await request(app).get('/poems');
    expect(r3.status).toBe(429);
  });
});
