const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get current user's profile
router.get('/', protect, profileController.getProfile);

// Update profile
router.put('/', protect, profileController.updateProfile);

// Add address
router.post(
  '/address',
  protect,
  [
    body('street').notEmpty().withMessage('Street required'),
    body('city').notEmpty().withMessage('City required'),
  ],
  profileController.addAddress
);

// Update address
router.put(
  '/address/:id',
  protect,
  [
    body('street').optional().notEmpty(),
    body('city').optional().notEmpty(),
  ],
  profileController.updateAddress
);

// Delete address
router.delete('/address/:id', protect, profileController.deleteAddress);

// Notifications
router.get('/notifications', protect, profileController.getNotifications);
router.patch('/notifications/:id/read', protect, profileController.markNotificationRead);

module.exports = router;