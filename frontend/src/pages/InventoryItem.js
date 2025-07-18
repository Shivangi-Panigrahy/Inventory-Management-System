import React from 'react';
import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { inventoryAPI } from '../services/api';

const InventoryItem = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: itemData, isLoading, error } = useQuery(
    ['inventory', id],
    () => inventoryAPI.getItem(id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading item: {error.message}
      </div>
    );
  }

  // The API response has nested data structure: data.data.data
  const item = itemData?.data?.data;

  if (!item) {
    return (
      <div className="text-center text-gray-600">
        Item not found
      </div>
    );
  }

  const getStockStatus = () => {
    if (item.quantity === 0) {
      return { status: 'Out of Stock', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    } else if (item.quantity <= item.reorderPoint) {
      return { status: 'Low Stock', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    } else {
      return { status: 'In Stock', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600 mt-1">SKU: {item.sku}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/inventory"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Inventory
            </Link>
            <Link
              to={`/inventory/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Item
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-500">Name</span>
                <p className="mt-1 text-sm text-gray-900">{item.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Category</span>
                <p className="mt-1">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {item.category}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Price</span>
                <p className="mt-1 text-sm text-gray-900">${item.price.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Quantity</span>
                <p className="mt-1 text-sm text-gray-900">
                  {item.quantity} {item.unit}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Stock Status</span>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.textColor}`}>
                    {stockStatus.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status</span>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'active' ? 'bg-green-100 text-green-800' :
                    item.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <span className="text-sm font-medium text-gray-500">Description</span>
              <p className="mt-1 text-sm text-gray-900">{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mt-6">
                <span className="text-sm font-medium text-gray-500">Tags</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stock Management */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-500">Reorder Point</span>
                <p className="mt-1 text-sm text-gray-900">{item.reorderPoint}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Reorder Quantity</span>
                <p className="mt-1 text-sm text-gray-900">{item.reorderQuantity}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Unit</span>
                <p className="mt-1 text-sm text-gray-900 capitalize">{item.unit}</p>
              </div>
            </div>

            {/* Stock Alert */}
            {item.quantity <= item.reorderPoint && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Low Stock Alert
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Current quantity ({item.quantity}) is at or below the reorder point ({item.reorderPoint}). 
                        Consider reordering {item.reorderQuantity} {item.unit}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          {(item.supplier || item.location) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              
              {/* Supplier Information */}
              {item.supplier && (item.supplier.name || item.supplier.email || item.supplier.phone) && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Supplier Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.supplier.name && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Name</span>
                        <p className="mt-1 text-sm text-gray-900">{item.supplier.name}</p>
                      </div>
                    )}
                    {item.supplier.email && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Email</span>
                        <p className="mt-1 text-sm text-gray-900">{item.supplier.email}</p>
                      </div>
                    )}
                    {item.supplier.phone && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Phone</span>
                        <p className="mt-1 text-sm text-gray-900">{item.supplier.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location Information */}
              {item.location && (item.location.warehouse || item.location.shelf || item.location.bin) && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Location Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.location.warehouse && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Warehouse</span>
                        <p className="mt-1 text-sm text-gray-900">{item.location.warehouse}</p>
                      </div>
                    )}
                    {item.location.shelf && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Shelf</span>
                        <p className="mt-1 text-sm text-gray-900">{item.location.shelf}</p>
                      </div>
                    )}
                    {item.location.bin && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Bin</span>
                        <p className="mt-1 text-sm text-gray-900">{item.location.bin}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Item Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">SKU</span>
                <p className="mt-1 text-sm text-gray-900 font-mono">{item.sku}</p>
              </div>
              {item.barcode && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Barcode</span>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{item.barcode}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Created</span>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created By</span>
                <p className="mt-1 text-sm text-gray-900">
                  {item.createdBy?.name || 'Unknown'}
                </p>
              </div>
              {item.updatedBy && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated By</span>
                  <p className="mt-1 text-sm text-gray-900">
                    {item.updatedBy.name || 'Unknown'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to={`/inventory/${id}/edit`}
                className="w-full flex justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Item
              </Link>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this item?')) {
                    // Handle delete
                  }
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryItem; 