const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public: list categories
router.get('/', categoryController.listCategories);

// Admin: create category
router.post(
  '/',
  protect,
  authorize('admin'),
  [body('name').notEmpty().withMessage('Name is required')],
  categoryController.createCategory
);

// Admin: update category
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [body('name').optional().notEmpty()],
  categoryController.updateCategory
);

// Admin: delete category
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);

module.exports = router;