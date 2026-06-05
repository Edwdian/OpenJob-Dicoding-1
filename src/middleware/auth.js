const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new AuthenticationError('Missing authentication token'));
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AuthenticationError('Invalid token format'));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    next(new AuthenticationError('Invalid or expired token'));
  }
};

module.exports = authMiddleware;
