const express = require('express');
require('dotenv').config();

const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');

const auth = require('./controllers/authController');
const login = require('./controllers/loginController');
const poetry = require('./controllers/poetryController');
const poems = require('./controllers/poemsController');
const rateLimit = require('./middleware/rateLimit');

app.use(compression());
app.use(bodyParser.json());

app.post('/auth', async (req, res, next) => auth.proctectRoute(req, res, next));
app.post('/signup', async (req, res, next) => login.signup(req, res, next));
app.post('/signin', async (req, res, next) => login.signin(req, res, next));

// Poetry routes (rate limited)
app.get('/health', poetry.health);
app.get('/quotes', rateLimit, poetry.getQuotes);
app.get('/quotes/random', rateLimit, poetry.getRandom);
app.get('/authors', rateLimit, poetry.searchAuthors);

// Poems routes (full text via PoetryDB)
app.get('/poems', rateLimit, poems.list);
app.get('/poems/search', rateLimit, poems.search);

module.exports = app;
