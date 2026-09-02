import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Activity, ShieldAlert, Zap, Cpu, CreditCard, RefreshCw } from 'lucide-react';
import SectionCard from '../components/ui/SectionCard';

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

  const getEventStyle = (action) => {
    const act = action?.toUpperCase() || '';
    if (act.includes('AI_ANALYSIS')) return { icon: Cpu, color: 'text-primary', bg: 'bg-primary/10' };
    if (act.includes('POLICY_REJECTED')) return { icon: ShieldAlert, color: 'text-warning', bg: 'bg-warning/10' };
    if (act.includes('RECOVERY') || act.includes('EXECUTED')) return { icon: Zap, color: 'text-success', bg: 'bg-success/10' };
    if (act.includes('PAYMENT') || act.includes('RAZORPAY')) return { icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/10' };
    return { icon: Activity, color: 'text-muted', bg: 'bg-muted/10' };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SectionCard title="System Audit Trail" description="Enterprise-grade immutable activity log.">
        
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted">No audit logs found.</div>
        ) : (
          <div className="relative border-l border-border/50 ml-4 mt-6 space-y-8">
            {logs.map((log) => {
              const { icon: Icon, color, bg } = getEventStyle(log.action);
              return (
                <div key={log.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[18px] top-1 w-9 h-9 rounded-full ${bg} flex items-center justify-center border-4 border-surface shadow-sm`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  
                  <div className="bg-background/40 hover:bg-background/60 transition-colors border border-border/50 rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${color}`}>{log.action}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface border border-border/50 text-muted">
                          {log.entity_type} #{log.entity_id}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-muted whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-text/80 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </SectionCard>
    </div>
  );
};

export default AuditTrail;
