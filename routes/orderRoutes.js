const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List orders for current user
router.get('/', protect, orderController.getUserOrders);

// Create order
router.post(
  '/',
  protect,
  [
    body('paymentMethod').optional().isIn(['cash', 'credit_card', 'online']).withMessage('Invalid payment method'),
    // If items provided, ensure array of objects with product and quantity
    body('items').optional().isArray().withMessage('Items must be an array'),
  ],
  orderController.createOrder
);

// Cancel order (user or admin)
router.delete('/:id', protect, orderController.cancelOrder);

// Update order status (admin)
router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  [
    body('status').optional().isIn(['pending', 'preparing', 'delivering', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('paymentStatus').optional().isIn(['pending', 'paid', 'failed']).withMessage('Invalid payment status'),
  ],
  orderController.updateOrderStatus
);

module.exports = router;