'use client';

import React, { useEffect, useState } from 'react';
import { Application } from '@/types/application';
import { ApplicationCard } from './ApplicationCard';
import { ApplicationRow } from './ApplicationRow';
import { LayoutGrid, List as ListIcon, Search, RefreshCw } from 'lucide-react';

export function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Grid View"
                >
                    <LayoutGrid size={16} />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    title="List View"
                >
                    <ListIcon size={16} />
                </button>
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
      </div>

      {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
              Error: {error}
          </div>
      )}

      {loading && !applications.length ? (
        viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-xl border bg-gray-50 animate-pulse" />
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-lg border bg-gray-50 animate-pulse" />
                ))}
            </div>
        )
      ) : (
        <>
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                    <ApplicationCard key={app.name} app={app} />
                ))}
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">Application</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chart Info</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredApps.map((app) => (
                                    <ApplicationRow key={app.name} app={app} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {filteredApps.length === 0 && !loading && (
                <div className="py-12 text-center text-gray-500">
                    No applications found matching your search.
                </div>
            )}
        </>
      )}
    </div>
  );
}
