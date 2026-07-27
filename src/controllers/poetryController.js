const { aggregate } = require('../services/poetry');

const poetry = {};

poetry.health = async (req, res) => {
  res.status(200).json({ status: 'ok' });
};

poetry.getQuotes = async (req, res) => {
  const {
    author, lang, genre, q, source, limit
  } = req.query;
  try {
    const results = await aggregate({
      author, lang, genre, q, source, limit
    });
    res.status(200).json({
      count: results.length,
      results
    });
  }
  catch (e) {
    res.status(200).json({
      count: 0,
      results: []
    });
  }
};

poetry.getRandom = async (req, res) => {
  const { source, limit } = req.query;
  try {
    const results = await aggregate({
      source,
      limit
    });
    // Shuffle naive
    for (let i = results.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = results[i];
      results[i] = results[j]; // eslint-disable-line no-param-reassign
      results[j] = tmp; // eslint-disable-line no-param-reassign
    }
    res.status(200).json({
      count: results.length,
      results
    });
  }
  catch (e) {
    res.status(200).json({
      count: 0,
      results: []
    });
  }
};

poetry.searchAuthors = async (req, res) => {
  const { author, source } = req.query;
  try {
    const results = await aggregate({
      author,
      source,
      limit: 20
    });
    const authors = Array.from(new Set(results.map((r) => r.author).filter(Boolean)));
    res.status(200).json({
      count: authors.length,
      results: authors
    });
  }
  catch (e) {
    res.status(200).json({
      count: 0,
      results: []
    });
  }
};

module.exports = poetry;
