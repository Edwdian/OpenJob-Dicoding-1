const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const usersService = require('../services/usersService');
const applicationsService = require('../services/applicationsService');
const bookmarksService = require('../services/bookmarksService');

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.user.id);
    res.json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/applications', async (req, res, next) => {
  try {
    const applications = await applicationsService.getApplicationsByUser(req.user.id);
    res.json({ status: 'success', data: { applications } });
  } catch (err) {
    next(err);
  }
});

router.get('/bookmarks', async (req, res, next) => {
  try {
    const bookmarks = await bookmarksService.getBookmarksByUser(req.user.id);
    res.json({ status: 'success', data: { bookmarks } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
