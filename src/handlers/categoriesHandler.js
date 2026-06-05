const express = require('express');
const router = express.Router();
const categoriesService = require('../services/categoriesService');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const { categorySchema } = require('../validators/schemas');

router.get('/', async (req, res, next) => {
  try {
    const categories = await categoriesService.getAllCategories();
    res.json({ status: 'success', data: { categories } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const category = await categoriesService.getCategoryById(req.params.id);
    res.json({ status: 'success', data: { ...category } });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, validate(categorySchema), async (req, res, next) => {
  try {
    const category = await categoriesService.createCategory(req.body);
    res.status(201).json({ status: 'success', data: { id: category.id, ...category } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, validate(categorySchema), async (req, res, next) => {
  try {
    await categoriesService.updateCategory(req.params.id, req.body);
    res.json({ status: 'success', message: 'Category updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await categoriesService.deleteCategory(req.params.id);
    res.json({ status: 'success', message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
