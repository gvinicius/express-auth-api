const {
  clampLimit,
  buildUrl,
  normalize,
  list,
  search
} = require('../../src/services/poetry/poems');

describe('poems service helpers', () => {
  describe('clampLimit', () => {
    it('uses fallback when value is missing', () => {
      expect(clampLimit(undefined, 5)).toBe(5);
    });

    it('clamps below 1 up to 1', () => {
      expect(clampLimit('0', 5)).toBe(1);
    });

    it('clamps above 20 down to 20', () => {
      expect(clampLimit(100, 5)).toBe(20);
    });

    it('parses valid numeric strings', () => {
      expect(clampLimit('7', 5)).toBe(7);
    });
  });

  describe('buildUrl', () => {
    const BASE = 'https://poetrydb.org';

    it('builds random url for list/sample', () => {
      expect(buildUrl({ limit: 3 })).toBe(`${BASE}/random/3`);
    });

    it('prefers title over author and q', () => {
      expect(buildUrl({ title: 'Ode', author: 'Keats', q: 'night' }))
        .toBe(`${BASE}/title/Ode`);
    });

    it('prefers author over q', () => {
      expect(buildUrl({ author: 'T. S. Eliot', q: 'April' }))
        .toBe(`${BASE}/author/T.%20S.%20Eliot`);
    });

    it('uses lines endpoint for q', () => {
      expect(buildUrl({ q: 'cruellest' }))
        .toBe(`${BASE}/lines/cruellest`);
    });
  });

  describe('normalize', () => {
    it('maps PoetryDB poems to full poem shape', () => {
      const out = normalize([
        {
          title: 'The Waste Land',
          author: 'T. S. Eliot',
          lines: ['April is the cruellest month,', '', 'breeding lilacs'],
          linecount: '433'
        }
      ]);
      expect(out).toEqual([
        {
          title: 'The Waste Land',
          author: 'T. S. Eliot',
          lines: ['April is the cruellest month,', 'breeding lilacs'],
          linecount: 433,
          source: 'poetrydb',
          language: 'en'
        }
      ]);
    });

    it('drops poems without lines', () => {
      expect(normalize([{ title: 'Empty', author: 'X', lines: [] }])).toEqual([]);
    });

    it('defaults missing author and derives linecount', () => {
      const out = normalize([{ title: 'Untitled', lines: ['a', 'b'] }]);
      expect(out[0].author).toBe('Unknown');
      expect(out[0].linecount).toBe(2);
    });
  });

  describe('list', () => {
    it('fetches random poems and returns normalized results', async () => {
      const fetchImpl = jest.fn(async () => ({
        ok: true,
        json: async () => ([
          {
            title: 'Ode', author: 'Keats', lines: ['My heart aches'], linecount: '1'
          }
        ])
      }));
      const out = await list({ limit: 2 }, { fetchImpl });
      expect(fetchImpl).toHaveBeenCalledWith(
        'https://poetrydb.org/random/2',
        expect.objectContaining({ headers: expect.any(Object) })
      );
      expect(out).toHaveLength(1);
      expect(out[0].lines).toEqual(['My heart aches']);
      expect(out[0].source).toBe('poetrydb');
    });
  });

  describe('search', () => {
    it('rejects when no author, title, or q provided', async () => {
      await expect(search({})).rejects.toMatchObject({ code: 'VALIDATION' });
    });

    it('searches by author and filters client-side by q', async () => {
      const fetchImpl = jest.fn(async () => ({
        ok: true,
        json: async () => ([
          { title: 'The Waste Land', author: 'T. S. Eliot', lines: ['April is the cruellest month'] },
          { title: 'Prufrock', author: 'T. S. Eliot', lines: ['Let us go then'] }
        ])
      }));
      const out = await search({ author: 'T. S. Eliot', q: 'April' }, { fetchImpl });
      expect(fetchImpl.mock.calls[0][0]).toContain('/author/');
      expect(out).toHaveLength(1);
      expect(out[0].title).toBe('The Waste Land');
    });

    it('searches by title', async () => {
      const fetchImpl = jest.fn(async () => ({
        ok: true,
        json: async () => ([
          { title: 'Ozymandias', author: 'Shelley', lines: ['Look on my Works'] }
        ])
      }));
      const out = await search({ title: 'Ozymandias' }, { fetchImpl });
      expect(fetchImpl.mock.calls[0][0]).toBe('https://poetrydb.org/title/Ozymandias');
      expect(out[0].author).toBe('Shelley');
    });

    it('throws when upstream returns non-OK status', async () => {
      const fetchImpl = jest.fn(async () => ({ ok: false, status: 500 }));
      await expect(search({ q: 'night' }, { fetchImpl })).rejects.toThrow(/poetrydb http/);
    });
  });
});
