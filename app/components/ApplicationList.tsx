'use client';

import React, { useEffect, useState } from 'react';
import { Application } from '@/types/application';
import { ApplicationCard } from './ApplicationCard';
import { LayoutGrid, List as ListIcon, Search, RefreshCw } from 'lucide-react';

export function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
    } catch (err) {
        if (err instanceof Error) {
             setError(err.message);
        } else {
             setError('An unknown error occurred');
        }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter(app => 
    app.name.toLowerCase().includes(filter.toLowerCase()) || 
    app.namespace.toLowerCase().includes(filter.toLowerCase()) ||
    app.project.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search applications..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
        </div>
        <button 
            onClick={fetchApplications} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
        </button>
      </div>

      {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
              Error: {error}
          </div>
      )}

      {loading && !applications.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-xl border bg-gray-50 animate-pulse" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <ApplicationCard key={app.name} app={app} />
          ))}
          {filteredApps.length === 0 && !loading && (
              <div className="col-span-full py-12 text-center text-gray-500">
                  No applications found matching your search.
              </div>
          )}
        </div>
      )}
    </div>
  );
}
