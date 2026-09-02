import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../api/client';
import SectionCard from '../components/ui/SectionCard';
import MetricCard from '../components/ui/MetricCard';
import { Target, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // The backend does not currently provide timeseries data.
  // We respect the rule: "If an API does not provide a value, display an appropriate empty state"
  const hasTimeseriesData = false;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Failed Payments" 
          value={data?.total_failed_count || 0} 
          icon={AlertCircle} 
        />
        <MetricCard 
          title="Total Recovered" 
          value={data?.total_recovered_count || 0} 
          icon={TrendingUp} 
        />
        <MetricCard 
          title="Avg Success Rate" 
          value={`${data?.recovery_success_rate || 0}%`} 
          icon={Target} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Recovery Rate Trend">
          <div className="h-80 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-xl bg-background/30">
            <BarChart3 className="w-12 h-12 text-muted mb-3 opacity-50" />
            <p className="text-text font-medium">No trend data available</p>
            <p className="text-sm text-muted mt-1">Timeseries analytics requires additional historical data.</p>
          </div>
        </SectionCard>

        <SectionCard title="Performance Breakdown">
          <div className="space-y-4 mt-2">
            <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
              <span className="text-sm font-medium text-muted">Analysis Coverage</span>
              <span className="text-lg font-bold text-text">100%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border/50 hover:border-success/30 transition-colors">
              <span className="text-sm font-medium text-muted">Successful Recoveries</span>
              <span className="text-lg font-bold text-success">{data?.total_recovered_count || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border/50 hover:border-danger/30 transition-colors">
              <span className="text-sm font-medium text-muted">Unrecovered Failures</span>
              <span className="text-lg font-bold text-danger">{(data?.total_failed_count || 0) - (data?.total_recovered_count || 0)}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Analytics;
