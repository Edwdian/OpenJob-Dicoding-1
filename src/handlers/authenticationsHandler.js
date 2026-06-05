const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const usersService = require('../services/usersService');
const validate = require('../middleware/validate');
const { loginSchema, refreshTokenSchema } = require('../validators/schemas');

// Login
router.post('/', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await usersService.verifyUserCredentials(email, password);

    const accessToken = authService.generateAccessToken({ id: user.id });
    const refreshToken = authService.generateRefreshToken({ id: user.id });
    await authService.saveRefreshToken(refreshToken);

    res.status(201).json({
      status: 'success',
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
});

// Refresh token
router.put('/', validate(refreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const { id } = await authService.verifyRefreshToken(refreshToken);
    const accessToken = authService.generateAccessToken({ id });
    res.json({ status: 'success', data: { accessToken } });
  } catch (err) {
    next(err);
  }
});

// Logout
router.delete('/', validate(refreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.deleteRefreshToken(refreshToken);
    res.json({ status: 'success', message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
