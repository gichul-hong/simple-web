'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { signIn } from 'next-auth/react';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BackendError {
  Message: string;
  Code: string;
  Error: string;
  Status: number;
}

export function NewApplicationModal({ isOpen, onClose }: NewApplicationModalProps) {
  const [projectId, setProjectId] = useState('');
  const [nasVolumeSize, setNasVolumeSize] = useState<number>(20);
  const [isTouched, setIsTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BackendError | null>(null);

  const isValid = projectId.startsWith('aip-');
  const showError = isTouched && !isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/applications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          membershipLevel: 'l1', // Fixed as requested
          nasVolumeSizeInGb: nasVolumeSize
        }),
      });

      if (response.status === 401) {
        signIn();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data);
      } else {
        // Success
        setProjectId('');
        setNasVolumeSize(20);
        setIsTouched(false);
        onClose();
        // Trigger a refresh of the page to see the new item
        window.location.reload();
      }
    } catch (err) {
      setError({
        Message: "Connection failed",
        Code: "CLIENT_ERROR",
        Error: "Could not reach the server",
        Status: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectId(e.target.value);
    if (!isTouched) setIsTouched(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Application">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-4">
              <div className="shrink-0">
                 <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="text-red-600" size={20} />
                 </div>
              </div>
              <div className="flex-1 space-y-1.5 pt-0.5">
                 <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-red-900 text-sm">
                        {error.Error}
                    </h4>
                    <span className="text-[10px] font-mono bg-white text-red-600 px-2 py-0.5 rounded-full border border-red-100 shadow-sm uppercase tracking-wide">
                        {error.Code}
                    </span>
                 </div>
                 <p className="text-sm text-red-600 leading-relaxed">
                    {error.Message}
                 </p>
              </div>
            </div>
          </div>
        )}

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

        <div className="space-y-2">
          <label htmlFor="nasVolume" className="block text-sm font-medium text-gray-700">
            NAS Volume Size (GB)
          </label>
          <input
            type="number"
            id="nasVolume"
            min="1"
            max="1000"
            value={nasVolumeSize}
            onChange={(e) => setNasVolumeSize(parseInt(e.target.value) || 0)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
          />
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Info size={14} />
            Membership level is fixed to <strong>l1</strong>.
          </div>
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
