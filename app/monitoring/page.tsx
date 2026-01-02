export default function MonitoringPage() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Monitoring</h1>
          <p className="mt-2 text-lg text-gray-600">
            System status and performance metrics.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
             <div className="mt-4 flex items-center gap-2 text-green-600">
                <div className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse"></div>
                <span className="font-medium">All Systems Operational</span>
             </div>
          </div>
          {/* Add more monitoring widgets here */}
        </div>
      </div>
    );
  }
