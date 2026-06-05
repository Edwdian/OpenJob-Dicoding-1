const jwt = require('jsonwebtoken');
const pool = require('../utils/db');
const { AuthenticationError, ClientError } = require('../utils/errors');

const generateAccessToken = (payload) => jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' });
const generateRefreshToken = (payload) => jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);

const saveRefreshToken = async (token) => {
  await pool.query('INSERT INTO authentications (token) VALUES ($1)', [token]);
};

const verifyRefreshToken = async (token) => {
  // Check if it's even a valid JWT first (signed with refresh key)
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
  } catch {
    // Token not signed with refresh key → 400 (bad request / invalid token)
    throw new ClientError('Invalid refresh token', 400);
  }

  // Check if token exists in DB
  const result = await pool.query('SELECT token FROM authentications WHERE token = $1', [token]);
  if (result.rows.length === 0) {
    // Not in DB (e.g. access token passed as refresh token) → 400
    throw new ClientError('Refresh token not found', 400);
  }

  return { id: decoded.id };
};

const deleteRefreshToken = async (token) => {
  const result = await pool.query('DELETE FROM authentications WHERE token = $1', [token]);
  if (result.rowCount === 0) {
    throw new ClientError('Refresh token not found', 400);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
};
