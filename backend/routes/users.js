const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

// Get single user (admin only)
router.get('/:id', validateId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user'
    });
  }
});

// Update user role (admin only)
router.put('/:id/role', validateId, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'manager', 'user'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user role'
    });
  }
});

// Toggle user active status (admin only)
router.put('/:id/toggle-status', validateId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle user status'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', validateId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete your own account'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
});

module.exports = router; 