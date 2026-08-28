import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Search, ArrowRight } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text">Failed Payments</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="input pl-9 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="p-4 text-sm font-medium text-muted">Transaction ID</th>
              <th className="p-4 text-sm font-medium text-muted">Customer</th>
              <th className="p-4 text-sm font-medium text-muted">Amount</th>
              <th className="p-4 text-sm font-medium text-muted">Failure Code</th>
              <th className="p-4 text-sm font-medium text-muted">Status</th>
              <th className="p-4 text-sm font-medium text-muted">Retries</th>
              <th className="p-4 text-sm font-medium text-muted text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="p-4 text-center text-muted">Loading...</td></tr>
            ) : filteredPayments.map(payment => (
              <tr 
                key={payment.id} 
                onClick={() => navigate(`/payments/${payment.id}`)}
                className="border-b border-border hover:bg-background/50 transition-colors cursor-pointer"
              >
                <td className="p-4 text-sm text-text font-medium">{payment.transaction_id}</td>
                <td className="p-4 text-sm text-muted">{payment.customer_email}</td>
                <td className="p-4 text-sm text-text">${payment.amount.toFixed(2)}</td>
                <td className="p-4 text-sm text-muted">
                  <span className="px-2 py-1 bg-surface border border-border rounded text-xs">
                    {payment.failure_code}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    payment.status === 'FAILED' ? 'bg-danger/10 text-danger border-danger/20' :
                    payment.status === 'RECOVERED' ? 'bg-success/10 text-success border-success/20' :
                    'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted">{payment.recovery_retries}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // prevent double navigation if they click the button
                      navigate(`/payments/${payment.id}`);
                    }}
                    className="p-2 text-muted hover:text-primary transition-colors hover:bg-primary/10 rounded-lg inline-flex"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && !loading && (
              <tr><td colSpan="7" className="p-4 text-center text-muted">No failed payments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FailedPayments;
