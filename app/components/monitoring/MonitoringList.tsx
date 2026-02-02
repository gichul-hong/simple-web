'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AirflowInstanceMetric } from '@/types/monitoring';
import { MonitoringCard } from './MonitoringCard';
import { MonitoringRow } from './MonitoringRow';
import { RefreshCw, LayoutGrid, List as ListIcon, ArrowUpDown, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useConfig } from '../providers/ConfigContext';
import { cn } from '@/app/lib/utils';

type SortDirection = 'asc' | 'desc';
type SortColumn = keyof AirflowInstanceMetric;

export function MonitoringList() {
  const [allMetrics, setAllMetrics] = useState<AirflowInstanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { authEnabled } = useConfig();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // New state for period
  const [period, setPeriod] = useState<number>(1);

  // Sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>('namespace');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchMonitoringData = useCallback(async (currentPeriod: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/monitoring?period=${currentPeriod}`);
      
      if (authEnabled && response.status === 401) {
        signIn();
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const responseData = await response.json();
      let extractedData = responseData.data;

      // Handle nested array if present
      if (Array.isArray(extractedData) && extractedData.length > 0 && Array.isArray(extractedData[0])) {
        extractedData = extractedData[0];
      }
      
      const data: AirflowInstanceMetric[] = extractedData || [];
      setAllMetrics(data);
    } catch (err) {
        setError('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  }, [authEnabled]);

  useEffect(() => {
    fetchMonitoringData(period);
    const interval = setInterval(() => fetchMonitoringData(period), 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchMonitoringData, period]);

  // Client-side filtering
  const filteredMetrics = useMemo(() => {
    if (!query) return allMetrics;
    const lowerCaseQuery = query.toLowerCase();
    return allMetrics.filter(metric => 
      metric.namespace.toLowerCase().includes(lowerCaseQuery)
    );
  }, [allMetrics, query]);

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

  const SortableHeader = ({ column, label, className = "", isDynamic = false }: { column: SortColumn, label: string, className?: string, isDynamic?: boolean }) => (
      <th 
        scope="col" 
        className={`px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center" title={isDynamic ? "Value changes based on selected period" : ""}>
            {label}
            {isDynamic && <Clock size={12} className="ml-1.5 text-gray-400" />}
            <SortIcon column={column} />
        </div>
      </th>
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200">
                {[1, 7, 30].map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                            period === p ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        )}
                    >
                        {p}D
                    </button>
                ))}
            </div>
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
                onClick={() => fetchMonitoringData(period)} 
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh Metrics
            </button>
        </div>
      </div>

      {loading && !sortedMetrics.length ? (
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
        {sortedMetrics.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
                No metrics found matching your search.
            </div>
        ) : viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedMetrics.map((metric) => (
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
                                <SortableHeader column="dag_run_success_count" label="DAG O/X" />
                                <SortableHeader column="s3BucketUsage" label="S3 Usage" />
                                <SortableHeader column="db_usage" label="DB Usage" />
                                <SortableHeader column="request_memory_used" label="Req Mem Used" isDynamic={true} />
                                <SortableHeader column="limit_memory_used" label="Limit Mem Used" isDynamic={true} />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {sortedMetrics.map((metric) => (
                                <MonitoringRow key={metric.namespace} metric={metric} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        </>
      )}
    </div>
  );
}
