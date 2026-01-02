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

Run MongoDB using Docker:

```bash
docker run -d --name mongo -p 27017:27017 \
  -v /path/to/your/data:/data/db \
  mvertes/alpine-mongo
```

For testing, access the MongoDB shell:

```bash
docker exec -ti mongo mongo
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
