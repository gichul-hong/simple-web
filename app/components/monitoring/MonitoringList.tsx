'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AirflowInstanceMetric } from '@/types/monitoring';
import { MonitoringCard } from './MonitoringCard';
import { MonitoringRow } from './MonitoringRow';
import { Search, RefreshCw, ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useConfig } from '../providers/ConfigContext';

type SortDirection = 'asc' | 'desc';
type SortColumn = keyof AirflowInstanceMetric;

export function MonitoringList() {
  const [allMetrics, setAllMetrics] = useState<AirflowInstanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { authEnabled } = useConfig();
  
  // Sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>('namespace');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(60);

  const fetchMonitoringData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/monitoring`);
      
      if (authEnabled && response.status === 401) {
        signIn();
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const data: AirflowInstanceMetric[] = await response.json();
      setAllMetrics(data);
    } catch (err) {
        setError('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  }, [authEnabled]); // Depend on authEnabled

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchMonitoringData]);

  // Client-side filtering
  const filteredMetrics = useMemo(() => {
    if (!filter) return allMetrics;
    const lowerFilter = filter.toLowerCase();
    return allMetrics.filter(metric => 
      metric.namespace.toLowerCase().includes(lowerFilter)
    );
  }, [allMetrics, filter]);

  // Client-side sorting
  const sortedMetrics = useMemo(() => {
    const sortableMetrics = [...filteredMetrics];
    if (!sortColumn) return sortableMetrics;

    sortableMetrics.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' 
          ? valA - valB 
          : valB - valA;
      }
      return 0;
    });
    return sortableMetrics;
  }, [filteredMetrics, sortColumn, sortDirection]);

  // Client-side pagination
  const totalItems = sortedMetrics.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMetrics = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedMetrics.slice(startIndex, endIndex);
  }, [sortedMetrics, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
      }
  };

  const handleSort = (column: SortColumn) => {
      if (sortColumn === column) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortColumn(column);
          setSortDirection('asc');
      }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
      if (sortColumn !== column) return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
      return sortDirection === 'asc' 
        ? <ArrowUp size={14} className="ml-1 text-blue-600" /> 
        : <ArrowDown size={14} className="ml-1 text-blue-600" />;
  };

  const SortableHeader = ({ column, label, className = "" }: { column: SortColumn, label: string, className?: string }) => (
      <th 
        scope="col" 
        className={`px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center">
            {label}
            <SortIcon column={column} />
        </div>
      </th>
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search by namespace..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
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
                onClick={() => fetchMonitoringData()} 
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh Metrics
            </button>
        </div>
      </div>

      {loading && !paginatedMetrics.length ? (
        viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-64 rounded-xl border bg-gray-50 animate-pulse" />
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                 {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-20 rounded-lg border bg-gray-50 animate-pulse" />
                ))}
            </div>
        )
      ) : (
        <>
        {viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedMetrics.map((metric) => (
                    <MonitoringCard key={metric.namespace} metric={metric} />
                ))}
             </div>
        ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <SortableHeader column="namespace" label="Namespace" className="pl-4 sm:pl-6" />
                                <SortableHeader column="dag_run_success_count" label="DAG Success" />
                                <SortableHeader column="dag_run_failure_count" label="DAG Failure" />
                                <SortableHeader column="db_usage" label="DB Usage" />
                                <SortableHeader column="request_memory_used" label="Req Mem Used" />
                                <SortableHeader column="limit_memory_used" label="Limit Mem Used" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {paginatedMetrics.map((metric) => (
                                <MonitoringRow key={metric.namespace} metric={metric} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        </>
      )}
      
      {/* Pagination Controls */}
      {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                   <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 whitespace-nowrap">Rows per page:</span>
                      <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reset to first page on items per page change
                          }}
                          className="block w-20 rounded-md border-gray-300 py-1.5 text-base leading-5 bg-white text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={60}>60</option>
                          <option value={100}>100</option>
                      </select>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-nowrap">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                      <span className="font-medium">{totalItems}</span> results
                  </p>
              </div>
              <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft size={16} />
                      </button>
                      {totalPages <= 7 ? (
                          [...Array(totalPages)].map((_, i) => (
                              <button
                                  key={i + 1}
                                  onClick={() => handlePageChange(i + 1)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      currentPage === i + 1
                                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                              >
                                  {i + 1}
                              </button>
                          ))
                      ) : (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              Page {currentPage} of {totalPages}
                          </span>
                      )}
                      <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <span className="sr-only">Next</span>
                          <ChevronRight size={16} />
                      </button>
                  </nav>
              </div>
          </div>
      )}
    </div>
  );
}

