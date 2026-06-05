const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const { NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');

const createApplication = async (userId, { job_id, cover_letter }) => {
  // Check duplicate application
  const dup = await pool.query('SELECT id FROM applications WHERE user_id=$1 AND job_id=$2', [userId, job_id]);
  if (dup.rows.length > 0) throw new ConflictError('Already applied to this job');

  const id = `app-${uuidv4()}`;
  const result = await pool.query(
    'INSERT INTO applications (id, user_id, job_id, cover_letter) VALUES ($1,$2,$3,$4) RETURNING *',
    [id, userId, job_id, cover_letter]
  );
  return result.rows[0];
};

const getAllApplications = async () => {
  const result = await pool.query(
    `SELECT a.*, u.name as user_name, u.email as user_email, j.title as job_title
     FROM applications a
     JOIN users u ON a.user_id = u.id
     JOIN jobs j ON a.job_id = j.id
     ORDER BY a.created_at DESC`
  );
  return result.rows;
};

const getApplicationById = async (id) => {
  const result = await pool.query(
    `SELECT a.*, u.name as user_name, u.email as user_email, j.title as job_title
     FROM applications a
     JOIN users u ON a.user_id = u.id
     JOIN jobs j ON a.job_id = j.id
     WHERE a.id = $1`,
    [id]
  );
  if (result.rows.length === 0) throw new NotFoundError('Application not found');
  return result.rows[0];
};

const getApplicationsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT a.*, j.title as job_title, c.name as company_name
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getApplicationsByJob = async (jobId) => {
  const result = await pool.query(
    `SELECT a.*, u.name as user_name, u.email as user_email
     FROM applications a
     JOIN users u ON a.user_id = u.id
     WHERE a.job_id = $1 ORDER BY a.created_at DESC`,
    [jobId]
  );
  return result.rows;
};

const updateApplicationStatus = async (id, userId, status) => {
  // Check user owns the company that posted the job
  const app = await getApplicationById(id);
  const result = await pool.query(
    'UPDATE applications SET status=$1, updated_at=current_timestamp WHERE id=$2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

const deleteApplication = async (id, userId) => {
  const result = await pool.query('SELECT * FROM applications WHERE id=$1', [id]);
  if (result.rows.length === 0) throw new NotFoundError('Application not found');
  const app = result.rows[0];
  if (app.user_id !== userId) throw new AuthorizationError('Not authorized to delete this application');
  await pool.query('DELETE FROM applications WHERE id=$1', [id]);
};

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByUser,
  getApplicationsByJob,
  updateApplicationStatus,
  deleteApplication,
};
