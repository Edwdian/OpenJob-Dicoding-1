const express = require('express');
const router = express.Router();
const bookmarksService = require('../services/bookmarksService');
const authMiddleware = require('../middleware/auth');
const cache = require('../utils/cache');

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const cacheKey = `bookmarks:user:${req.user.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Data-Source', 'cache');
      return res.json({ status: 'success', data: { bookmarks: cached } });
    }
    const bookmarks = await bookmarksService.getBookmarksByUser(req.user.id);
    await cache.set(cacheKey, bookmarks);
    res.setHeader('X-Data-Source', 'database');
    res.json({ status: 'success', data: { bookmarks } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
