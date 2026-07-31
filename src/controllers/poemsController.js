const poemsService = require('../services/poetry/poems');

const poems = {};

poems.list = async (req, res) => {
  const { limit } = req.query;
  try {
    const results = await poemsService.list({ limit });
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

poems.search = async (req, res) => {
  const {
    author, title, q, limit
  } = req.query;
  if (!author && !title && !q) {
    res.status(400).json({ err: 'Provide author, title, or q' });
    return;
  }
  try {
    const results = await poemsService.search({
      author, title, q, limit
    });
    res.status(200).json({
      count: results.length,
      results
    });
  }
  catch (e) {
    if (e && e.code === 'VALIDATION') {
      res.status(400).json({ err: e.message });
      return;
    }
    res.status(200).json({
      count: 0,
      results: []
    });
  }
};

module.exports = poems;
