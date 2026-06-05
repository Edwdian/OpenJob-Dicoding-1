const express = require('express');
const router = express.Router();
const companiesService = require('../services/companiesService');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const { companySchema } = require('../validators/schemas');
const cache = require('../utils/cache');

router.get('/', async (req, res, next) => {
  try {
    const companies = await companiesService.getAllCompanies();
    res.json({ status: 'success', data: { companies } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cacheKey = `company:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Data-Source', 'cache');
      return res.json({ status: 'success', data: cached });
    }
    const company = await companiesService.getCompanyById(req.params.id);
    await cache.set(cacheKey, { ...company });
    res.setHeader('X-Data-Source', 'database');
    res.json({ status: 'success', data: { ...company } });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, validate(companySchema), async (req, res, next) => {
  try {
    const company = await companiesService.createCompany(req.user.id, req.body);
    res.status(201).json({ status: 'success', data: { id: company.id, ...company } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, validate(companySchema), async (req, res, next) => {
  try {
    await companiesService.updateCompany(req.params.id, req.user.id, req.body);
    await cache.del(`company:${req.params.id}`);
    res.json({ status: 'success', message: 'Company updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await companiesService.deleteCompany(req.params.id, req.user.id);
    await cache.del(`company:${req.params.id}`);
    res.json({ status: 'success', message: 'Company deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
