const express = require('express');
const router = express.Router();
const usersService = require('../services/usersService');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const { registerSchema } = require('../validators/schemas');
const cache = require('../utils/cache');

router.post('/', validate(registerSchema), async (req, res, next) => {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json({
      status: 'success',
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cacheKey = `user:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Data-Source', 'cache');
      return res.json({ status: 'success', data: cached });
    }

    const user = await usersService.getUserById(req.params.id);
    const data = {
      id: user.id, name: user.name, email: user.email,
      role: user.role, created_at: user.created_at, updated_at: user.updated_at,
    };
    await cache.set(cacheKey, data);
    res.setHeader('X-Data-Source', 'database');
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
