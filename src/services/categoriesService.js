const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const { NotFoundError } = require('../utils/errors');

const createCategory = async ({ name, description }) => {
  const id = `category-${uuidv4()}`;
  const result = await pool.query(
    'INSERT INTO categories (id, name, description) VALUES ($1,$2,$3) RETURNING *',
    [id, name, description]
  );
  return result.rows[0];
};

const getAllCategories = async () => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

const getCategoryById = async (id) => {
  const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  if (result.rows.length === 0) throw new NotFoundError('Category not found');
  return result.rows[0];
};

const updateCategory = async (id, { name, description }) => {
  await getCategoryById(id);
  const result = await pool.query(
    'UPDATE categories SET name=$1, description=$2, updated_at=current_timestamp WHERE id=$3 RETURNING *',
    [name, description, id]
  );
  return result.rows[0];
};

const deleteCategory = async (id) => {
  await getCategoryById(id);
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };
