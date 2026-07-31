const {
  clampLimit,
  buildUrl,
  normalize
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
});
