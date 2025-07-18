import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { inventoryAPI } from '../services/api';

const Dashboard = () => {
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery(
    'inventory-stats',
    () => inventoryAPI.getStats(),
    {
      onError: (error) => {
        console.error('Stats API error:', error);
      }
    }
  );

  const { data: lowStockData, isLoading: lowStockLoading, error: lowStockError } = useQuery(
    'low-stock',
    () => inventoryAPI.getLowStock(),
    {
      onError: (error) => {
        console.error('Low stock API error:', error);
      }
    }
  );

  const { data: outOfStockData, isLoading: outOfStockLoading, error: outOfStockError } = useQuery(
    'out-of-stock',
    () => inventoryAPI.getOutOfStock(),
    {
      onError: (error) => {
        console.error('Out of stock API error:', error);
      }
    }
  );

  // The API response has nested data structure: data.data.data
  const stats = statsData?.data?.data || {};
  const lowStockItems = Array.isArray(lowStockData?.data?.data) ? lowStockData.data.data : [];
  const outOfStockItems = Array.isArray(outOfStockData?.data?.data) ? outOfStockData.data.data : [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  // Show error state if there are API errors
  if (statsError || lowStockError || outOfStockError) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>Error loading dashboard data. Please check your connection and try again.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your Inventory Management System</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalItems || 0}</p>
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.totalValue ? stats.totalValue.toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.lowStockCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.outOfStockCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/inventory/add"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Add New Item</p>
              <p className="text-sm text-gray-500">Create a new inventory item</p>
            </div>
          </Link>

          <Link
            to="/inventory"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">View Inventory</p>
              <p className="text-sm text-gray-500">Browse all inventory items</p>
            </div>
          </Link>

          <Link
            to="/inventory?stockStatus=low-stock"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Low Stock Alert</p>
              <p className="text-sm text-gray-500">View items needing reorder</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Items</h2>
            <p className="text-sm text-gray-500 mt-1">Items that need reordering</p>
          </div>
          <div className="p-6">
            {lowStockLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="loading-spinner w-6 h-6"></div>
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No low stock items</p>
                <p className="text-sm text-gray-400 mt-1">All your items are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} remaining
                      </p>
                    </div>
                    <Link
                      to={`/inventory/${item._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <Link
                    to="/inventory?stockStatus=low-stock"
                    className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-4"
                  >
                    View all {lowStockItems.length} items
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Out of Stock Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Out of Stock Items</h2>
            <p className="text-sm text-gray-500 mt-1">Items with zero quantity</p>
          </div>
          <div className="p-6">
            {outOfStockLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="loading-spinner w-6 h-6"></div>
              </div>
            ) : outOfStockItems.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No out of stock items</p>
                <p className="text-sm text-gray-400 mt-1">Great! All your items are available.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outOfStockItems.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.category} • SKU: {item.sku}
                      </p>
                    </div>
                    <Link
                      to={`/inventory/${item._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                ))}
                {outOfStockItems.length > 5 && (
                  <Link
                    to="/inventory?stockStatus=out-of-stock"
                    className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-4"
                  >
                    View all {outOfStockItems.length} items
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-500 mt-1">Latest inventory updates</p>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>Activity tracking coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 