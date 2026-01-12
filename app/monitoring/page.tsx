'use client';

import { MonitoringList } from "../components/monitoring/MonitoringList";

export default function MonitoringPage() {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">System Monitoring</h1>
          <p className="mt-2 text-lg text-gray-600">
            Real-time performance metrics and resource usage.
          </p>
        </div>
        
        <MonitoringList />
      </div>
    );
  }
