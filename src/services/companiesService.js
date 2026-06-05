const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

const createCompany = async (userId, { name, description, location, website, industry }) => {
  const id = `company-${uuidv4()}`;
  const result = await pool.query(
    'INSERT INTO companies (id, user_id, name, description, location, website, industry) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [id, userId, name, description, location, website, industry]
  );
  return result.rows[0];
};

const getAllCompanies = async () => {
  const result = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
  return result.rows;
};

const getCompanyById = async (id) => {
  const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
  if (result.rows.length === 0) throw new NotFoundError('Company not found');
  return result.rows[0];
};

const updateCompany = async (id, userId, data) => {
  const company = await getCompanyById(id);
  if (company.user_id !== userId) throw new AuthorizationError('Not authorized to update this company');

  const { name, description, location, website, industry } = data;
  const result = await pool.query(
    'UPDATE companies SET name=$1, description=$2, location=$3, website=$4, industry=$5, updated_at=current_timestamp WHERE id=$6 RETURNING *',
    [name, description, location, website, industry, id]
  );
  return result.rows[0];
};

const deleteCompany = async (id, userId) => {
  const company = await getCompanyById(id);
  if (company.user_id !== userId) throw new AuthorizationError('Not authorized to delete this company');
  await pool.query('DELETE FROM companies WHERE id = $1', [id]);
};

module.exports = { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany };
