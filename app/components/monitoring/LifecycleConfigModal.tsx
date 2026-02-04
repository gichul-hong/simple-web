'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Loader2, AlertCircle } from 'lucide-react';

interface LifecycleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  namespace: string; // The namespace is needed for context, though not used in API calls
}

export function LifecycleConfigModal({ isOpen, onClose, namespace }: LifecycleConfigModalProps) {
  const [configText, setConfigText] = useState('');
  const [days, setDays] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!isOpen || !namespace) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/s3/namespace/${namespace}/lifecycle`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ details: 'Failed to fetch config' }));
        throw new Error(errData.details || 'Failed to fetch config');
      }
      const data = await response.json();
      setConfigText(JSON.stringify(data, null, 2));
      
      const currentDays = data?.Rules?.[0]?.Expiration?.Days || data?.Rule?.Expiration?.Days || '';
      setDays(currentDays);
    } catch (err: any) {
      setError(err.message);
      setConfigText(`Error loading configuration:\n${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, namespace]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleApply = async () => {
    if (days === '' || Number(days) <= 0) {
      setError('Please enter a valid number of days (greater than 0).');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/s3/namespace/${namespace}/lifecycle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: String(days) }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ details: 'Failed to apply config' }));
        throw new Error(errData.details || 'Failed to apply config');
      }
      // Re-fetch config to show updated state before closing
      await fetchConfig(); 
      setTimeout(onClose, 700); // Close modal after a short delay to show success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const modalTitle = `S3 Lifecycle: ${namespace}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="space-y-4">
        <div>
          <label htmlFor="current-config" className="block text-sm font-medium text-foreground/80">
            Current Config
          </label>
          <div className="mt-1 relative">
            <textarea
              id="current-config"
              rows={10}
              className="w-full p-2 border border-border rounded-md bg-background/70 font-mono text-xs"
              value={isLoading ? 'Loading...' : configText}
              readOnly
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-foreground/80">
            Days to keep logs
          </label>
          <input
            type="number"
            id="days"
            value={days}
            onChange={(e) => setDays(e.target.value === '' ? '' : Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
            placeholder="e.g., 15"
            disabled={isLoading}
          />
        </div>
        {error && !isLoading && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200/50">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isSaving || isLoading}
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply
          </button>
        </div>
      </div>
    </Modal>
  );
}
