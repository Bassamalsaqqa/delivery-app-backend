const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get current cart
router.get('/', protect, cartController.getCart);

// Add to cart
router.post(
  '/',
  protect,
  [
    body('productId').notEmpty().withMessage('Product ID required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  cartController.addToCart
);

// Update cart item quantity
router.put(
  '/item/:productId',
  protect,
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')],
  cartController.updateCartItem
);

// Remove cart item
router.delete('/item/:productId', protect, cartController.removeCartItem);

module.exports = router;