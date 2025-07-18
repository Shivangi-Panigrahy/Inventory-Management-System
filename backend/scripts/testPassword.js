const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const testPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_management');
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const user = await User.findOne({ email: 'admin@example.com' }).select('+password');
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('📧 User email:', user.email);
    console.log('🔑 Stored password hash:', user.password);

    // Test password comparison
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    console.log('🔍 Password match result:', isMatch);
    
    // Also test using the model method
    const isMatchModel = await user.comparePassword(testPassword);
    console.log('🔍 Model method result:', isMatchModel);

    // Test with wrong password
    const wrongPassword = 'wrongpassword';
    const isWrongMatch = await bcrypt.compare(wrongPassword, user.password);
    console.log('🔍 Wrong password result:', isWrongMatch);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing password:', error);
    process.exit(1);
  }
};

testPassword(); 