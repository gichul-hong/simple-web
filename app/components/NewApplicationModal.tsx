'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewApplicationModal({ isOpen, onClose }: NewApplicationModalProps) {
  const [projectId, setProjectId] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = projectId.startsWith('aip-');
  const showError = isTouched && !isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    
    // Reset and close
    setProjectId('');
    setIsTouched(false);
    onClose();
    // In a real app, you would trigger a refresh of the list here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectId(e.target.value);
    if (!isTouched) setIsTouched(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Application">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
            Project ID
          </label>
          <div className="relative">
            <input
              type="text"
              id="projectId"
              value={projectId}
              onChange={handleChange}
              onBlur={() => setIsTouched(true)}
              placeholder="aip-my-project"
              className={cn(
                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 transition-colors",
                showError 
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                  : isValid && isTouched
                    ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
              )}
            />
            {isTouched && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValid ? (
                        <CheckCircle2 className="text-green-500" size={18} />
                    ) : (
                        <AlertCircle className="text-red-500" size={18} />
                    )}
                </div>
            )}
          </div>
          {showError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              Project ID must start with "aip-"
            </p>
          )}
          <p className="text-xs text-gray-500">
            Enter the unique identifier for your project. Must start with prefix <code>aip-</code>.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
