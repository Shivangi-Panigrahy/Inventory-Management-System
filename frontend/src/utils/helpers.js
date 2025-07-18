import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format number with commas
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

// Format percentage
export const formatPercentage = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Format date
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

// Format date and time
export const formatDateTime = (date, formatStr = 'MMM dd, yyyy HH:mm') => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Get stock status badge
export const getStockStatusBadge = (quantity, reorderPoint) => {
  if (quantity === 0) {
    return { status: 'out-of-stock', label: 'Out of Stock', color: 'danger' };
  }
  if (quantity <= reorderPoint) {
    return { status: 'low-stock', label: 'Low Stock', color: 'warning' };
  }
  return { status: 'in-stock', label: 'In Stock', color: 'success' };
};

// Get category color
export const getCategoryColor = (category) => {
  const colors = {
    'Electronics': 'blue',
    'Clothing': 'purple',
    'Books': 'green',
    'Home & Garden': 'yellow',
    'Sports & Outdoors': 'orange',
    'Automotive': 'red',
    'Health & Beauty': 'pink',
    'Toys & Games': 'indigo',
    'Food & Beverages': 'teal',
    'Office Supplies': 'gray',
    'Other': 'gray',
  };
  return colors[category] || 'gray';
};

// Get role badge
export const getRoleBadge = (role) => {
  const badges = {
    admin: { label: 'Admin', color: 'danger' },
    manager: { label: 'Manager', color: 'warning' },
    user: { label: 'User', color: 'secondary' },
  };
  return badges[role] || { label: 'Unknown', color: 'gray' };
};

// Get status badge
export const getStatusBadge = (status) => {
  const badges = {
    active: { label: 'Active', color: 'success' },
    inactive: { label: 'Inactive', color: 'secondary' },
    discontinued: { label: 'Discontinued', color: 'danger' },
  };
  return badges[status] || { label: 'Unknown', color: 'gray' };
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      length: password.length < minLength,
      uppercase: !hasUpperCase,
      lowercase: !hasLowerCase,
      numbers: !hasNumbers,
    }
  };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Check if file is image
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Merge objects
export const mergeObjects = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeObjects(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return mergeObjects(target, ...sources);
};

// Check if value is object
export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Sleep function
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

// Generate pagination info
export const generatePagination = (currentPage, totalPages, maxVisible = 5) => {
  const pages = [];
  const halfVisible = Math.floor(maxVisible / 2);
  
  let start = Math.max(1, currentPage - halfVisible);
  let end = Math.min(totalPages, currentPage + halfVisible);
  
  if (end - start + 1 < maxVisible) {
    if (start === 1) {
      end = Math.min(totalPages, start + maxVisible - 1);
    } else {
      start = Math.max(1, end - maxVisible + 1);
    }
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return {
    pages,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    prevPage: currentPage - 1,
    nextPage: currentPage + 1,
  };
}; 