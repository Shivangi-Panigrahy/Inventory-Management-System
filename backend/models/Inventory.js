const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    enum: [
      'Electronics',
      'Clothing',
      'Books',
      'Home & Garden',
      'Sports & Outdoors',
      'Automotive',
      'Health & Beauty',
      'Toys & Games',
      'Food & Beverages',
      'Office Supplies',
      'Other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Please provide item price'],
    min: [0, 'Price cannot be negative'],
    max: [999999.99, 'Price cannot exceed 999,999.99']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide item quantity'],
    min: [0, 'Quantity cannot be negative'],
    max: [999999, 'Quantity cannot exceed 999,999']
  },
  description: {
    type: String,
    required: [true, 'Please provide item description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: [50, 'SKU cannot be more than 50 characters']
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  supplier: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Supplier name cannot be more than 100 characters']
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid supplier email'
      ]
    },
    phone: {
      type: String,
      trim: true
    }
  },
  location: {
    warehouse: {
      type: String,
      trim: true,
      maxlength: [50, 'Warehouse name cannot be more than 50 characters']
    },
    shelf: {
      type: String,
      trim: true,
      maxlength: [20, 'Shelf cannot be more than 20 characters']
    },
    bin: {
      type: String,
      trim: true,
      maxlength: [20, 'Bin cannot be more than 20 characters']
    }
  },
  reorderPoint: {
    type: Number,
    min: [0, 'Reorder point cannot be negative'],
    default: 10
  },
  reorderQuantity: {
    type: Number,
    min: [1, 'Reorder quantity must be at least 1'],
    default: 50
  },
  unit: {
    type: String,
    enum: ['pieces', 'kg', 'liters', 'meters', 'boxes', 'pairs', 'sets'],
    default: 'pieces'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    }
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    max: [999999.99, 'Cost cannot exceed 999,999.99']
  },
  profitMargin: {
    type: Number,
    min: [0, 'Profit margin cannot be negative'],
    max: [100, 'Profit margin cannot exceed 100%']
  },
  lastRestocked: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
inventorySchema.index({ name: 'text', description: 'text', tags: 'text' });
inventorySchema.index({ category: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ 'supplier.name': 1 });
inventorySchema.index({ createdAt: -1 });
inventorySchema.index({ updatedAt: -1 });
inventorySchema.index({ quantity: 1 });
inventorySchema.index({ price: 1 });

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.reorderPoint) return 'low-stock';
  return 'in-stock';
});

// Virtual for total value
inventorySchema.virtual('totalValue').get(function() {
  return this.price * this.quantity;
});

// Virtual for profit
inventorySchema.virtual('profit').get(function() {
  if (!this.cost) return null;
  return this.price - this.cost;
});

// Virtual for profit percentage
inventorySchema.virtual('profitPercentage').get(function() {
  if (!this.cost || this.cost === 0) return null;
  return ((this.price - this.cost) / this.cost) * 100;
});

// Virtual for days until expiry
inventorySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to generate SKU if not provided
inventorySchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.sku = `${this.category.substring(0, 3).toUpperCase()}-${timestamp}-${random}`;
  }
  next();
});

// Static method to find low stock items
inventorySchema.statics.findLowStock = function(ownershipFilter = {}) {
  return this.find({
    $expr: {
      $lte: ['$quantity', '$reorderPoint']
    },
    ...ownershipFilter
  });
};

// Static method to find out of stock items
inventorySchema.statics.findOutOfStock = function(ownershipFilter = {}) {
  return this.find({ 
    quantity: 0,
    ...ownershipFilter
  });
};

// Static method to find items by category
inventorySchema.statics.findByCategory = function(category, ownershipFilter = {}) {
  return this.find({ 
    category: category,
    ...ownershipFilter
  });
};

// Static method to search items
inventorySchema.statics.searchItems = function(searchTerm, ownershipFilter = {}) {
  return this.find({
    $text: { $search: searchTerm },
    ...ownershipFilter
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method to get inventory statistics
inventorySchema.statics.getStats = async function(ownershipFilter = {}) {
  const stats = await this.aggregate([
    { $match: ownershipFilter },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        totalQuantity: { $sum: '$quantity' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);

  const lowStockCount = await this.countDocuments({
    $expr: { $lte: ['$quantity', '$reorderPoint'] },
    ...ownershipFilter
  });

  const outOfStockCount = await this.countDocuments({ 
    quantity: 0,
    ...ownershipFilter
  });

  return {
    ...stats[0],
    lowStockCount,
    outOfStockCount
  };
};

module.exports = mongoose.model('Inventory', inventorySchema); 