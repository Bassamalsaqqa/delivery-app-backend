const { validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * List all users (admin only).
 */
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Change a user's role (admin only). Accepts {role: 'user'|'admin'}.
 */
exports.changeUserRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = req.body.role;
    await user.save();
    res.json({ message: 'User role updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * List all orders (admin only). Proxy to orderController.getAllOrders.
 */
exports.listOrders = async (req, res, next) => {
  return require('./orderController').getAllOrders(req, res, next);
};