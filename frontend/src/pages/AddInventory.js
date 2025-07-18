import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddInventory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      category: '',
      price: '',
      quantity: '',
      description: '',
      tags: [],
      reorderPoint: 10,
      reorderQuantity: 50,
      unit: 'pieces',
      status: 'active'
    }
  });

  const createMutation = useMutation(
    (data) => inventoryAPI.createItem(data),
    {
      onSuccess: (response) => {
        // Invalidate all inventory queries to refresh the data
        queryClient.invalidateQueries(['inventory']);
        queryClient.invalidateQueries('inventory');
        // Force refetch the current inventory data
        queryClient.refetchQueries(['inventory']);
        toast.success('Inventory item created successfully!');
        // Small delay to ensure cache is cleared and data is refetched
        setTimeout(() => {
          navigate('/inventory');
        }, 100);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to create item';
        toast.error(message);
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  const onSubmit = (data) => {
    setIsSubmitting(true);
    
    // Convert tags from string to array if needed
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Convert numeric fields
    data.price = parseFloat(data.price);
    data.quantity = parseInt(data.quantity);
    data.reorderPoint = parseInt(data.reorderPoint);
    data.reorderQuantity = parseInt(data.reorderQuantity);

    createMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Inventory Item</h1>
        <p className="text-gray-600 mt-2">Fill in the details below to add a new inventory item.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Item name is required',
                    minLength: { value: 1, message: 'Name must be at least 1 character' },
                    maxLength: { value: 100, message: 'Name cannot exceed 100 characters' }
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter item name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', {
                    required: 'Category is required'
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Toys & Games">Toys & Games</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999.99"
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 0, message: 'Price must be positive' },
                      max: { value: 999999.99, message: 'Price cannot exceed 999,999.99' }
                    })}
                    className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  max="999999"
                  {...register('quantity', {
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity must be non-negative' },
                    max: { value: 999999, message: 'Quantity cannot exceed 999,999' }
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows="4"
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' },
                  maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter detailed description of the item..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                {...register('tags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas (e.g., electronics, gadgets, wireless)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          {/* Stock Management */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Reorder Point */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reorder Point
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('reorderPoint', {
                    min: { value: 0, message: 'Reorder point must be non-negative' }
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.reorderPoint ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10"
                />
                {errors.reorderPoint && (
                  <p className="mt-1 text-sm text-red-600">{errors.reorderPoint.message}</p>
                )}
              </div>

              {/* Reorder Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reorder Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('reorderQuantity', {
                    min: { value: 1, message: 'Reorder quantity must be at least 1' }
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.reorderQuantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50"
                />
                {errors.reorderQuantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.reorderQuantity.message}</p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  {...register('unit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kilograms</option>
                  <option value="liters">Liters</option>
                  <option value="meters">Meters</option>
                  <option value="boxes">Boxes</option>
                  <option value="pairs">Pairs</option>
                  <option value="sets">Sets</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventory; 