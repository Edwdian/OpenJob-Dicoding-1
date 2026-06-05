const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const pool = require('../utils/db');
const { NotFoundError, ConflictError, AuthenticationError } = require('../utils/errors');

const createUser = async ({ name, email, password, role }) => {
  const id = `user-${uuidv4()}`;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new ConflictError('Email already registered');
  }

  const result = await pool.query(
    'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
    [id, name, email, hashedPassword, role || 'jobseeker']
  );

  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  return result.rows[0];
};

const verifyUserCredentials = async (email, password) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new AuthenticationError('Invalid email or password');
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

module.exports = { createUser, getUserById, verifyUserCredentials };
