# Poems Search API Implementation Plan

> **For agentic workers:** Execute task-by-task with TDD. Frequent small commits. Use `git commit --no-gpg-sign`. Do not add Co-Authored-By or Made-with trailers.

**Goal:** Add `/poems` and `/poems/search` endpoints returning full poem text from PoetryDB, with solid automated tests and green CI.

**Architecture:** Thin PoetryDB poems service + Express controller + rate-limited routes. Reuse existing rateLimit middleware. Soft-fail upstream errors like quotes API.

**Tech Stack:** Express, native `fetch`, Jest, Supertest, PoetryDB public API

## Global Constraints

- Node >= 18.x
- No new npm dependencies
- No Co-Authored-By / Made-with trailers
- Commits with `--no-gpg-sign`
- Keep existing `/quotes*` behavior unchanged
- Soft-fail: upstream errors → `{ count: 0, results: [] }`
- Search requires at least one of `author`, `title`, `q` → else 400

---

### Task 1: Poems service — URL builder + normalize (unit tests first)

**Files:**
- Create: `src/services/poetry/poems.js`
- Create: `test/unit/poems.test.js`

**Interfaces:**
- Produces: `buildUrl(params)`, `normalize(poems)`, `clampLimit(value, fallback)`, `search(params, { fetchImpl, signal })`, `list(params, { fetchImpl, signal })`

- [ ] **Step 1: Write failing unit tests** for `clampLimit`, `buildUrl`, `normalize`
- [ ] **Step 2: Run tests — expect FAIL**
- [ ] **Step 3: Implement helpers + exports in `poems.js`**
- [ ] **Step 4: Run tests — expect PASS**
- [ ] **Step 5: Commit** `test: add unit tests for poems URL and normalize`

---

### Task 2: Poems service — list + search against PoetryDB

**Files:**
- Modify: `src/services/poetry/poems.js`
- Modify: `test/unit/poems.test.js`

- [ ] **Step 1: Write failing tests** for `list` (random) and `search` (author/title/q) with mocked fetch
- [ ] **Step 2: Run — expect FAIL**
- [ ] **Step 3: Implement `list` and `search`**
- [ ] **Step 4: Run — expect PASS**
- [ ] **Step 5: Commit** `feat: add PoetryDB poems list and search service`

---

### Task 3: Controller + routes

**Files:**
- Create: `src/controllers/poemsController.js`
- Modify: `src/app.js`
- Create: `test/request/poems.test.js`

- [ ] **Step 1: Write failing request tests** for GET `/poems`, GET `/poems/search`, 400 validation, soft-fail, rate limit
- [ ] **Step 2: Run — expect FAIL**
- [ ] **Step 3: Implement controller and wire routes**
- [ ] **Step 4: Run — expect PASS**
- [ ] **Step 5: Commit** `feat: expose /poems and /poems/search endpoints`

---

### Task 4: Docs + CI verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document `/poems` and `/poems/search` in README**
- [ ] **Step 2: Commit** `docs: document poems search API`
- [ ] **Step 3: Run `npm run lint` and `npm test`**
- [ ] **Step 4: Fix any failures; commit fixes separately if needed**

---

### Task 5: Final verify

- [ ] Run full `npm run lint && npm test`
- [ ] Confirm no regressions in existing poetry/auth tests
