const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Order.deleteMany({});
  await Product.deleteMany({});

  // Admin credentials from .env
  const adminName     = process.env.ADMIN_NAME     || 'Super Admin';
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@trackr.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@TrackR2024';

  const adminHash   = await bcrypt.hash(adminPassword, 10);
  const managerHash = await bcrypt.hash('Manager@123', 10);
  const userHash    = await bcrypt.hash('User@123', 10);

  const admin = await User.create({
    name: adminName, email: adminEmail,
    password: adminHash, role: 'admin', city: 'Hyderabad', phone: '+919000000000', isActive: true
  });

  const manager = await User.create({
    name: 'Manager Singh', email: 'manager@trackr.com',
    password: managerHash, role: 'manager', city: 'Mumbai', phone: '+919000000001', isActive: true
  });

  const user1 = await User.create({
    name: 'Rahul Kumar', email: 'rahul@trackr.com',
    password: userHash, role: 'user', city: 'Bangalore', phone: '+919000000002', isActive: true
  });

  const user2 = await User.create({
    name: 'Priya Sharma', email: 'priya@trackr.com',
    password: userHash, role: 'user', city: 'Delhi', phone: '+919000000003', isActive: true
  });

  const products = await Product.create([
    { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone', price: 134900, category: 'Electronics', stock: 50, sku: 'APL-IP15P' },
    { name: 'Samsung Galaxy S24', description: 'Samsung flagship phone', price: 79999, category: 'Electronics', stock: 30, sku: 'SAM-S24' },
    { name: 'Sony WH-1000XM5', description: 'Noise cancelling headphones', price: 29990, category: 'Audio', stock: 100, sku: 'SNY-WH5' },
    { name: 'MacBook Air M3', description: 'Apple laptop', price: 114900, category: 'Computers', stock: 20, sku: 'APL-MBA-M3' },
    { name: 'Nike Air Max', description: 'Running shoes', price: 9999, category: 'Footwear', stock: 200, sku: 'NK-AM-001' }
  ]);

  const statuses = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'];
  const carriers = ['FedEx','Blue Dart','DTDC','Delhivery'];

  for (let i = 0; i < 20; i++) {
    const status  = statuses[Math.floor(Math.random() * statuses.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const qty     = Math.floor(Math.random() * 3) + 1;

    const trackingHistory = [{ status: 'pending', location: 'Warehouse', description: 'Order placed' }];
    if (['confirmed','processing','shipped','out_for_delivery','delivered'].includes(status))
      trackingHistory.push({ status: 'confirmed', location: 'Warehouse', description: 'Order confirmed' });
    if (['processing','shipped','out_for_delivery','delivered'].includes(status))
      trackingHistory.push({ status: 'processing', location: 'Warehouse', description: 'Being packed' });
    if (['shipped','out_for_delivery','delivered'].includes(status))
      trackingHistory.push({ status: 'shipped', location: 'Hub', description: 'Dispatched' });

    await Order.create({
      user: [user1._id, user2._id][Math.floor(Math.random() * 2)],
      items: [{ product: product._id, name: product.name, quantity: qty, price: product.price }],
      totalAmount: product.price * qty,
      status,
      paymentStatus: status === 'pending' ? 'pending' : 'paid',
      paymentMethod: ['card','upi','cod'][Math.floor(Math.random() * 3)],
      shippingAddress: { name: 'Rahul Kumar', phone: '+919000000002', street: '123 Main St', city: 'Hyderabad', state: 'Telangana', zip: '500001', country: 'India' },
      trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      carrier: carriers[Math.floor(Math.random() * carriers.length)],
      trackingHistory,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assignedManager: manager._id,
      priority: ['low','medium','high'][Math.floor(Math.random() * 3)]
    });
  }

  console.log('');
  console.log('Seed complete!');
  console.log('Admin credentials are loaded from .env');
  console.log('  Email:    ' + adminEmail);
  console.log('  Password: (see ADMIN_PASSWORD in .env)');
  mongoose.disconnect();
};

seed().catch(console.error);
