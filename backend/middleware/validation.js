const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'user'])
    .withMessage('Role must be admin, manager, or user'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Inventory item validation
const validateInventoryItem = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('category')
    .isIn([
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
    ])
    .withMessage('Please provide a valid category'),
  body('price')
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be a positive number less than 1,000,000'),
  body('quantity')
    .isInt({ min: 0, max: 999999 })
    .withMessage('Quantity must be a non-negative integer less than 1,000,000'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU must be between 1 and 50 characters'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Barcode cannot be empty'),
  body('supplier.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Supplier name must be between 1 and 100 characters'),
  body('supplier.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid supplier email'),
  body('location.warehouse')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Warehouse must be between 1 and 50 characters'),
  body('reorderPoint')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder point must be a non-negative integer'),
  body('reorderQuantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Reorder quantity must be a positive integer'),
  body('unit')
    .optional()
    .isIn(['pieces', 'kg', 'liters', 'meters', 'boxes', 'pairs', 'sets'])
    .withMessage('Please provide a valid unit'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued'])
    .withMessage('Status must be active, inactive, or discontinued'),
  body('cost')
    .optional()
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Cost must be a positive number less than 1,000,000'),
  body('profitMargin')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Profit margin must be between 0 and 100'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid expiry date'),
  handleValidationErrors
];

// Inventory update validation (partial)
const validateInventoryUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid inventory item ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('category')
    .optional()
    .isIn([
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
    ])
    .withMessage('Please provide a valid category'),
  body('price')
    .optional()
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be a positive number less than 1,000,000'),
  body('quantity')
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage('Quantity must be a non-negative integer less than 1,000,000'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  handleValidationErrors
];

// Search and filter validation
const validateSearch = [
  query('search')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '') return true;
      return value.length >= 1;
    })
    .withMessage('Search term cannot be empty'),
  query('category')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      const validCategories = [
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
      ];
      return validCategories.includes(value);
    })
    .withMessage('Please provide a valid category'),
  query('minPrice')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    })
    .withMessage('Maximum price must be a positive number'),
  query('status')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      const validStatuses = ['active', 'inactive', 'discontinued'];
      return validStatuses.includes(value);
    })
    .withMessage('Status must be active, inactive, or discontinued'),
  query('stockStatus')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      const validStockStatuses = ['in-stock', 'low-stock', 'out-of-stock'];
      return validStockStatuses.includes(value);
    })
    .withMessage('Stock status must be in-stock, low-stock, or out-of-stock'),
  query('sortBy')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      const validSortFields = ['name', 'price', 'quantity', 'createdAt', 'updatedAt'];
      return validSortFields.includes(value);
    })
    .withMessage('Sort by must be name, price, quantity, createdAt, or updatedAt'),
  query('sortOrder')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      const validSortOrders = ['asc', 'desc'];
      return validSortOrders.includes(value);
    })
    .withMessage('Sort order must be asc or desc'),
  query('page')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      const num = parseInt(value);
      return !isNaN(num) && num >= 1;
    })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .custom((value) => {
      if (value === '') return true;
      const num = parseInt(value);
      return !isNaN(num) && num >= 1 && num <= 100;
    })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

// Password reset confirm validation
const validatePasswordResetConfirm = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateInventoryItem,
  validateInventoryUpdate,
  validateSearch,
  validateId,
  validatePasswordReset,
  validatePasswordResetConfirm
}; 