const express = require('express');
const router = express.Router();
const jobsService = require('../services/jobsService');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const bookmarksService = require('../services/bookmarksService');
const { jobSchema } = require('../validators/schemas');
const cache = require('../utils/cache');

// PUBLIC - specific routes first
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const jobs = await jobsService.getJobsByCompany(req.params.companyId);
    res.json({ status: 'success', data: { jobs } });
  } catch (err) {
    next(err);
  }
});

router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const jobs = await jobsService.getJobsByCategory(req.params.categoryId);
    res.json({ status: 'success', data: { jobs } });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const jobs = await jobsService.getAllJobs(req.query);
    res.json({ status: 'success', data: { jobs } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const job = await jobsService.getJobById(req.params.id);
    res.json({ status: 'success', data: { ...job } });
  } catch (err) {
    next(err);
  }
});

// PROTECTED
router.post('/', authMiddleware, validate(jobSchema), async (req, res, next) => {
  try {
    const job = await jobsService.createJob(req.user.id, req.body);
    res.status(201).json({ status: 'success', data: { id: job.id, ...job } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, validate(jobSchema), async (req, res, next) => {
  try {
    await jobsService.updateJob(req.params.id, req.user.id, req.body);
    res.json({ status: 'success', message: 'Job updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await jobsService.deleteJob(req.params.id, req.user.id);
    res.json({ status: 'success', message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Bookmark sub-routes
router.post('/:jobId/bookmark', authMiddleware, async (req, res, next) => {
  try {
    const bookmark = await bookmarksService.createBookmark(req.user.id, req.params.jobId);
    await cache.del(`bookmarks:user:${req.user.id}`);
    res.status(201).json({ status: 'success', data: { id: bookmark.id, ...bookmark } });
  } catch (err) {
    next(err);
  }
});

router.get('/:jobId/bookmark/:id', authMiddleware, async (req, res, next) => {
  try {
    const bookmark = await bookmarksService.getBookmarkById(req.params.jobId, req.params.id);
    res.json({ status: 'success', data: { ...bookmark } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:jobId/bookmark', authMiddleware, async (req, res, next) => {
  try {
    await bookmarksService.deleteBookmark(req.user.id, req.params.jobId);
    await cache.del(`bookmarks:user:${req.user.id}`);
    res.json({ status: 'success', message: 'Bookmark deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
