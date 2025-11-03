const express = require('express');
const router = express.Router();
const CategoryService = require('../services/categoryService');

// Get all categories
router.get('/', (req, res) => {
  try {
    const categories = CategoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID
router.get('/:id', (req, res) => {
  try {
    const category = CategoryService.getCategoryById(parseInt(req.params.id));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new category
router.post('/', (req, res) => {
  try {
    const category = CategoryService.addCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update category
router.put('/:id', (req, res) => {
  try {
    const category = CategoryService.updateCategory(parseInt(req.params.id), req.body);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete category
router.delete('/:id', (req, res) => {
  try {
    const success = CategoryService.deleteCategory(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

