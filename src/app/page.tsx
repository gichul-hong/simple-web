"use client";

import { useState, useEffect } from 'react';
import { 
  fetchClusterMetrics, 
  fetchServiceMetrics, 
  formatBytes, 
  getUtilizationColor,
  type ClusterMetrics,
  type ServiceMetrics 
} from './lib/metrics';

export default function HomePage() {
  const [clusterMetrics, setClusterMetrics] = useState<ClusterMetrics | null>(null);
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        const [cluster, service] = await Promise.all([
          fetchClusterMetrics(),
          fetchServiceMetrics()
        ]);
        setClusterMetrics(cluster);
        setServiceMetrics(service);
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
      setLoading(false);
    };

    loadMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading SharedPool metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clusterMetrics || !serviceMetrics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Failed to load metrics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SharedPool Dashboard</h1>
          <p className="text-gray-600">사내 배치 수행환경 SaaS 플랫폼 모니터링</p>
        </div>

        {/* Service Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Airflow Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Airflow</h2>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AF</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{serviceMetrics.airflow.instances}</div>
                <div className="text-sm text-gray-500">Instances</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getUtilizationColor(serviceMetrics.airflow.utilization).split(' ')[0]}`}>
                  {serviceMetrics.airflow.utilization}%
                </div>
                <div className="text-sm text-gray-500">Utilization</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{serviceMetrics.airflow.activeDags}</div>
                <div className="text-sm text-gray-500">Active DAGs</div>
              </div>
            </div>
          </div>

          {/* MLflow Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">MLflow</h2>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ML</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{serviceMetrics.mlflow.instances}</div>
                <div className="text-sm text-gray-500">Instances</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getUtilizationColor(serviceMetrics.mlflow.utilization).split(' ')[0]}`}>
                  {serviceMetrics.mlflow.utilization}%
                </div>
                <div className="text-sm text-gray-500">Utilization</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{serviceMetrics.mlflow.activeExperiments}</div>
                <div className="text-sm text-gray-500">Experiments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cluster Resources */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Kubernetes Cluster Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">CPU</h3>
                <span className="text-sm text-gray-500">Cores</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Usage</span>
                  <span className="font-medium">{clusterMetrics.cpu.used.toFixed(1)} / {clusterMetrics.cpu.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(clusterMetrics.cpu.used / clusterMetrics.cpu.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>Daily Avg: {clusterMetrics.cpu.dailyUsage.toFixed(1)}</div>
                  <div>Weekly Avg: {clusterMetrics.cpu.weeklyUsage.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Memory */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Memory</h3>
                <span className="text-sm text-gray-500">GB</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Usage</span>
                  <span className="font-medium">{clusterMetrics.memory.used.toFixed(1)} / {clusterMetrics.memory.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(clusterMetrics.memory.used / clusterMetrics.memory.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>Daily Avg: {clusterMetrics.memory.dailyUsage.toFixed(1)}</div>
                  <div>Weekly Avg: {clusterMetrics.memory.weeklyUsage.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* GPU */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">GPU</h3>
                <span className="text-sm text-gray-500">Units</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Usage</span>
                  <span className="font-medium">{clusterMetrics.gpu.used} / {clusterMetrics.gpu.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(clusterMetrics.gpu.used / clusterMetrics.gpu.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>Daily Avg: {clusterMetrics.gpu.dailyUsage.toFixed(1)}</div>
                  <div>Weekly Avg: {clusterMetrics.gpu.weeklyUsage.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Airflow Management</h3>
            <p className="text-blue-100 mb-4">DAG 배포 및 워크플로우 관리</p>
            <a href="/airflow" className="inline-block bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors">
              바로가기
            </a>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">MLflow Management</h3>
            <p className="text-orange-100 mb-4">ML 모델 실험 및 배포 관리</p>
            <a href="/mlflow" className="inline-block bg-white text-orange-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-50 transition-colors">
              바로가기
            </a>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">System Monitoring</h3>
            <p className="text-purple-100 mb-4">시스템 상태 및 성능 모니터링</p>
            <a href="/monitoring" className="inline-block bg-white text-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors">
              바로가기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
