const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
require('dotenv').config();

const createIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create indexes for Inventory collection
    console.log('Creating Inventory indexes...');
    await Inventory.createIndexes();
    console.log('Inventory indexes created successfully');

    // Create indexes for User collection
    console.log('Creating User indexes...');
    await User.createIndexes();
    console.log('User indexes created successfully');

    // Verify text index exists
    const indexes = await Inventory.listIndexes();
    const textIndex = indexes.find(index => 
      index.key && (index.key['$**'] || (index.key.name === 'text' && index.key.description === 'text'))
    );
    if (textIndex) {
      console.log('Text index found:', textIndex.name);
    } else {
      console.log('No text index found, creating one...');
      try {
        await Inventory.collection.createIndex(
          { name: 'text', description: 'text', tags: 'text' },
          { name: 'text_search_index' }
        );
        console.log('Text index created successfully');
      } catch (error) {
        if (error.code === 85) {
          console.log('Text index already exists with different name');
        } else {
          throw error;
        }
      }
    }

    console.log('All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes(); 