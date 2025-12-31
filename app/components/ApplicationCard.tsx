import React from 'react';
import { Application } from '@/types/application';
import { ExternalLink, GitBranch, Box, Clock, CheckCircle, AlertCircle, Loader2, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import Link from 'next/link';

interface ApplicationCardProps {
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

export function ApplicationCard({ app }: ApplicationCardProps) {
  const statusInfo = statusConfig[app.status] || statusConfig.Unknown;
  const StatusIcon = statusInfo.icon;

  return (
    <div className={cn("rounded-xl border p-6 transition-all hover:shadow-md bg-white", statusInfo.bg)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{app.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Box size={14} />
            {app.namespace}
          </p>
        </div>
        <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white shadow-sm", statusInfo.color)}>
          <StatusIcon size={16} className={app.status === 'Progressing' ? 'animate-spin' : ''} />
          {app.status}
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
            <span className="font-semibold w-24">Project:</span>
            <span>{app.project}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="font-semibold w-24">Chart:</span>
            <div className="flex items-center gap-1 overflow-hidden">
                <span className="truncate" title={app.chartName}>{app.chartName}</span>
                <span className="text-gray-400">@</span>
                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{app.chartRevision}</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="font-semibold w-24">Created:</span>
            <span className="flex items-center gap-1">
                <Clock size={14} />
                {new Date(app.creationTimestamp).toLocaleDateString()}
            </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200/60">
        {app.externalURL && (
            <Link 
                href={app.externalURL} 
                target="_blank" 
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
                Open App <ExternalLink size={14} />
            </Link>
        )}
        <Link 
             href={app.chartRepoUrl} 
             target="_blank"
             className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
        >
             Repo <GitBranch size={14} />
        </Link>
      </div>
    </div>
  );
}
