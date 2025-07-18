const express = require('express');
const router = express.Router();

const {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats,
  getLowStockItems,
  getOutOfStockItems,
  bulkUpdateInventory
} = require('../controllers/inventoryController');

const {
  validateInventoryItem,
  validateInventoryUpdate,
  validateSearch,
  validateId
} = require('../middleware/validation');

const { protect, authorize } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(protect);

// Get inventory items with search and filtering
router.get('/', searchLimiter, validateSearch, getInventoryItems);

// Get inventory statistics
router.get('/stats', getInventoryStats);

// Get low stock items
router.get('/low-stock', getLowStockItems);

// Get out of stock items
router.get('/out-of-stock', getOutOfStockItems);

// Create new inventory item (all authenticated users can create items)
router.post('/', validateInventoryItem, createInventoryItem);

// Bulk update inventory items (requires manager or admin role)
router.put('/bulk-update', authorize('admin', 'manager'), bulkUpdateInventory);

// Get single inventory item
router.get('/:id', validateId, getInventoryItem);

// Update inventory item (users can update their own items, admins can update all)
router.put('/:id', validateId, validateInventoryUpdate, updateInventoryItem);

// Delete inventory item (users can delete their own items, admins can delete all)
router.delete('/:id', validateId, deleteInventoryItem);

module.exports = router; 