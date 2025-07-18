const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validatePasswordResetConfirm
} = require('../middleware/validation');

const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, validatePasswordReset, forgotPassword);
router.post('/reset-password', authLimiter, validatePasswordResetConfirm, resetPassword);
router.post('/verify-email', authLimiter, verifyEmail);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router; 