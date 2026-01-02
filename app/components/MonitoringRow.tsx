import React from 'react';
import { MonitoredApplication } from '@/types/monitoring';
import { cn } from '@/app/lib/utils';
import { Database, HardDrive, Cpu, CheckCircle2, XCircle } from 'lucide-react';

interface MonitoringRowProps {
  app: MonitoredApplication;
}

export function MonitoringRow({ app }: MonitoringRowProps) {
  const { metrics } = app;
  const s3Percent = (metrics.s3Usage / metrics.s3Quota) * 100;
  
  const cpuReqPercent = (metrics.cpuRequest / metrics.cpuQuota) * 100;
  const cpuLimPercent = (metrics.cpuLimit / metrics.cpuQuota) * 100;
  const memReqPercent = (metrics.memRequest / metrics.memQuota) * 100;
  const memLimPercent = (metrics.memLimit / metrics.memQuota) * 100;

  return (
    <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
      <td className="py-4 pl-4 pr-3 sm:pl-6">
         <div>
            <div className="font-semibold text-gray-900">{app.name}</div>
            <div className="text-xs text-gray-500">{app.namespace}</div>
         </div>
      </td>
      
      {/* S3 Usage */}
      <td className="px-3 py-4">
        <div className="w-32 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
                <span>{metrics.s3Usage}GB</span>
                <span className="text-gray-400">/ {metrics.s3Quota}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={cn("h-full rounded-full", s3Percent > 90 ? "bg-red-500" : "bg-blue-500")} 
                    style={{ width: `${Math.min(s3Percent, 100)}%` }} 
                />
            </div>
        </div>
      </td>

      {/* DB Usage */}
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
            <Database size={14} className="text-gray-400" />
            {metrics.dbUsage} MB
        </div>
      </td>

      {/* DagRuns */}
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={12} />
                <span className="text-xs font-bold">{metrics.dagRunOkCount}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                <XCircle size={12} />
                <span className="text-xs font-bold">{metrics.dagRunKoCount}</span>
            </div>
        </div>
      </td>

      {/* Resources (CPU/Mem) */}
      <td className="px-3 py-4">
         <div className="flex gap-6">
             {/* CPU Section */}
             <div className="space-y-2 w-32">
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400">
                    <Cpu size={10} /> CPU (Req/Lim vs Quota)
                </div>
                <div className="space-y-1">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden" title={`Req: ${metrics.cpuRequest} / Quota: ${metrics.cpuQuota}`}>
                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min(cpuReqPercent, 100)}%` }} />
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden" title={`Lim: ${metrics.cpuLimit} / Quota: ${metrics.cpuQuota}`}>
                        <div className="h-full bg-indigo-300" style={{ width: `${Math.min(cpuLimPercent, 100)}%` }} />
                    </div>
                </div>
             </div>

             {/* Mem Section */}
             <div className="space-y-2 w-32">
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400">
                    <HardDrive size={10} /> Mem (Req/Lim vs Quota)
                </div>
                <div className="space-y-1">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden" title={`Req: ${metrics.memRequest} / Quota: ${metrics.memQuota}`}>
                        <div className="h-full bg-purple-500" style={{ width: `${Math.min(memReqPercent, 100)}%` }} />
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden" title={`Lim: ${metrics.memLimit} / Quota: ${metrics.memQuota}`}>
                        <div className="h-full bg-purple-300" style={{ width: `${Math.min(memLimPercent, 100)}%` }} />
                    </div>
                </div>
             </div>
         </div>
      </td>
    </tr>
  );
}
