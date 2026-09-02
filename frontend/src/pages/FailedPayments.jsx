import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Search, ArrowRight, FileQuestion } from 'lucide-react';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';

const FailedPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await apiClient.get('/payments');
        setPayments(res.data);
      } catch (err) {
        console.error("Failed to fetch payments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const q = searchQuery.toLowerCase();
    const txn = payment.transaction_id ? String(payment.transaction_id).toLowerCase() : '';
    const email = payment.customer_email ? String(payment.customer_email).toLowerCase() : '';
    return txn.includes(q) || email.includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SectionCard
        title="Failed Payments"
        description="Review and manage payment failures across your organization."
        className="p-0 border-none shadow-none bg-transparent"
        action={
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="input pl-9 w-64 bg-surface"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        }
      />

      <SectionCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-background/50 border-b border-border/50">
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Failure Reason</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map(payment => (
                  <tr 
                    key={payment.id} 
                    onClick={() => navigate(`/payments/${payment.id}`)}
                    className="group hover:bg-background/40 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                        {payment.transaction_id || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted">{payment.customer_email || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-text">${payment.amount.toFixed(2)}</span>
                      <span className="text-xs text-muted ml-1 uppercase">{payment.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text truncate max-w-[200px]">{payment.failure_reason || payment.failure_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-muted hover:text-primary transition-all hover:bg-primary/10 rounded-lg inline-flex group-hover:translate-x-1">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-muted">
                      <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center mb-3 border border-border/50">
                        <FileQuestion className="w-6 h-6 text-muted" />
                      </div>
                      <p className="text-base font-medium text-text">No payments found</p>
                      <p className="text-sm mt-1">We couldn't find any failed payments matching your criteria.</p>
                    </div>
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

export default FailedPayments;
