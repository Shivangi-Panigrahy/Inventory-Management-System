const Inventory = require('../models/Inventory');
const { asyncHandler } = require('../middleware/errorHandler');
const { setCache, getCache, deleteCache } = require('../config/redis');
const { sendToQueue } = require('../config/rabbitmq');

// @desc    Get all inventory items with search, filter, and pagination
// @route   GET /api/inventory
// @access  Private
const getInventoryItems = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    status,
    stockStatus,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  // Build cache key
  const cacheKey = `inventory:${JSON.stringify(req.query)}:user:${req.user._id}`;
  
  // Try to get from cache first
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      status: 'success',
      data: cachedData,
      fromCache: true
    });
  }

  // Build query
  const query = {};

  // Ownership filter: regular users can only see their own items, admins can see all
  if (req.user.role !== 'admin') {
    query.createdBy = req.user._id;
  }

  // Search functionality
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Stock status filter
  if (stockStatus) {
    switch (stockStatus) {
      case 'out-of-stock':
        query.quantity = 0;
        break;
      case 'low-stock':
        query.$expr = { $lte: ['$quantity', '$reorderPoint'] };
        break;
      case 'in-stock':
        query.$expr = { $gt: ['$quantity', '$reorderPoint'] };
        break;
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const items = await Inventory.find(query)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const total = await Inventory.countDocuments(query);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  const result = {
    items,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    }
  };

  // Cache the result for 5 minutes
  await setCache(cacheKey, result, 300);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItem = asyncHandler(async (req, res) => {
  const cacheKey = `inventory:item:${req.params.id}`;
  
  // Try to get from cache first
  const cachedItem = await getCache(cacheKey);
  if (cachedItem) {
    // Check ownership for cached items
    if (req.user.role !== 'admin' && cachedItem.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this item'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: cachedItem,
      fromCache: true
    });
  }

  const item = await Inventory.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!item) {
    return res.status(404).json({
      status: 'error',
      message: 'Inventory item not found'
    });
  }

  // Check ownership: regular users can only view items they created
  if (req.user.role !== 'admin' && item.createdBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to access this item'
    });
  }

  // Cache the item for 10 minutes
  await setCache(cacheKey, item, 600);

  res.status(200).json({
    status: 'success',
    data: item
  });
});

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
const createInventoryItem = asyncHandler(async (req, res) => {
  const itemData = {
    ...req.body,
    createdBy: req.user._id
  };

  const item = await Inventory.create(itemData);

  // Populate user info
  await item.populate('createdBy', 'name email');

  // Clear related caches
  await deleteCache(`inventory:stats:user:${req.user._id}`);
  await deleteCache(`inventory:low-stock:user:${req.user._id}`);
  await deleteCache(`inventory:out-of-stock:user:${req.user._id}`);
  
  // Clear all inventory list caches for this user
  const userCachePattern = `inventory:*user:${req.user._id}`;
  await deleteCache(userCachePattern);
  
  // Clear global caches for admin users
  if (req.user.role === 'admin') {
    await deleteCache('inventory:stats');
    await deleteCache('inventory:low-stock');
    await deleteCache('inventory:out-of-stock');
    // Clear all inventory list caches for admin
    await deleteCache('inventory:*');
  }

  // Send to queue for processing
  await sendToQueue('inventory-updates', {
    type: 'created',
    item: {
      id: item._id,
      name: item.name,
      category: item.category,
      quantity: item.quantity
    },
    user: {
      id: req.user._id,
      name: req.user.name
    }
  });

  // Check for low stock alert
  if (item.quantity <= item.reorderPoint) {
    await sendToQueue('low-stock-alerts', {
      item: {
        id: item._id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        reorderPoint: item.reorderPoint
      }
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'Inventory item created successfully',
    data: item
  });
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      status: 'error',
      message: 'Inventory item not found'
    });
  }

  // Check ownership or admin role
  if (req.user.role !== 'admin' && item.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to update this item'
    });
  }

  const oldQuantity = item.quantity;
  const oldStockStatus = item.stockStatus;

  // Update item
  Object.keys(req.body).forEach(key => {
    item[key] = req.body[key];
  });
  item.updatedBy = req.user._id;

  await item.save();
  await item.populate('createdBy', 'name email');
  await item.populate('updatedBy', 'name email');

  // Clear related caches
  await deleteCache(`inventory:item:${req.params.id}`);
  await deleteCache(`inventory:stats:user:${req.user._id}`);
  await deleteCache(`inventory:low-stock:user:${req.user._id}`);
  await deleteCache(`inventory:out-of-stock:user:${req.user._id}`);
  
  // Clear inventory list caches (all filter combinations)
  const cachePattern = `inventory:*user:${req.user._id}`;
  await deleteCache(cachePattern);
  
  // Clear global caches for admin users
  if (req.user.role === 'admin') {
    await deleteCache('inventory:stats');
    await deleteCache('inventory:low-stock');
    await deleteCache('inventory:out-of-stock');
    // Clear all inventory list caches for admin
    await deleteCache('inventory:*');
  }

  // Send to queue for processing
  await sendToQueue('inventory-updates', {
    type: 'updated',
    item: {
      id: item._id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      oldQuantity
    },
    user: {
      id: req.user._id,
      name: req.user.name
    }
  });

  // Check for stock status changes
  const newStockStatus = item.stockStatus;
  if (oldStockStatus !== newStockStatus) {
    if (newStockStatus === 'low-stock' || newStockStatus === 'out-of-stock') {
      await sendToQueue('low-stock-alerts', {
        item: {
          id: item._id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          reorderPoint: item.reorderPoint,
          stockStatus: newStockStatus
        }
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Inventory item updated successfully',
    data: item
  });
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      status: 'error',
      message: 'Inventory item not found'
    });
  }

  // Check ownership or admin role
  if (req.user.role !== 'admin' && item.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to delete this item'
    });
  }

  await Inventory.findByIdAndDelete(req.params.id);

  // Clear related caches
  await deleteCache(`inventory:item:${req.params.id}`);
  await deleteCache(`inventory:stats:user:${req.user._id}`);
  await deleteCache(`inventory:low-stock:user:${req.user._id}`);
  await deleteCache(`inventory:out-of-stock:user:${req.user._id}`);
  
  // Clear inventory list caches (all filter combinations)
  const cachePattern = `inventory:*user:${req.user._id}`;
  await deleteCache(cachePattern);
  
  // Clear global caches for admin users
  if (req.user.role === 'admin') {
    await deleteCache('inventory:stats');
    await deleteCache('inventory:low-stock');
    await deleteCache('inventory:out-of-stock');
    // Clear all inventory list caches for admin
    await deleteCache('inventory:*');
  }

  // Send to queue for processing
  await sendToQueue('inventory-updates', {
    type: 'deleted',
    item: {
      id: item._id,
      name: item.name,
      category: item.category
    },
    user: {
      id: req.user._id,
      name: req.user.name
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Inventory item deleted successfully'
  });
});

// @desc    Get inventory statistics
// @route   GET /api/inventory/stats
// @access  Private
const getInventoryStats = asyncHandler(async (req, res) => {
  const cacheKey = `inventory:stats:user:${req.user._id}`;
  
  // Try to get from cache first
  const cachedStats = await getCache(cacheKey);
  if (cachedStats) {
    return res.status(200).json({
      status: 'success',
      data: cachedStats,
      fromCache: true
    });
  }

  // Build ownership filter
  const ownershipFilter = req.user.role !== 'admin' ? { createdBy: req.user._id } : {};

  const stats = await Inventory.getStats(ownershipFilter);

  // Get additional stats with ownership filter
  const lowStockItems = await Inventory.findLowStock(ownershipFilter).countDocuments();
  const outOfStockItems = await Inventory.findOutOfStock(ownershipFilter).countDocuments();
  const categories = await Inventory.aggregate([
    { $match: ownershipFilter },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const result = {
    ...stats,
    lowStockItems,
    outOfStockItems,
    categories
  };

  // Cache the stats for 10 minutes
  await setCache(cacheKey, result, 600);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockItems = asyncHandler(async (req, res) => {
  const cacheKey = `inventory:low-stock:user:${req.user._id}`;
  
  // Try to get from cache first
  const cachedItems = await getCache(cacheKey);
  if (cachedItems) {
    return res.status(200).json({
      status: 'success',
      data: cachedItems,
      fromCache: true
    });
  }

  // Build ownership filter
  const ownershipFilter = req.user.role !== 'admin' ? { createdBy: req.user._id } : {};

  const items = await Inventory.findLowStock(ownershipFilter)
    .populate('createdBy', 'name email')
    .sort({ quantity: 1 });

  // Cache the items for 5 minutes
  await setCache(cacheKey, items, 300);

  res.status(200).json({
    status: 'success',
    data: items
  });
});

// @desc    Get out of stock items
// @route   GET /api/inventory/out-of-stock
// @access  Private
const getOutOfStockItems = asyncHandler(async (req, res) => {
  const cacheKey = `inventory:out-of-stock:user:${req.user._id}`;
  
  // Try to get from cache first
  const cachedItems = await getCache(cacheKey);
  if (cachedItems) {
    return res.status(200).json({
      status: 'success',
      data: cachedItems,
      fromCache: true
    });
  }

  // Build ownership filter
  const ownershipFilter = req.user.role !== 'admin' ? { createdBy: req.user._id } : {};

  const items = await Inventory.findOutOfStock(ownershipFilter)
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });

  // Cache the items for 5 minutes
  await setCache(cacheKey, items, 300);

  res.status(200).json({
    status: 'success',
    data: items
  });
});

// @desc    Bulk update inventory items
// @route   PUT /api/inventory/bulk-update
// @access  Private
const bulkUpdateInventory = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Items array is required'
    });
  }

  const results = [];
  const errors = [];

  for (const itemUpdate of items) {
    try {
      const { id, ...updateData } = itemUpdate;
      const item = await Inventory.findById(id);

      if (!item) {
        errors.push({ id, error: 'Item not found' });
        continue;
      }

      // Check ownership or admin role
      if (req.user.role !== 'admin' && item.createdBy.toString() !== req.user._id.toString()) {
        errors.push({ id, error: 'Not authorized to update this item' });
        continue;
      }

      Object.keys(updateData).forEach(key => {
        item[key] = updateData[key];
      });
      item.updatedBy = req.user._id;

      await item.save();
      results.push(item);
    } catch (error) {
      errors.push({ id: itemUpdate.id, error: error.message });
    }
  }

  // Clear caches
  await deleteCache(`inventory:stats:user:${req.user._id}`);
  await deleteCache(`inventory:low-stock:user:${req.user._id}`);
  await deleteCache(`inventory:out-of-stock:user:${req.user._id}`);
  
  // Clear global caches for admin users
  if (req.user.role === 'admin') {
    await deleteCache('inventory:stats');
    await deleteCache('inventory:low-stock');
    await deleteCache('inventory:out-of-stock');
  }

  res.status(200).json({
    status: 'success',
    message: `Updated ${results.length} items successfully`,
    data: {
      updated: results.length,
      errors: errors.length,
      results,
      errors
    }
  });
});

module.exports = {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats,
  getLowStockItems,
  getOutOfStockItems,
  bulkUpdateInventory
}; 