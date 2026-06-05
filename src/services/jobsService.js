const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

const createJob = async (userId, data) => {
  const id = `job-${uuidv4()}`;
  const { company_id, category_id, title, description, requirements, salary_min, salary_max, location, type, status } = data;

  // verify user owns company
  const companyCheck = await pool.query('SELECT id FROM companies WHERE id=$1 AND user_id=$2', [company_id, userId]);
  if (companyCheck.rows.length === 0) throw new AuthorizationError('Not authorized to post for this company');

  const result = await pool.query(
    `INSERT INTO jobs (id, company_id, category_id, title, description, requirements, salary_min, salary_max, location, type, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [id, company_id, category_id, title, description, requirements, salary_min, salary_max, location, type, status || 'open']
  );
  return result.rows[0];
};

const getAllJobs = async ({ title, 'company-name': companyName } = {}) => {
  let query = `
    SELECT j.*, c.name as company_name, c.location as company_location, cat.name as category_name
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    JOIN categories cat ON j.category_id = cat.id
    WHERE 1=1
  `;
  const params = [];

  if (title) {
    params.push(`%${title}%`);
    query += ` AND j.title ILIKE $${params.length}`;
  }

  if (companyName) {
    params.push(`%${companyName}%`);
    query += ` AND c.name ILIKE $${params.length}`;
  }

  query += ' ORDER BY j.created_at DESC';
  const result = await pool.query(query, params);
  return result.rows;
};

const getJobById = async (id) => {
  const result = await pool.query(
    `SELECT j.*, c.name as company_name, c.location as company_location, cat.name as category_name
     FROM jobs j
     JOIN companies c ON j.company_id = c.id
     JOIN categories cat ON j.category_id = cat.id
     WHERE j.id = $1`,
    [id]
  );
  if (result.rows.length === 0) throw new NotFoundError('Job not found');
  return result.rows[0];
};

const getJobsByCompany = async (companyId) => {
  const result = await pool.query(
    `SELECT j.*, c.name as company_name, cat.name as category_name
     FROM jobs j
     JOIN companies c ON j.company_id = c.id
     JOIN categories cat ON j.category_id = cat.id
     WHERE j.company_id = $1 ORDER BY j.created_at DESC`,
    [companyId]
  );
  return result.rows;
};

const getJobsByCategory = async (categoryId) => {
  const result = await pool.query(
    `SELECT j.*, c.name as company_name, cat.name as category_name
     FROM jobs j
     JOIN companies c ON j.company_id = c.id
     JOIN categories cat ON j.category_id = cat.id
     WHERE j.category_id = $1 ORDER BY j.created_at DESC`,
    [categoryId]
  );
  return result.rows;
};

const updateJob = async (id, userId, data) => {
  const job = await getJobById(id);
  const companyCheck = await pool.query('SELECT id FROM companies WHERE id=$1 AND user_id=$2', [job.company_id, userId]);
  if (companyCheck.rows.length === 0) throw new AuthorizationError('Not authorized to update this job');

  const { company_id, category_id, title, description, requirements, salary_min, salary_max, location, type, status } = data;
  const result = await pool.query(
    `UPDATE jobs SET company_id=$1, category_id=$2, title=$3, description=$4, requirements=$5,
     salary_min=$6, salary_max=$7, location=$8, type=$9, status=$10, updated_at=current_timestamp
     WHERE id=$11 RETURNING *`,
    [company_id, category_id, title, description, requirements, salary_min, salary_max, location, type, status, id]
  );
  return result.rows[0];
};

const deleteJob = async (id, userId) => {
  const job = await getJobById(id);
  const companyCheck = await pool.query('SELECT id FROM companies WHERE id=$1 AND user_id=$2', [job.company_id, userId]);
  if (companyCheck.rows.length === 0) throw new AuthorizationError('Not authorized to delete this job');
  await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
};

module.exports = { createJob, getAllJobs, getJobById, getJobsByCompany, getJobsByCategory, updateJob, deleteJob };
