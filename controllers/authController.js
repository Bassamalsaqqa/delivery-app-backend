const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Generate JWT token for a user.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Register a new user.
 * If no admin exists yet, the first registered user will be assigned the "admin" role.
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    // Automatically assign 'admin' to the first user if no admin exists
    const role = existingAdmin ? 'user' : 'admin';

    // Create the user with the determined role
    const user = await User.create({ name, email, phone, password, role });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Login an existing user with email or phone and password.
 */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Save an FCM token for the authenticated user.
 */
exports.saveFcmToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'FCM token is required' });

  try {
    if (!req.user.fcmTokens.includes(token)) {
      req.user.fcmTokens.push(token);
      await req.user.save();
    }
    res.json({ message: 'FCM token saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
