import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Inventory API
export const inventoryAPI = {
  // Get all inventory items
  getItems: (params) => api.get('/api/inventory', { params }),
  
  // Get single inventory item
  getItem: (id) => api.get(`/api/inventory/${id}`),
  
  // Create inventory item
  createItem: (data) => api.post('/api/inventory', data),
  
  // Update inventory item
  updateItem: (id, data) => api.put(`/api/inventory/${id}`, data),
  
  // Delete inventory item
  deleteItem: (id) => api.delete(`/api/inventory/${id}`),
  
  // Get inventory statistics
  getStats: () => api.get('/api/inventory/stats'),
  
  // Get low stock items
  getLowStock: () => api.get('/api/inventory/low-stock'),
  
  // Get out of stock items
  getOutOfStock: () => api.get('/api/inventory/out-of-stock'),
  
  // Bulk update items
  bulkUpdate: (data) => api.put('/api/inventory/bulk-update', data),
};

// Auth API
export const authAPI = {
  // Login
  login: (data) => api.post('/api/auth/login', data),
  
  // Register
  register: (data) => api.post('/api/auth/register', data),
  
  // Logout
  logout: () => api.post('/api/auth/logout'),
  
  // Get current user
  getMe: () => api.get('/api/auth/me'),
  
  // Update profile
  updateProfile: (data) => api.put('/api/auth/me', data),
  
  // Change password
  changePassword: (data) => api.put('/api/auth/change-password', data),
  
  // Forgot password
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  
  // Reset password
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  
  // Verify email
  verifyEmail: (data) => api.post('/api/auth/verify-email', data),
};

// Users API (Admin only)
export const usersAPI = {
  // Get all users
  getUsers: () => api.get('/api/users'),
  
  // Get single user
  getUser: (id) => api.get(`/api/users/${id}`),
  
  // Update user role
  updateUserRole: (id, data) => api.put(`/api/users/${id}/role`, data),
  
  // Toggle user status
  toggleUserStatus: (id) => api.put(`/api/users/${id}/toggle-status`),
  
  // Delete user
  deleteUser: (id) => api.delete(`/api/users/${id}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 