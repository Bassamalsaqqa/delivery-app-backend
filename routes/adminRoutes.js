const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes in this file require admin
router.use(protect, authorize('admin'));

// List users
router.get('/users', adminController.listUsers);

// Change user role
router.patch(
  '/users/:id/role',
  [body('role').isIn(['user', 'admin']).withMessage('Invalid role')],
  adminController.changeUserRole
);

// List all orders
router.get('/orders', adminController.listOrders);

module.exports = router;