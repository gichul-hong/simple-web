export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Monitoring</h1>
          <p className="text-gray-600 mb-4">
            Comprehensive monitoring and observability platform for your applications and infrastructure.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-teal-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-teal-900 mb-2">Metrics</h3>
              <p className="text-teal-700">Real-time performance metrics and analytics</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Alerts</h3>
              <p className="text-yellow-700">Proactive alerting and notification system</p>
            </div>
            <div className="bg-pink-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-pink-900 mb-2">Logs</h3>
              <p className="text-pink-700">Centralized logging and log analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 