import React from 'react';
import { Application } from '@/types/application';
import { ExternalLink, GitBranch, Box, Clock, CheckCircle, AlertCircle, Loader2, XCircle, HelpCircle, Wind, Activity, FolderOpen, Github } from 'lucide-react';
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

  const githubBaseUrl = process.env.NEXT_PUBLIC_GITHUB_BASE_URL || 'https://github.com';
  const grafanaBaseUrl = process.env.NEXT_PUBLIC_GRAFANA_BASE_URL || 'https://grafana.example.com';

  const githubUrl = `${githubBaseUrl}/${app.namespace}/airflow-dags`;
  const grafanaUrl = `${grafanaBaseUrl}?project_name=${app.namespace}`;

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
        {/* Airflow Link */}
        {app.externalURL && (
            <Link 
                href={app.externalURL} 
                target="_blank" 
                className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                title="Open Airflow"
            >
                <Wind size={18} />
            </Link>
        )}

        {/* Grafana Link */}
        <Link 
            href={grafanaUrl}
            target="_blank"
            className="p-2 rounded-lg text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
            title="Open Grafana"
        >
            <Activity size={18} />
        </Link>

        {/* FileBrowser Link */}
        {app.fileBrowserUrl && (
            <Link 
                href={app.fileBrowserUrl}
                target="_blank"
                className="p-2 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                title="File Browser"
            >
                <FolderOpen size={18} />
            </Link>
        )}

        {/* GitHub Link */}
        <Link 
             href={githubUrl}
             target="_blank"
             className="p-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
             title="GitHub Repo"
        >
             <Github size={18} />
        </Link>
      </div>
    </div>
  );
}
