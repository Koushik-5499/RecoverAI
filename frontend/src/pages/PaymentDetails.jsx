import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ArrowLeft, Cpu, Play, CheckCircle, AlertTriangle } from 'lucide-react';

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await apiClient.get(`/payments/${id}`);
        setPayment(res.data);
      } catch (err) {
        console.error("Failed to fetch payment details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await apiClient.post(`/recovery/analyze/${id}`);
      if (res.data.status === 'rejected') {
        setAnalysisResult({ type: 'rejected', reason: res.data.reason });
      } else {
        setAnalysisResult({ type: 'success', actionId: res.data.action_id });
      }
    } catch (err) {
      console.error("Analysis failed", err);
      setAnalysisResult({ type: 'error', message: "Analysis failed. Please try again." });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecute = async (actionId) => {
    setExecuting(true);
    try {
      const res = await apiClient.post(`/recovery/execute/${actionId}`);
      if (res.data.status === 'success') {
        setAnalysisResult(prev => ({ ...prev, executed: true }));
        // Refresh payment data
        const paymentRes = await apiClient.get(`/payments/${id}`);
        setPayment(paymentRes.data);
      }
    } catch (err) {
      console.error("Execution failed", err);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <div className="text-muted">Loading...</div>;
  if (!payment) return <div className="text-muted">Payment not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <button 
        onClick={() => navigate('/payments')}
        className="flex items-center gap-2 text-muted hover:text-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Payments</span>
      </button>

      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text mb-1">Transaction {payment.transaction_id}</h1>
            <p className="text-muted">{payment.customer_email}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
            payment.status === 'FAILED' ? 'bg-danger/10 text-danger border-danger/20' :
            payment.status === 'RECOVERED' ? 'bg-success/10 text-success border-success/20' :
            'bg-primary/10 text-primary border-primary/20'
          }`}>
            {payment.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-muted mb-1">Amount</p>
            <p className="text-xl font-semibold text-text">${payment.amount.toFixed(2)} {payment.currency}</p>
          </div>
          <div>
            <p className="text-sm text-muted mb-1">Failure Code</p>
            <p className="text-text font-medium">{payment.failure_code}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted mb-1">Failure Reason</p>
            <p className="text-text bg-background p-3 rounded-md border border-border">{payment.failure_reason}</p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-text mb-4">AI Recovery Engine</h2>
          
          {payment.status === 'RECOVERED' ? (
            <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg text-success">
              <CheckCircle className="w-5 h-5" />
              <span>This payment has been successfully recovered.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={handleAnalyze} 
                disabled={analyzing || payment.status === 'RECOVERED'}
                className="btn-primary flex items-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </button>

              {analysisResult && (
                <div className="mt-6 p-4 rounded-lg bg-background border border-border">
                  {analysisResult.type === 'success' && !analysisResult.executed && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <CheckCircle className="w-5 h-5" />
                        <span>Action Recommended (ID: {analysisResult.actionId})</span>
                      </div>
                      <p className="text-muted text-sm">The policy engine approved the recommended action.</p>
                      <button 
                        onClick={() => handleExecute(analysisResult.actionId)}
                        disabled={executing}
                        className="btn-secondary flex items-center gap-2 mt-2"
                      >
                        <Play className="w-4 h-4" />
                        {executing ? 'Executing...' : 'Execute Recovery Action'}
                      </button>
                    </div>
                  )}
                  {analysisResult.type === 'rejected' && (
                    <div className="space-y-2 text-warning">
                      <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Action Rejected by Policy Engine</span>
                      </div>
                      <p className="text-sm">Reason: {analysisResult.reason}</p>
                    </div>
                  )}
                  {analysisResult.executed && (
                    <div className="flex items-center gap-2 text-success font-medium">
                      <CheckCircle className="w-5 h-5" />
                      <span>Action executed successfully.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
