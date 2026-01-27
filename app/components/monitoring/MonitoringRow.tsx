import React from 'react';
import { AirflowInstanceMetric } from '@/types/monitoring';
import { cn } from '@/app/lib/utils';
import { Database, HardDrive, CheckCircle2, XCircle } from 'lucide-react';

interface MonitoringRowProps {
  metric: AirflowInstanceMetric;
}

export function MonitoringRow({ metric }: MonitoringRowProps) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
      <td className="py-4 pl-4 pr-3 sm:pl-6">
         <div>
            <div className="font-semibold text-gray-900">{metric.namespace}</div>
            <div className="text-xs text-gray-500">Airflow Instance</div>
         </div>
      </td>
      
      {/* DagRuns */}
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={12} />
                <span className="text-xs font-bold">{metric.dag_run_success_count}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                <XCircle size={12} />
                <span className="text-xs font-bold">{metric.dag_run_failure_count}</span>
            </div>
        </div>
      </td>

      {/* DB Usage */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
            <Database size={14} className="text-gray-400" />
            {metric.db_usage.toLocaleString(undefined, { maximumFractionDigits: 2 })} MB
        </div>
      </td>

      {/* Requested Memory */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
            <HardDrive size={14} className="text-gray-400" />
            {metric.request_memory_used.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {metric.request_memory_quota.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB
        </div>
      </td>
      
      {/* Limited Memory */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
            <HardDrive size={14} className="text-gray-400" />
            {metric.limit_memory_used.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {metric.limit_memory_quota.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB
        </div>
      </td>
    </tr>
  );
}
