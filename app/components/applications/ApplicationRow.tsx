import React from 'react';
import { Application } from '@/types/application';
import { ExternalLink, GitBranch, Box, Clock, CheckCircle, AlertCircle, Loader2, XCircle, HelpCircle, Wind, Activity, FolderOpen, Github } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import Link from 'next/link';
import { useConfig } from '../providers/ConfigContext';

interface ApplicationRowProps {
  app: Application;
}

const statusConfig = {
  Healthy: { color: 'text-green-500', icon: CheckCircle, bg: 'bg-green-50 border-green-200' },
  Progressing: { color: 'text-blue-500', icon: Loader2, bg: 'bg-blue-50 border-blue-200' },
  Degraded: { color: 'text-red-500', icon: AlertCircle, bg: 'bg-red-50 border-red-200' },
  Suspended: { color: 'text-foreground/70', icon: Box, bg: 'bg-gray-50 border-border' },
  Missing: { color: 'text-primary', icon: XCircle, bg: 'bg-primary-light border-primary' },
  Unknown: { color: 'text-foreground/60', icon: HelpCircle, bg: 'bg-gray-50 border-border' },
};

export function ApplicationRow({ app }: ApplicationRowProps) {
  const statusInfo = statusConfig[app.status] || statusConfig.Unknown;
  const StatusIcon = statusInfo.icon;
  const { githubBaseUrl, grafanaBaseUrl } = useConfig();

  const githubUrl = `${githubBaseUrl}/${app.namespace}/airflow-dags`;
  const grafanaUrl = `${grafanaBaseUrl}?project_name=${app.namespace}`;

  return (
    <tr className="group hover:bg-background/50 transition-colors border-b border-border last:border-0">
      <td className="py-4 pl-4 pr-3 sm:pl-6">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold text-foreground">{app.name}</div>
            <div className="text-xs text-foreground/70 flex items-center gap-1 mt-0.5">
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
      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground/80">
        {app.project}
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
         <div className="flex flex-col">
            <span className="text-sm text-foreground" title={app.chartName}>{app.chartName}</span>
            <span className="text-xs text-foreground/70 font-mono">{app.chartRevision}</span>
         </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-foreground/70">
          <div className="flex items-center gap-1.5">
             <Clock size={14} className="text-foreground/60" />
             {new Date(app.creationTimestamp).toLocaleDateString()}
          </div>
      </td>
      <td className="py-4 pl-3 pr-4 sm:pr-6 text-right whitespace-nowrap text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
            {/* Airflow Link */}
            {app.externalURL ? (
                <Link 
                    href={app.externalURL} 
                    target="_blank" 
                    className="p-1.5 rounded-md text-primary hover:bg-primary-light transition-colors"
                    title="Open Airflow"
                >
                    <Wind size={16} />
                </Link>
            ) : (
                <span 
                    className="p-1.5 rounded-md text-foreground/40 cursor-not-allowed"
                    title="Airflow not available"
                >
                    <Wind size={16} />
                </span>
            )}

            {/* Grafana Link */}
            <Link 
                href={grafanaUrl}
                target="_blank"
                className="p-1.5 rounded-md text-primary-text hover:bg-primary-light transition-colors"
                title="Open Grafana"
            >
                <Activity size={16} />
            </Link>

            {/* FileBrowser Link */}
            {app.fileBrowserUrl ? (
                <Link 
                    href={app.fileBrowserUrl}
                    target="_blank"
                    className="p-1.5 rounded-md text-secondary-text hover:bg-secondary-light transition-colors"
                    title="File Browser"
                >
                    <FolderOpen size={16} />
                </Link>
            ) : (
                <span
                    className="p-1.5 rounded-md text-foreground/40 cursor-not-allowed"
                    title="File Browser not available"
                >
                    <FolderOpen size={16} />
                </span>
            )}

            {/* GitHub Link */}
            <Link 
                href={githubUrl}
                target="_blank"
                className="p-1.5 rounded-md text-foreground/80 hover:bg-gray-100 transition-colors"
                title="GitHub Repo"
            >
                <Github size={16} />
            </Link>
        </div>
      </td>
    </tr>
  );
}
