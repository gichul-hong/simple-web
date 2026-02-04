import React from 'react';
import { AirflowInstanceMetric } from '@/types/monitoring';
import { cn } from '@/app/lib/utils';
import { Database, HardDrive, CheckCircle2, XCircle, Settings } from 'lucide-react';

interface MonitoringRowProps {
  metric: AirflowInstanceMetric;
  onOpenLifecycleModal: (namespace: string) => void;
}

export function MonitoringRow({ metric, onOpenLifecycleModal }: MonitoringRowProps) {
  return (
    <tr className="hover:bg-background/50 transition-colors border-b border-border last:border-0">
      <td className="py-4 pl-4 pr-3 sm:pl-6">
         <div>
            <div className="font-semibold text-foreground">{metric.namespace}</div>
            <div className="text-xs text-foreground/70">Airflow Instance</div>
         </div>
      </td>
      
      {/* Dag O/X */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground/80">
        <div className="flex items-center gap-1.5">
          <span className="text-green-600 font-bold">{metric.dagRunSuccessCount ?? 'N/A'}</span>
          <span>/</span>
          <span className="text-red-500 font-bold">{metric.dagRunFailureCount ?? 'N/A'}</span>
        </div>
      </td>

      {/* S3 Usage */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground/80">
        <div className="flex items-center gap-1.5">
            <Database size={14} className="text-foreground/60" />
            <div>
              <span>{metric.s3BucketUsage?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'}</span>
              <span className="text-foreground/60"> / {metric.s3BucketQuota?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'} GB</span>
            </div>
        </div>
      </td>
      
      {/* Lifecycle Actions */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground/80">
        <button onClick={() => onOpenLifecycleModal(metric.namespace)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors" title="Edit Lifecycle">
          <Settings size={16} />
        </button>
      </td>

      {/* DB Usage */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground/80">
        <div className="flex items-center gap-1.5">
            <Database size={14} className="text-foreground/60" />
            {metric.dbUsage?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'} MB
        </div>
      </td>

      {/* Requested Memory */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground/80">
        <div className="flex items-center gap-1.5">
            <HardDrive size={14} className="text-foreground/60" />
            {(metric.requestMemoryUsed?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A')} / {(metric.requestMemoryQuota?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A')} GB
        </div>
      </td>
      
      {/* Limited Memory */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground/80">
        <div className="flex items-center gap-1.5">
            <HardDrive size={14} className="text-foreground/60" />
            {(metric.limitMemoryUsed?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A')} / {(metric.limitMemoryQuota?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A')} GB
        </div>
      </td>
    </tr>
  );
}
