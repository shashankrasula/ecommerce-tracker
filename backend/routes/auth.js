const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { normalizePhone } = require('../utils/sms');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  city: user.city,
  createdAt: user.createdAt,
  token: generateToken(user._id)
});

// Register (ONLY 1 ADMIN ALLOWED)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, city, phone } = req.body;
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return res.status(400).json({ message: 'Phone number already in use' });
    }

    // If user is trying to register as admin
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res
          .status(403)
          .json({ message: 'Admin account already exists. You are not allowed to register as admin.' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone: normalizedPhone,
      city: city || 'Hyderabad'
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = (email || phone || '').trim();
    const normalizedIdentifier = normalizePhone(identifier);

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: normalizedIdentifier }]
    });

    if (user && (await user.matchPassword(password))) {
      res.json(buildAuthResponse(user));
    } else {
      res.status(401).json({ message: 'Invalid email/phone or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/me', protect, async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.phone !== undefined) {
      updates.phone = normalizePhone(updates.phone);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true
    }).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;