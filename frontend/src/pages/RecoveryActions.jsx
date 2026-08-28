import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Recovery Actions</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="p-4 text-sm font-medium text-muted">ID</th>
              <th className="p-4 text-sm font-medium text-muted">Payment ID</th>
              <th className="p-4 text-sm font-medium text-muted">Action Type</th>
              <th className="p-4 text-sm font-medium text-muted">Status</th>
              <th className="p-4 text-sm font-medium text-muted">Confidence</th>
              <th className="p-4 text-sm font-medium text-muted">Reasoning</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center text-muted">Loading...</td></tr>
            ) : actions.map(action => (
              <tr key={action.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4 text-sm text-text">#{action.id}</td>
                <td className="p-4 text-sm text-muted">#{action.payment_id}</td>
                <td className="p-4 text-sm text-text font-medium">{action.action_type}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    action.status === 'FAILED' ? 'bg-danger/10 text-danger border-danger/20' :
                    action.status === 'EXECUTED' ? 'bg-success/10 text-success border-success/20' :
                    'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {action.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted">{action.ai_confidence_score}%</td>
                <td className="p-4 text-sm text-muted max-w-xs truncate" title={action.ai_reasoning}>
                  {action.ai_reasoning}
                </td>
              </tr>
            ))}
            {actions.length === 0 && !loading && (
              <tr><td colSpan="6" className="p-4 text-center text-muted">No actions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecoveryActions;
