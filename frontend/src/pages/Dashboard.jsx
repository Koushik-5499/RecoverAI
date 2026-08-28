import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../api/client';
import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_failed_count: 0,
    total_recovered_count: 0,
    recovery_success_rate: 0
  });
  const [revenue, setRevenue] = useState({
    revenue_at_risk: 0,
    recovered_revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, revenueRes] = await Promise.all([
          apiClient.get('/analytics'),
          apiClient.get('/analytics/revenue-at-risk')
        ]);
        setMetrics(metricsRes.data);
        setRevenue(revenueRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = [
    { name: 'Jan', recovered: 400, failed: 240 },
    { name: 'Feb', recovered: 300, failed: 139 },
    { name: 'Mar', recovered: 200, failed: 980 },
    { name: 'Apr', recovered: 278, failed: 390 },
    { name: 'May', recovered: 189, failed: 480 },
    { name: 'Jun', recovered: 239, failed: 380 },
  ]; // Placeholder for historical chart

  if (loading) return <div className="text-muted">Loading metrics...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Revenue at Risk" 
          value={`$${revenue.revenue_at_risk.toFixed(2)}`} 
          icon={AlertCircle} 
          color="text-danger" 
        />
        <MetricCard 
          title="Recovered Revenue" 
          value={`$${revenue.recovered_revenue.toFixed(2)}`} 
          icon={DollarSign} 
          color="text-success" 
        />
        <MetricCard 
          title="Failed Payments" 
          value={metrics.total_failed_count} 
          icon={AlertCircle} 
          color="text-warning" 
        />
        <MetricCard 
          title="Success Rate" 
          value={`${metrics.recovery_success_rate}%`} 
          icon={CheckCircle} 
          color="text-primary" 
        />
      </div>

      <div className="card h-96">
        <h2 className="text-lg font-semibold mb-4 text-text">Recovery Performance</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2C3A47" />
            <XAxis dataKey="name" stroke="#C5C6C7" />
            <YAxis stroke="#C5C6C7" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2833', borderColor: '#2C3A47', color: '#F8F9FA' }} />
            <Bar dataKey="recovered" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            <Bar dataKey="failed" fill="#E04F5F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }) => (
  <div className="card flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-muted mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-text">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg bg-background border border-border ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default Dashboard;
