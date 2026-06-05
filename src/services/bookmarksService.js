const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const { NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');

const createBookmark = async (userId, jobId) => {
  const dup = await pool.query('SELECT id FROM bookmarks WHERE user_id=$1 AND job_id=$2', [userId, jobId]);
  if (dup.rows.length > 0) throw new ConflictError('Job already bookmarked');

  const id = `bookmark-${uuidv4()}`;
  const result = await pool.query(
    'INSERT INTO bookmarks (id, user_id, job_id) VALUES ($1,$2,$3) RETURNING *',
    [id, userId, jobId]
  );
  return result.rows[0];
};

const getBookmarkById = async (jobId, id) => {
  const result = await pool.query(
    `SELECT b.*, j.title as job_title, c.name as company_name
     FROM bookmarks b
     JOIN jobs j ON b.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     WHERE b.id = $1 AND b.job_id = $2`,
    [id, jobId]
  );
  if (result.rows.length === 0) throw new NotFoundError('Bookmark not found');
  return result.rows[0];
};

const deleteBookmark = async (userId, jobId) => {
  const result = await pool.query(
    'DELETE FROM bookmarks WHERE user_id=$1 AND job_id=$2 RETURNING id',
    [userId, jobId]
  );
  if (result.rowCount === 0) throw new NotFoundError('Bookmark not found');
};

const getBookmarksByUser = async (userId) => {
  const result = await pool.query(
    `SELECT b.*, j.title as job_title, j.location as job_location, c.name as company_name
     FROM bookmarks b
     JOIN jobs j ON b.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getAllBookmarks = async () => {
  const result = await pool.query(
    `SELECT b.*, j.title as job_title, u.name as user_name
     FROM bookmarks b
     JOIN jobs j ON b.job_id = j.id
     JOIN users u ON b.user_id = u.id
     ORDER BY b.created_at DESC`
  );
  return result.rows;
};

module.exports = { createBookmark, getBookmarkById, deleteBookmark, getBookmarksByUser, getAllBookmarks };
