import { fetchArgoCDApplications, getStatusColor, type ArgoCDApplication } from '../lib/argocd';

export default async function MLflowPage() {
  const applications = await fetchArgoCDApplications();
  
  // Filter applications related to MLflow
  const mlflowApplications = applications.filter(app => 
    app.metadata.namespace === 'mlflow' || 
    app.metadata.name.includes('mlflow') ||
    app.metadata.name.includes('model') ||
    app.metadata.name.includes('training')
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">MLflow</h1>
          <p className="text-gray-600 mb-8">
            MLflow is an open-source platform for managing the end-to-end machine learning lifecycle.
          </p>

          {/* ArgoCD Applications Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ArgoCD Applications</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Currently showing dummy data. Real ArgoCD API integration is commented out.
              </p>
            </div>
            
            {mlflowApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Namespace
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Health Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sync Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mlflowApplications.map((app, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {app.metadata.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.metadata.namespace}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status.health.status)}`}>
                            {app.status.health.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status.sync.status)}`}>
                            {app.status.sync.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No MLflow-related applications found.</p>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Tracking</h3>
              <p className="text-orange-700">Experiment tracking and model versioning</p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Models</h3>
              <p className="text-red-700">Model packaging and deployment management</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Registry</h3>
              <p className="text-indigo-700">Centralized model registry and lifecycle management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 