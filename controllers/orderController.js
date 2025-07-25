const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const firebaseAdmin = require('firebase-admin');

/**
 * Create a new order from the user's cart or provided items. If a cart exists
 * for the user, its items are used; otherwise, items must be provided in
 * the request body. The shipping address can be chosen from the user's
 * stored addresses or provided inline.
 */
exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Determine items: use cart if exists and no items provided
    let items = req.body.items;
    if (!items || items.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'No items provided or in cart' });
      }
      items = cart.items.map((item) => ({ product: item.product, quantity: item.quantity }));
    }
    // Build order items with price lookup
    const orderItems = [];
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      orderItems.push({ product: product._id, quantity: item.quantity, price: product.price });
      total += product.price * item.quantity;
      // Optionally decrement stock
      product.stock -= item.quantity;
      await product.save();
    }
    // Determine shipping address: either selected address index or provided directly
    let shippingAddress;
    if (req.body.addressId) {
      const address = req.user.addresses.id(req.body.addressId);
      if (!address) {
        return res.status(400).json({ message: 'Invalid address' });
      }
      shippingAddress = {
        street: address.street,
        city: address.city,
        coordinates: address.coordinates,
      };
    } else if (req.body.shippingAddress) {
      shippingAddress = req.body.shippingAddress;
    } else {
      return res.status(400).json({ message: 'Shipping address required' });
    }
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: total,
      paymentMethod: req.body.paymentMethod || 'cash',
      shippingAddress,
    });
    // Clear cart after order creation
    await Cart.findOneAndDelete({ user: req.user._id });
    // Send notification
    await sendNotification(req.user, 'Order placed', `Your order ${order._id} has been placed.`);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * List orders for the authenticated user.
 */
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * List all orders (admin).
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update order status (admin). Accepts status and optionally paymentStatus.
 */
exports.updateOrderStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;
  try {
    const order = await Order.findById(req.params.id).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();
    // Send notification to user
    await sendNotification(order.user, 'Order updated', `Your order ${order._id} status is now ${order.status}.`);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Cancel an order (user or admin). Only allow cancellation if order is pending.
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only allow the owner or admin to cancel
    if (!req.user._id.equals(order.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }
    order.status = 'cancelled';
    await order.save();
    // Restock items
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    await sendNotification(order.user, 'Order cancelled', `Your order ${order._id} has been cancelled.`);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Helper to send a push notification to a user and persist it in the database.
 */
async function sendNotification(user, title, body) {
  try {
    // Save the notification in DB
    await Notification.create({ user: user._id, title, body });
    // Send push notification via Firebase if configured
    if (firebaseAdmin.apps.length && user.fcmTokens && user.fcmTokens.length > 0) {
      const message = {
        notification: { title, body },
        tokens: user.fcmTokens,
      };
      firebaseAdmin
        .messaging()
        .sendMulticast(message)
        .catch((err) => console.warn('FCM error:', err.message));
    }
  } catch (err) {
    console.warn('Notification error:', err.message);
  }
}