import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../api/client';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch more detailed time-series data
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

  const recoveryTrend = [
    { day: 'Mon', rate: 45 },
    { day: 'Tue', rate: 52 },
    { day: 'Wed', rate: 48 },
    { day: 'Thu', rate: 61 },
    { day: 'Fri', rate: 59 },
    { day: 'Sat', rate: 65 },
    { day: 'Sun', rate: 70 },
  ];

  if (loading) return <div className="text-muted">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card h-80">
          <h2 className="text-lg font-semibold mb-4 text-text">Recovery Rate Trend</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recoveryTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C3A47" />
              <XAxis dataKey="day" stroke="#C5C6C7" />
              <YAxis stroke="#C5C6C7" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2833', borderColor: '#2C3A47', color: '#F8F9FA' }} />
              <Line type="monotone" dataKey="rate" stroke="#C5A880" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-80">
          <h2 className="text-lg font-semibold mb-4 text-text">Overall Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-background rounded-lg border border-border">
              <span className="text-muted">Total Failed Payments</span>
              <span className="text-xl font-bold text-text">{data?.total_failed_count}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-background rounded-lg border border-border">
              <span className="text-muted">Total Recovered</span>
              <span className="text-xl font-bold text-success">{data?.total_recovered_count}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-background rounded-lg border border-border">
              <span className="text-muted">Avg Success Rate</span>
              <span className="text-xl font-bold text-primary">{data?.recovery_success_rate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
