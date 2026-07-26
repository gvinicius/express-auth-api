const express = require('express');
require('dotenv').config();

const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');

const auth = require('./controllers/authController');
const login = require('./controllers/loginController');

app.use(compression());
app.use(bodyParser.json());

app.post('/auth', async (req, res, next) => auth.proctectRoute(req, res, next));
app.post('/signup', async (req, res, next) => login.signup(req, res, next));
app.post('/signin', async (req, res, next) => login.signin(req, res, next));

module.exports = app;
