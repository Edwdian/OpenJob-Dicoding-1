const { v4: uuidv4 } = require('uuid');
const pool = require('../utils/db');
const { NotFoundError, AuthorizationError } = require('../utils/errors');
const path = require('path');
const fs = require('fs');

const uploadDocument = async (userId, file) => {
  const id = `doc-${uuidv4()}`;
  const result = await pool.query(
    'INSERT INTO documents (id, user_id, name, file_path, file_type) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [id, userId, file.originalname, file.path, file.mimetype]
  );
  return result.rows[0];
};

const getAllDocuments = async () => {
  const result = await pool.query(
    'SELECT d.*, u.name as user_name FROM documents d JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC'
  );
  return result.rows;
};

const getDocumentById = async (id) => {
  const result = await pool.query(
    'SELECT d.*, u.name as user_name FROM documents d JOIN users u ON d.user_id = u.id WHERE d.id = $1',
    [id]
  );
  if (result.rows.length === 0) throw new NotFoundError('Document not found');
  return result.rows[0];
};

const deleteDocument = async (id, userId) => {
  const result = await pool.query('SELECT * FROM documents WHERE id=$1', [id]);
  if (result.rows.length === 0) throw new NotFoundError('Document not found');
  const doc = result.rows[0];
  if (doc.user_id !== userId) throw new AuthorizationError('Not authorized to delete this document');

  // Delete file from disk
  try {
    fs.unlinkSync(doc.file_path);
  } catch (e) {
    // File may not exist
  }

  await pool.query('DELETE FROM documents WHERE id=$1', [id]);
};

module.exports = { uploadDocument, getAllDocuments, getDocumentById, deleteDocument };
