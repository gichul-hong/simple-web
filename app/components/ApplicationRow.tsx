import React from 'react';
import { Application } from '@/types/application';
import { ExternalLink, GitBranch, Box, Clock, CheckCircle, AlertCircle, Loader2, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import Link from 'next/link';

interface ApplicationRowProps {
  app: Application;
}

const statusConfig = {
  Healthy: { color: 'text-green-500', icon: CheckCircle, bg: 'bg-green-50 border-green-200' },
  Progressing: { color: 'text-blue-500', icon: Loader2, bg: 'bg-blue-50 border-blue-200' },
  Degraded: { color: 'text-red-500', icon: AlertCircle, bg: 'bg-red-50 border-red-200' },
  Suspended: { color: 'text-gray-500', icon: Box, bg: 'bg-gray-50 border-gray-200' },
  Missing: { color: 'text-orange-500', icon: XCircle, bg: 'bg-orange-50 border-orange-200' },
  Unknown: { color: 'text-gray-400', icon: HelpCircle, bg: 'bg-gray-50 border-gray-200' },
};

export function ApplicationRow({ app }: ApplicationRowProps) {
  const statusInfo = statusConfig[app.status] || statusConfig.Unknown;
  const StatusIcon = statusInfo.icon;

  return (
    <tr className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
      <td className="py-4 pl-4 pr-3 sm:pl-6">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold text-gray-900">{app.name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
               <Box size={12} />
               {app.namespace}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", statusInfo.bg, statusInfo.color)}>
            <StatusIcon size={14} className={app.status === 'Progressing' ? 'animate-spin' : ''} />
            {app.status}
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
        {app.project}
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
         <div className="flex flex-col">
            <span className="text-sm text-gray-900" title={app.chartName}>{app.chartName}</span>
            <span className="text-xs text-gray-500 font-mono">{app.chartRevision}</span>
         </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
             <Clock size={14} className="text-gray-400" />
             {new Date(app.creationTimestamp).toLocaleDateString()}
          </div>
      </td>
      <td className="py-4 pl-3 pr-4 sm:pr-6 text-right whitespace-nowrap text-sm font-medium">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {app.externalURL && (
                <Link 
                    href={app.externalURL} 
                    target="_blank" 
                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    title="Open Application"
                >
                    <ExternalLink size={16} />
                </Link>
            )}
            <Link 
                href={app.chartRepoUrl} 
                target="_blank"
                className="text-gray-400 hover:text-gray-900 flex items-center gap-1"
                title="View Source"
            >
                <GitBranch size={16} />
            </Link>
        </div>
      </td>
    </tr>
  );
}
