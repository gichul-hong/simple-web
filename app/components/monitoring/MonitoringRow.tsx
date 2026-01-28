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
      
      {/* Dag O/X */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="text-green-600 font-bold">{metric.dag_run_success_count ?? 'N/A'}</span>
          <span>/</span>
          <span className="text-red-500 font-bold">{metric.dag_run_failure_count ?? 'N/A'}</span>
        </div>
      </td>

      {/* S3 Usage */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
            <Database size={14} className="text-gray-400" />
            {metric.s3BucketUsage?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'} GB
        </div>
      </td>

      {/* DB Usage */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
            <Database size={14} className="text-gray-400" />
            {metric.db_usage?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'} MB
        </div>
      </td>

      {/* Requested Memory */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
            <HardDrive size={14} className="text-gray-400" />
            {(metric.request_memory_used?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A')} / {(metric.request_memory_quota?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A')} GB
        </div>
      </td>
      
      {/* Limited Memory */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
            <HardDrive size={14} className="text-gray-400" />
            {(metric.limit_memory_used?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A')} / {(metric.limit_memory_quota?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A')} GB
        </div>
      </td>
    </tr>
  );
}
