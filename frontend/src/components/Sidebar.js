import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/inventory/add', label: 'Add Item', icon: '➕' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Add admin-only items
  if (user?.role === 'admin') {
    navItems.push({ path: '/users', label: 'Users', icon: '👥' });
  }

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="mt-8">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 