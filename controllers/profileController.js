const { validationResult } = require('express-validator');
const Notification = require('../models/Notification');

/**
 * Get the authenticated user's profile.
 */
exports.getProfile = async (req, res) => {
  res.json(req.user);
};

/**
 * Update the authenticated user's profile (name, email, phone).
 */
exports.updateProfile = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    if (name) req.user.name = name;
    if (email) req.user.email = email;
    if (phone) req.user.phone = phone;
    await req.user.save();
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Add a new address to the user's list of addresses.
 */
exports.addAddress = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { label, street, city, coordinates, isDefault } = req.body;
  try {
    if (isDefault) {
      // Unset previous default
      req.user.addresses.forEach((addr) => (addr.isDefault = false));
    }
    req.user.addresses.push({ label, street, city, coordinates, isDefault });
    await req.user.save();
    res.status(201).json(req.user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update an address by ID.
 */
exports.updateAddress = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const address = req.user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    Object.assign(address, req.body);
    if (req.body.isDefault) {
      req.user.addresses.forEach((addr) => {
        if (!addr._id.equals(address._id)) addr.isDefault = false;
      });
    }
    await req.user.save();
    res.json(req.user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Remove an address by ID.
 */
exports.deleteAddress = async (req, res) => {
  try {
    const address = req.user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    address.remove();
    await req.user.save();
    res.json(req.user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * List notifications for the authenticated user.
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Mark a notification as read.
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};