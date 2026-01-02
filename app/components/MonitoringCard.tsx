import React from 'react';
import { MonitoredApplication } from '@/types/monitoring';
import { cn } from '@/app/lib/utils';
import { Database, HardDrive, Cpu, CheckCircle2, XCircle } from 'lucide-react';

interface MetricProgressProps {
  current: number;
  total: number;
  unit: string;
  label: string;
  icon: React.ElementType;
}

function MetricProgress({ current, total, unit, label, icon: Icon }: MetricProgressProps) {
  const percentage = Math.min((current / total) * 100, 100);
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
            {current.toLocaleString()} / {total.toLocaleString()} {unit}
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
  app: MonitoredApplication;
}

export function MonitoringCard({ app }: MonitoringCardProps) {
  const { metrics } = app;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
           <h3 className="font-bold text-gray-900 truncate w-48" title={app.name}>{app.name}</h3>
           <p className="text-xs text-gray-500">{app.namespace}</p>
        </div>
        <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
            app.status === 'Healthy' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
        )}>
            {app.status}
        </span>
      </div>
      
      <div className="space-y-4">
        <MetricProgress 
            label="S3 Usage" 
            current={metrics.s3Usage} 
            total={metrics.s3Quota} 
            unit="GB" 
            icon={Database} 
        />
        
        <div className="space-y-3 pt-1">
             <MetricProgress 
                label="CPU Request" 
                current={metrics.cpuRequest} 
                total={metrics.cpuQuota} 
                unit="Core" 
                icon={Cpu} 
            />
             <MetricProgress 
                label="CPU Limit" 
                current={metrics.cpuLimit} 
                total={metrics.cpuQuota} 
                unit="Core" 
                icon={Cpu} 
            />
             <MetricProgress 
                label="Mem Request" 
                current={metrics.memRequest} 
                total={metrics.memQuota} 
                unit="GB" 
                icon={HardDrive} 
            />
             <MetricProgress 
                label="Mem Limit" 
                current={metrics.memLimit} 
                total={metrics.memQuota} 
                unit="GB" 
                icon={HardDrive} 
            />
        </div>

        <div className="pt-2 grid grid-cols-2 gap-3 border-t border-gray-50">
           <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <span className="text-xs text-gray-500 font-medium">DB Usage</span>
              <span className="text-xs font-bold text-gray-700">{metrics.dbUsage} MB</span>
           </div>
           
           <div className="flex items-center justify-center gap-3 bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center gap-1 text-green-600" title="Success Runs">
                <CheckCircle2 size={14} />
                <span className="text-xs font-bold">{metrics.dagRunOkCount}</span>
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="flex items-center gap-1 text-red-500" title="Failed Runs">
                <XCircle size={14} />
                <span className="text-xs font-bold">{metrics.dagRunKoCount}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}