const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Admin dashboard stats
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalManagers = await User.countDocuments({ role: 'manager' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalManagers,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusCounts,
      recentOrders,
      monthlyRevenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manager dashboard stats
router.get('/manager', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const assignedOrders = await Order.countDocuments({ assignedManager: req.user._id });
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredToday = await Order.countDocuments({
      status: 'delivered',
      deliveredAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ assignedOrders, pendingOrders, shippedOrders, deliveredToday, recentOrders, statusCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
