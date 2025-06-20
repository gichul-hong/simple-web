"use client";

import { useState, useEffect } from 'react';
import { 
  fetchArgoCDApplications, 
  getStatusColor, 
  createArgoCDApplication,
  getWebUIUrl,
  getGitHubUrl,
  getGrafanaUrl,
  refreshApplication,
  type ArgoCDApplication 
} from '../lib/argocd';

export default function AirflowPage() {
  const [applications, setApplications] = useState<ArgoCDApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    const apps = await fetchArgoCDApplications();
    const airflowApplications = apps.filter(app => 
      app.metadata.namespace === 'airflow' || 
      app.metadata.name.includes('airflow') ||
      app.metadata.name.includes('dag')
    );
    setApplications(airflowApplications);
    setLoading(false);
  };

  // Load applications on component mount
  useEffect(() => {
    loadApplications();
  }, []);

  const handleCreateApplication = async () => {
    const applicationData = {
      metadata: {
        name: `airflow-app-${Date.now()}`,
        namespace: 'airflow'
      },
      spec: {
        project: 'default',
        source: {
          repoURL: 'https://github.com/example/airflow-dags',
          path: 'k8s/airflow',
          targetRevision: 'main'
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'airflow'
        },
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true
          }
        }
      }
    };

    const success = await createArgoCDApplication(applicationData);
    if (success) {
      alert('Application created successfully!');
      loadApplications(); // Refresh the list
    } else {
      alert('Failed to create application');
    }
  };

  const handleRefreshApplication = async (appName: string) => {
    setRefreshing(appName);
    const success = await refreshApplication(appName);
    if (success) {
      alert('Application refreshed successfully!');
      loadApplications(); // Refresh the list
    } else {
      alert('Failed to refresh application');
    }
    setRefreshing(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Airflow</h1>
            <button
              onClick={handleCreateApplication}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create Application
            </button>
          </div>
          
          <p className="text-gray-600 mb-8">
            Apache Airflow is an open-source platform to programmatically author, schedule, and monitor workflows.
          </p>

          {/* ArgoCD Applications Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ArgoCD Applications</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Currently showing dummy data. Real ArgoCD API integration is commented out.
              </p>
            </div>
            
            {applications.length > 0 ? (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app, index) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <a
                              href={getWebUIUrl(app)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                            >
                              Web UI
                            </a>
                            <a
                              href={getGitHubUrl(app)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded text-xs"
                            >
                              GitHub
                            </a>
                            <a
                              href={getGrafanaUrl(app)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded text-xs"
                            >
                              Grafana
                            </a>
                            <button
                              onClick={() => handleRefreshApplication(app.metadata.name)}
                              disabled={refreshing === app.metadata.name}
                              className={`text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs ${
                                refreshing === app.metadata.name ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {refreshing === app.metadata.name ? 'Refreshing...' : 'Refresh'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No Airflow-related applications found.</p>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">DAGs</h3>
              <p className="text-blue-700">Directed Acyclic Graphs for workflow orchestration</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Scheduling</h3>
              <p className="text-green-700">Automated task scheduling and execution</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Monitoring</h3>
              <p className="text-purple-700">Real-time workflow monitoring and alerting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 