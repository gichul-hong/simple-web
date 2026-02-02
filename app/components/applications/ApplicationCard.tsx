import React from 'react';
import { Application } from '@/types/application';
import { Box, Clock, CheckCircle, AlertCircle, Loader2, XCircle, HelpCircle, Wind, Activity, FolderOpen, Github, Heart } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import Link from 'next/link';
import { useConfig } from '../providers/ConfigContext';

interface ApplicationCardProps {
  app: Application;
}

const statusConfig = {
  Healthy: { color: 'text-green-600', icon: CheckCircle, bg: 'bg-green-100', border: 'border-green-200' },
  Progressing: { color: 'text-blue-600', icon: Loader2, bg: 'bg-blue-100', border: 'border-blue-200' },
  Degraded: { color: 'text-red-600', icon: AlertCircle, bg: 'bg-red-100', border: 'border-red-200' },
  Suspended: { color: 'text-foreground/70', icon: Box, bg: 'bg-gray-100', border: 'border-border' },
  Missing: { color: 'text-primary-text', icon: XCircle, bg: 'bg-primary-light', border: 'border-primary' },
  Unknown: { color: 'text-foreground/60', icon: HelpCircle, bg: 'bg-gray-100', border: 'border-border' },
};

export function ApplicationCard({ app }: ApplicationCardProps) {
  const statusInfo = statusConfig[app.status] || statusConfig.Unknown;
  const StatusIcon = statusInfo.icon;
  const { githubBaseUrl, grafanaBaseUrl } = useConfig();

  const githubUrl = `${githubBaseUrl}/${app.namespace}/airflow-dags`;
  const grafanaUrl = `${grafanaBaseUrl}?project_name=${app.namespace}`;

  // Generate a consistent "avatar" color based on the app name
  const avatarColors = [
    'bg-red-100 text-red-600',
    'bg-primary-light text-primary-text',
    'bg-secondary-light text-secondary-text',
    'bg-secondary-light text-secondary-text', // yellow -> secondary
    'bg-lime-100 text-lime-600',
    'bg-green-100 text-green-600',
    'bg-emerald-100 text-emerald-600',
    'bg-teal-100 text-teal-600',
    'bg-cyan-100 text-cyan-600',
    'bg-sky-100 text-sky-600',
    'bg-blue-100 text-blue-600',
    'bg-indigo-100 text-indigo-600',
    'bg-violet-100 text-violet-600',
    'bg-purple-100 text-purple-600',
    'bg-fuchsia-100 text-fuchsia-600',
    'bg-pink-100 text-pink-600',
    'bg-rose-100 text-rose-600',
  ];
  const colorIndex = app.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  return (
    <div className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        
        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col gap-4">
            {/* Header: Avatar + Title + Status Badge */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0", avatarColor)}>
                        {app.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1" title={app.name}>
                            {app.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                            <span className="hover:underline cursor-pointer">{app.namespace}</span>
                            <span className="text-gray-300">•</span>
                            <span>{app.project}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content: Chart Info */}
             <div className="mt-1 flex items-center gap-2">
                <div className="inline-flex items-center px-2 py-1 rounded-md bg-background/80 text-xs font-mono text-foreground/80 border border-border/50 truncate max-w-full">
                    {app.chartName} @ {app.chartRevision}
                </div>
            </div>
        </div>

        {/* Card Footer */}
        <div className="px-4 py-3 bg-background/50 border-t border-border/50 flex items-center justify-between text-xs">
            {/* Status Pill */}
             <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border", statusInfo.bg, statusInfo.color, statusInfo.border)}>
                 <StatusIcon size={12} className={app.status === 'Progressing' ? 'animate-spin' : ''} />
                 <span className="font-medium">{app.status}</span>
            </div>

            {/* Actions / Links */}
            <div className="flex items-center gap-3 text-foreground/50">
                <span className="flex items-center gap-1" title={`Created: ${new Date(app.creationTimestamp).toLocaleDateString()}`}>
                    <Clock size={12} />
                    <span>{new Date(app.creationTimestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </span>

                <div className="h-3 w-px bg-border"></div>

                <div className="flex items-center gap-2">
                    {app.externalURL ? (
                        <Link href={app.externalURL} target="_blank" className="hover:text-primary transition-colors" title="Airflow">
                            <Wind size={14} />
                        </Link>
                    ) : (
                        <span className="text-foreground/40 cursor-not-allowed" title="Airflow not available">
                            <Wind size={14} />
                        </span>
                    )}

                    <Link href={grafanaUrl} target="_blank" className="hover:text-primary transition-colors" title="Grafana">
                        <Activity size={14} />
                    </Link>

                    {app.fileBrowserUrl ? (
                        <Link href={app.fileBrowserUrl} target="_blank" className="hover:text-secondary transition-colors" title="File Browser">
                            <FolderOpen size={14} />
                        </Link>
                    ) : (
                        <span className="text-foreground/40 cursor-not-allowed" title="File Browser not available">
                            <FolderOpen size={14} />
                        </span>
                    )}
                    
                    <Link href={githubUrl} target="_blank" className="hover:text-foreground transition-colors" title="GitHub">
                         <Github size={14} />
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
