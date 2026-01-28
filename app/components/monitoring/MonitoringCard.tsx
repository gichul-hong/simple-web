import React from 'react';
import { AirflowInstanceMetric } from '@/types/monitoring';
import { cn } from '@/app/lib/utils';
import { Database, HardDrive, CheckCircle2, XCircle, Info } from 'lucide-react'; // Added Info icon for generic info

interface MetricProgressProps {
  current: number;
  total: number;
  unit: string;
  label: string;
  icon: React.ElementType;
}

function MetricProgress({ current, total, unit, label, icon: Icon }: MetricProgressProps) {
  const c = current ?? 0;
  const t = total ?? 0;
  const percentage = t > 0 ? Math.min((c / t) * 100, 100) : 0;
  // Determine color based on usage
  let color = 'bg-blue-500';
  if (percentage > 90) color = 'bg-red-500';
  else if (percentage > 75) color = 'bg-amber-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
         <div className="flex items-center gap-1.5 text-gray-600">
            <Icon size={12} />
            <span className="font-medium">{label}</span>
         </div>
         <span className="text-gray-500">
            {current?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'} / {total?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'} {unit}
         </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
            className={cn("h-full rounded-full transition-all", color)} 
            style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}

interface MonitoringCardProps {
  metric: AirflowInstanceMetric;
}

export function MonitoringCard({ metric }: MonitoringCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
           <h3 className="font-bold text-gray-900 truncate w-48" title={metric.namespace}>{metric.namespace}</h3>
           <p className="text-xs text-gray-500">Airflow Instance</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <MetricProgress 
            label="Requested Memory" 
            current={metric.request_memory_used} 
            total={metric.request_memory_quota} 
            unit="GB" 
            icon={HardDrive} 
        />
        <MetricProgress 
            label="Limited Memory" 
            current={metric.limit_memory_used} 
            total={metric.limit_memory_quota} 
            unit="GB" 
            icon={HardDrive} 
        />

        <div className="pt-2 grid grid-cols-2 gap-3 border-t border-gray-50">
           <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <span className="text-xs text-gray-500 font-medium">DB Usage</span>
              <span className="text-xs font-bold text-gray-700">{metric.db_usage?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? 'N/A'} MB</span>
           </div>
           
           <div className="flex items-center justify-center gap-3 bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center gap-1 text-green-600" title="Success Runs">
                <CheckCircle2 size={14} />
                <span className="text-xs font-bold">{metric.dag_run_success_count ?? 'N/A'}</span>
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="flex items-center gap-1 text-red-500" title="Failed Runs">
                <XCircle size={14} />
                <span className="text-xs font-bold">{metric.dag_run_failure_count ?? 'N/A'}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}