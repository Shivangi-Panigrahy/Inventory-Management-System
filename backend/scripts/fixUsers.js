const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const fixUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_management');
    console.log('✅ Connected to MongoDB');

    // Delete existing users
    await User.deleteMany({});
    console.log('🗑️  Deleted existing users');

    // Create admin user with plain password (will be hashed by pre-save middleware)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // Plain password - will be hashed by middleware
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');

    // Create regular user
    const regularUser = new User({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'admin123', // Plain password - will be hashed by middleware
      role: 'user',
      isActive: true
    });

    await regularUser.save();
    console.log('✅ Regular user created successfully');
    console.log('📧 Email: user@example.com');
    console.log('🔑 Password: admin123');

    // Test the password
    const testUser = await User.findOne({ email: 'admin@example.com' }).select('+password');
    const isMatch = await testUser.comparePassword('admin123');
    console.log('🔍 Password test result:', isMatch);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing users:', error);
    process.exit(1);
  }
};

fixUsers(); 