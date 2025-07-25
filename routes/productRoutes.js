const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public: list products and get single product
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

// Admin: create product
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  ],
  productController.createProduct
);

// Admin: update product
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('name').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  productController.updateProduct
);

// Admin: delete product
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

module.exports = router;