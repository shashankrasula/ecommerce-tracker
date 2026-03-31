const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const { normalizePhone, sendOrderSms } = require('../utils/sms');

// Get all orders - Admin/Manager
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.orderId = { $regex: search, $options: 'i' };

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('assignedManager', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);
    res.json({ orders, total, pages: Math.ceil(total / limit), page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my orders - User
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('assignedManager', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Users can only see their own orders
    if (req.user.role === 'user' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order by orderId string
router.get('/track/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create order - User
router.post('/', protect, async (req, res) => {
  try {
    const shippingAddress = {
      ...req.body.shippingAddress,
      phone: normalizePhone(req.body.shippingAddress?.phone || req.user.phone)
    };

    if (!shippingAddress.phone) {
      return res.status(400).json({ message: 'Phone number is required to place an order' });
    }

    const order = await Order.create({
      ...req.body,
      shippingAddress,
      user: req.user._id
    });

    const smsNotification = await sendOrderSms({
      phone: shippingAddress.phone,
      name: req.user.name,
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
    });

    res.status(201).json({
      ...order.toObject(),
      smsNotification
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status - Admin/Manager
router.put('/:id/status', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { status, location, description } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.trackingHistory.push({ status, location, description });
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order - Admin/Manager
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user', 'name email');
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete order - Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
