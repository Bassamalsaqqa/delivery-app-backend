const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
console.log('Register is:', typeof authController.register); // should log 'function'
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.register
);

// Login using email or phone in `identifier`
router.post(
  '/login',
  [
    body('identifier').notEmpty().withMessage('Email or phone required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  authController.login
);

// Save FCM token
router.post('/fcm-token', protect, authController.saveFcmToken);

module.exports = router;