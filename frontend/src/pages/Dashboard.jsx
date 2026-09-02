import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../api/client';
import { DollarSign, AlertCircle, CheckCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import MetricCard from '../components/ui/MetricCard';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';

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
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, revenueRes, paymentsRes] = await Promise.all([
          apiClient.get('/analytics'),
          apiClient.get('/analytics/revenue-at-risk'),
          apiClient.get('/payments?limit=5')
        ]);
        setMetrics(metricsRes.data);
        setRevenue(revenueRes.data);
        setRecentPayments(paymentsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Without a timeseries API, we just format the current totals for a visual representation
  const chartData = [
    { name: 'Total', atRisk: revenue.revenue_at_risk, recovered: revenue.recovered_revenue }
  ];

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Revenue at Risk" 
          value={`$${revenue.revenue_at_risk.toFixed(2)}`} 
          icon={AlertCircle} 
          description="Total pending recovery"
        />
        <MetricCard 
          title="Recovered Revenue" 
          value={`$${revenue.recovered_revenue.toFixed(2)}`} 
          icon={DollarSign} 
          trend="Positive"
          trendUp={true}
        />
        <MetricCard 
          title="Failed Payments" 
          value={metrics.total_failed_count} 
          icon={TrendingUp} 
          description="Total tracked"
        />
        <MetricCard 
          title="Success Rate" 
          value={`${metrics.recovery_success_rate}%`} 
          icon={CheckCircle} 
          description="Of attempted recoveries"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* AI Recovery Overview */}
        <SectionCard 
          title="AI Recovery Overview" 
          description="Revenue at risk vs recovered"
          className="xl:col-span-2"
        >
          <div className="h-80 mt-4">
            {chartData[0].atRisk === 0 && chartData[0].recovered === 0 ? (
              <div className="h-full flex items-center justify-center text-muted">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E04F5F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E04F5F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#C5C6C7" tickLine={false} axisLine={false} />
                  <YAxis stroke="#C5C6C7" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2833', borderColor: '#2C3A47', borderRadius: '8px' }}
                    itemStyle={{ color: '#F8F9FA' }}
                  />
                  <Area type="monotone" dataKey="recovered" name="Recovered" stroke="#4CAF50" fillOpacity={1} fill="url(#colorRecovered)" />
                  <Area type="monotone" dataKey="atRisk" name="At Risk" stroke="#E04F5F" fillOpacity={1} fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        {/* Recent Failed Payments */}
        <SectionCard 
          title="Recent Failures" 
          action={<Link to="/payments" className="text-sm text-primary hover:text-primaryHover font-medium flex items-center gap-1">View all <ArrowUpRight className="w-4 h-4" /></Link>}
        >
          <div className="space-y-4 mt-2">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No recent failed payments.</p>
            ) : (
              recentPayments.map((payment) => (
                <Link 
                  key={payment.id} 
                  to={`/payments/${payment.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-background/50 transition-colors border border-transparent hover:border-border/50 group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                      {payment.customer_id}
                    </span>
                    <span className="text-xs text-muted truncate max-w-[150px]">
                      {payment.failure_reason || payment.failure_code}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-text">
                      ${payment.amount.toFixed(2)}
                    </span>
                    <StatusBadge status={payment.status} className="mt-1" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </SectionCard>

      </div>
    </div>
  );
};

export default Dashboard;
