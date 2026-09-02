import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../api/client';
import { CheckCircle, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';
import MetricCard from '../components/ui/MetricCard';

const RecoveryActions = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const res = await apiClient.get('/recovery/actions');
        setActions(res.data);
      } catch (err) {
        console.error("Failed to fetch recovery actions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActions();
  }, []);

  const stats = useMemo(() => {
    let executed = 0;
    let failed = 0;
    let recommended = 0;
    let rejected = 0;
    actions.forEach(a => {
      if (a.status === 'EXECUTED') executed++;
      else if (a.status === 'FAILED' || a.status === 'ERROR') failed++;
      else if (a.status === 'RECOMMENDED') recommended++;
      else if (a.status === 'REJECTED') rejected++;
    });
    return { executed, failed, recommended, rejected };
  }, [actions]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Recommended" value={stats.recommended} icon={RefreshCw} />
        <MetricCard title="Executed" value={stats.executed} icon={CheckCircle} />
        <MetricCard title="Failed" value={stats.failed} icon={AlertTriangle} />
        <MetricCard title="Rejected" value={stats.rejected} icon={XCircle} />
      </div>

      <SectionCard title="Recovery Action Log" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-background/50 border-b border-border/50">
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Action ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">AI Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : actions.length > 0 ? (
                actions.map(action => (
                  <tr key={action.id} className="hover:bg-background/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-text font-medium">#{action.id}</td>
                    <td className="px-6 py-4 text-sm text-muted">#{action.payment_id}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text bg-surface px-2 py-1 rounded border border-border/50">
                        {action.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={action.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${action.ai_confidence_score >= 80 ? 'text-success' : action.ai_confidence_score >= 50 ? 'text-warning' : 'text-danger'}`}>
                        {action.ai_confidence_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted max-w-[300px] truncate" title={action.ai_reasoning}>
                      {action.ai_reasoning || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted">
                    No recovery actions recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default RecoveryActions;
