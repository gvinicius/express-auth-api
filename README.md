# Express Auth API

A JWT-based authentication API built with Node.js and Express.js, forked from the [Heroku Node.js Getting Started](https://github.com/heroku/node-js-getting-started) example. This service provides secure user authentication and authorization for microservice architectures using MongoDB for data persistence.

## Features

- **JWT Authentication**: Secure token-based authentication using JSON Web Tokens
- **MongoDB Integration**: Uses Mongoose ODM for MongoDB data modeling and persistence
- **User Management**: Complete signup/signin flow with email validation
- **Password Security**: Bcrypt password hashing for secure credential storage
- **Protected Routes**: Middleware for route authorization
- **API Compression**: Built-in response compression for optimal performance
- **Testing Suite**: Comprehensive Jest tests with coverage reporting
- **ESLint Integration**: Airbnb style guide enforcement for code quality

## Requirements

- Node.js >= 18.x
- npm >= 9.x
- MongoDB instance (local or cloud)

## Setup

### 1. Configure MongoDB

Run MongoDB using Docker (Compose):

```bash
docker compose -f dev/mongo-compose.yml up -d mongo
# wait for healthcheck to pass
```

For testing, access the MongoDB shell:

```bash
docker exec -ti express-auth-api-mongo mongosh
use your_database_name;
exit;
```

### 2. Environment Variables

Create `.env` files for your target environments (`.env` for production, `.env.development` for development):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_jwt_secret_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Install Nodemon (Optional)

For development with hot reload:

```bash
npm install nodemon -g
```

## API Endpoints

### POST /signup
Create a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### POST /signin
Authenticate and receive a JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### POST /auth
Validate JWT token and access protected resources

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

## Development

### Run Tests

```bash
npm test
```

Tests include unit and integration tests with coverage reporting.

### Run Linter

```bash
npm run lint
```

### Fix Linting Issues

```bash
npm run lintfix
```

### Start Server

```bash
npm start
```

Server will run on `http://localhost:5000` by default (or the PORT specified in your environment variables).

## Poetry Quotes API

This service now aggregates poetry quotations from multiple open APIs and exposes unified endpoints.

- Sources: PoetryDB (classic English poetry), Poemist (random poems), Quotable (poetry-tagged quotes), Wikisource‑PT (Portuguese poems)

### GET `/quotes`
- Query params: `author`, `lang`, `genre`, `q` (free text), `source` (comma-separated: `poetrydb,poemist,quotable`), `limit`
  - You can also include `wikisource-pt` for Portuguese sources
- Example: `/quotes?author=T.S.%20Eliot&q=April&source=poetrydb,quotable`

Response:
```json
{
  "count": 2,
  "results": [
    {
      "text": "April is the cruellest month...",
      "author": "T. S. Eliot",
      "title": "The Waste Land",
      "source": "poetrydb",
      "language": "en",
      "tags": ["lines:433"]
    }
  ]
}
```

### GET `/quotes/random`
- Returns a random selection from the configured sources.
- Optional query: `source`, `limit`

### GET `/authors`
- Finds authors based on results from sources.
- Query: `author` (partial match), `source`

### GET `/health`
- Simple service health probe: `{ status: "ok" }`

Notes:
- External calls use public, no-auth endpoints. Availability may vary.
- `lang` and `genre` are supported when the upstream source provides the metadata; otherwise best-effort filtering is applied client-side.
- Simple in-memory caching (TTL via `QUOTES_CACHE_TTL_MS`) and rate limiting (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`) are enabled.

## Deployment

This application is ready for deployment on Heroku or any Node.js hosting platform. Ensure your environment variables are properly configured in your hosting provider's settings.

## Credits

This project is based on and forked from the [Heroku Node.js Getting Started](https://github.com/heroku/node-js-getting-started) example project. The original Heroku example provided the foundational structure for building Node.js applications on Heroku.

### What We Added

Building on the Heroku foundation, this project extends it with:
- JWT-based authentication system
- MongoDB integration with Mongoose ODM
- User registration and login functionality
- Password hashing with bcrypt
- Protected route middleware
- Comprehensive test suite with Jest
- Modern security updates and dependency management

We're grateful to Heroku and the open-source community for providing such excellent starting points for building web applications.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
