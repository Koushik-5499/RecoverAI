import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiClient.get('/audit-logs');
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Audit Trail</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="p-4 text-sm font-medium text-muted">Time</th>
              <th className="p-4 text-sm font-medium text-muted">Entity</th>
              <th className="p-4 text-sm font-medium text-muted">Action</th>
              <th className="p-4 text-sm font-medium text-muted">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center text-muted">Loading...</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-4 text-sm text-muted whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-4 text-sm text-text font-medium">
                  {log.entity_type} #{log.entity_id}
                </td>
                <td className="p-4 text-sm text-primary">
                  {log.action}
                </td>
                <td className="p-4 text-sm text-muted max-w-md truncate" title={log.details}>
                  {log.details}
                </td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr><td colSpan="4" className="p-4 text-center text-muted">No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;
