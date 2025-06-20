"use client";

import React, { useState, useEffect } from 'react';

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => void;
  loading?: boolean;
}

export interface ApplicationFormData {
  name: string;
  tier: 't1' | 't2';
  storageCapacity: number;
}

interface FormErrors {
  name?: string;
  storageCapacity?: string;
}

export function CreateApplicationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}: CreateApplicationModalProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    tier: 't1',
    storageCapacity: 10
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        tier: 't1',
        storageCapacity: 10
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    const nameError = validateName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    // Validate storage capacity
    if (formData.storageCapacity <= 0) {
      newErrors.storageCapacity = 'Storage capacity must be greater than 0';
    } else if (formData.storageCapacity > 1000) {
      newErrors.storageCapacity = 'Storage capacity must be 1000 or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    
    // Clear error when user starts typing
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleStorageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setFormData(prev => ({ ...prev, storageCapacity: value }));
    }
  };

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Application name is required';
    }
    if (!name.startsWith('aip-')) {
      return 'Application name must start with "aip-"';
    }
    if (!/^aip-[a-zA-Z0-9]+$/.test(name)) {
      return 'Application name must be alphanumeric after "aip-"';
    }
    if (name.length > 100) {
      return 'Application name must be 100 characters or less';
    }
    return undefined;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Application</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure your new ArgoCD application
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Application Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Application Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="aip-myapplication"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Must start with "aip-" and contain only alphanumeric characters (max 100 chars)
            </p>
          </div>

          {/* Tier Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tier *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tier"
                  value="t1"
                  checked={formData.tier === 't1'}
                  onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as 't1' | 't2' }))}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">T1 (Basic)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tier"
                  value="t2"
                  checked={formData.tier === 't2'}
                  onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as 't1' | 't2' }))}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">T2 (Advanced)</span>
              </label>
            </div>
          </div>

          {/* Storage Capacity */}
          <div className="mb-6">
            <label htmlFor="storageCapacity" className="block text-sm font-medium text-gray-700 mb-2">
              Storage Capacity (GB) *
            </label>
            <input
              type="number"
              id="storageCapacity"
              value={formData.storageCapacity}
              onChange={handleStorageChange}
              min="1"
              max="1000"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.storageCapacity ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.storageCapacity && (
              <p className="mt-1 text-sm text-red-600">{errors.storageCapacity}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter a value between 1 and 1000 GB
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 