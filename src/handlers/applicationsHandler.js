const express = require('express');
const router = express.Router();
const applicationsService = require('../services/applicationsService');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const { applicationSchema, applicationStatusSchema } = require('../validators/schemas');
const cache = require('../utils/cache');
const { publishApplication } = require('../utils/rabbitmq');

router.use(authMiddleware);

router.post('/', validate(applicationSchema), async (req, res, next) => {
  try {
    const application = await applicationsService.createApplication(req.user.id, req.body);

    // Invalidate related caches
    await cache.del(
      `applications:user:${req.user.id}`,
      `applications:job:${application.job_id}`
    );

    // Publish to RabbitMQ
    await publishApplication(application.id);

    res.status(201).json({ status: 'success', data: { id: application.id, ...application } });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const applications = await applicationsService.getAllApplications();
    res.json({ status: 'success', data: { applications } });
  } catch (err) {
    next(err);
  }
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const cacheKey = `applications:user:${req.params.userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Data-Source', 'cache');
      return res.json({ status: 'success', data: { applications: cached } });
    }
    const applications = await applicationsService.getApplicationsByUser(req.params.userId);
    await cache.set(cacheKey, applications);
    res.setHeader('X-Data-Source', 'database');
    res.json({ status: 'success', data: { applications } });
  } catch (err) {
    next(err);
  }
});

router.get('/job/:jobId', async (req, res, next) => {
  try {
    const cacheKey = `applications:job:${req.params.jobId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Data-Source', 'cache');
      return res.json({ status: 'success', data: { applications: cached } });
    }
    const applications = await applicationsService.getApplicationsByJob(req.params.jobId);
    await cache.set(cacheKey, applications);
    res.setHeader('X-Data-Source', 'database');
    res.json({ status: 'success', data: { applications } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cacheKey = `application:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Data-Source', 'cache');
      return res.json({ status: 'success', data: cached });
    }
    const application = await applicationsService.getApplicationById(req.params.id);
    await cache.set(cacheKey, { ...application });
    res.setHeader('X-Data-Source', 'database');
    res.json({ status: 'success', data: { ...application } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(applicationStatusSchema), async (req, res, next) => {
  try {
    const application = await applicationsService.getApplicationById(req.params.id);
    await applicationsService.updateApplicationStatus(req.params.id, req.user.id, req.body.status);

    // Invalidate related caches
    await cache.del(
      `application:${req.params.id}`,
      `applications:user:${application.user_id}`,
      `applications:job:${application.job_id}`
    );

    res.json({ status: 'success', message: 'Application updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await applicationsService.deleteApplication(req.params.id, req.user.id);
    await cache.del(`application:${req.params.id}`);
    res.json({ status: 'success', message: 'Application deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
