"use client";

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorMessage } from '../components/ErrorMessage';
import { 
  fetchArgoCDApplications, 
  getStatusColor, 
  getWebUIUrl,
  getGitHubUrl,
  getGrafanaUrl,
  refreshApplication,
  type ArgoCDApplication 
} from '../lib/argocd';
import { handleApiError, getErrorMessage, type ApiError } from '../lib/errorHandling';

export default function MonitoringPage() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<ArgoCDApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apps = await fetchArgoCDApplications();
      const monitoringApplications = apps.filter(app => 
        app.metadata.namespace === 'monitoring' || 
        app.metadata.name.includes('monitoring') ||
        app.metadata.name.includes('grafana') ||
        app.metadata.name.includes('prometheus')
      );
      setApplications(monitoringApplications);
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Error loading applications:', apiError);
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  // Load applications on component mount
  useEffect(() => {
    if (session) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleRefreshApplication = async (appName: string) => {
    setRefreshing(appName);
    setError(null);
    
    try {
      await refreshApplication(appName);
      alert('Application refreshed successfully!');
      loadApplications(); // Refresh the list
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('Error refreshing application:', apiError);
      setError(apiError);
      alert(`Failed to refresh application: ${getErrorMessage(apiError)}`);
    } finally {
      setRefreshing(null);
    }
  };

  // Show loading while checking authentication status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">SP</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">SharedPool Admin Portal</h1>
              <p className="text-gray-600 mb-8">
                이 페이지에 접근하려면 로그인이 필요합니다.
              </p>
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">로그인이 필요합니다</h2>
                <p className="text-gray-600 mb-6">
                  모니터링 기능을 사용하려면 GitHub 계정으로 로그인해주세요.
                </p>
                <button
                  onClick={() => signIn("github")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
                >
                  GitHub로 로그인
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Monitoring</h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              System monitoring and observability tools for the SharedPool platform.
            </p>

            {/* Error Display */}
            {error && (
              <div className="mb-6">
                <ErrorMessage
                  title="Error Loading Applications"
                  message={getErrorMessage(error)}
                  type="error"
                  onRetry={loadApplications}
                  showRetry={true}
                />
              </div>
            )}

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
                  <p className="text-gray-500">No monitoring-related applications found.</p>
                </div>
              )}
            </div>

            {/* Monitoring Tools Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Grafana</h3>
                <p className="text-purple-700">Visualization and analytics platform</p>
                <a 
                  href="http://localhost:3001" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Open Grafana →
                </a>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Prometheus</h3>
                <p className="text-blue-700">Time series database and monitoring</p>
                <a 
                  href="http://localhost:9090" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Open Prometheus →
                </a>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">AlertManager</h3>
                <p className="text-green-700">Alert routing and notification system</p>
                <a 
                  href="http://localhost:9093" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Open AlertManager →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 