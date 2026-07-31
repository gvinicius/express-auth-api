# Poems Search API Design

Date: 2026-07-31  
Branch: `feat/poems-search-api`

## Goal

Add poem-focused HTTP endpoints that return full poem text (title, author, lines) by sampling and searching via PoetryDB, without changing the existing `/quotes*` aggregator.

## API

### `GET /poems`
Sample/random poems from PoetryDB.

Query:
- `limit` (optional, default 5, clamped 1–20)

Response:
```json
{
  "count": 1,
  "results": [
    {
      "title": "The Waste Land",
      "author": "T. S. Eliot",
      "lines": ["April is the cruellest month,", "breeding lilacs out of the dead land;"],
      "linecount": 2,
      "source": "poetrydb",
      "language": "en"
    }
  ]
}
```

### `GET /poems/search`
Search poems by author, title, and/or free-text query.

Query:
- `author` (optional) — PoetryDB `/author/:name`
- `title` (optional) — PoetryDB `/title/:title`
- `q` (optional) — PoetryDB `/lines/:q`, plus client-side filter on title/author/lines
- `limit` (optional, default 10, clamped 1–20)

At least one of `author`, `title`, or `q` is required; otherwise respond `400` with `{ "err": "Provide author, title, or q" }`.

### Errors
- Upstream/provider failures: `200` with `{ "count": 0, "results": [] }` (match quotes soft-fail)
- Rate limit: `429` via existing middleware

## Architecture

- `src/services/poetry/poems.js` — PoetryDB client returning full poems (not truncated quote text)
- `src/controllers/poemsController.js` — `list`, `search`
- `src/app.js` — mount `/poems` and `/poems/search` behind `rateLimit`
- Keep `/quotes`, `/quotes/random`, `/authors`, `/health` unchanged

### Poem shape
| Field | Type | Notes |
|-------|------|--------|
| title | string | required when present upstream |
| author | string | default `"Unknown"` |
| lines | string[] | full lines, trimmed empties removed |
| linecount | number | from upstream or `lines.length` |
| source | `"poetrydb"` | fixed for v1 |
| language | `"en"` | PoetryDB is English |

### PoetryDB URL mapping
- Random/sample: `GET https://poetrydb.org/random/:n`
- Author: `GET https://poetrydb.org/author/:author`
- Title: `GET https://poetrydb.org/title/:title`
- Lines/q: `GET https://poetrydb.org/lines/:q`

When multiple search params are provided, prefer the most specific endpoint (`title` > `author` > `q`), then apply remaining params as client-side filters.

## Testing

- Unit: URL builder, normalize, limit clamping, search-param validation helpers
- Request: mocked `global.fetch` — list, search by author/title/q, validation 400, empty upstream, rate limit
- CI: existing GitHub Actions (`lint` + `test` with Mongo service) must stay green

## Out of scope

- Multi-provider poems aggregator
- Persisting poems in MongoDB
- Changing quote truncation behavior in existing PoetryDB quote provider
