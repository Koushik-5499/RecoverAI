import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ArrowLeft, Cpu, Play, CheckCircle, AlertTriangle, FileText, Activity } from 'lucide-react';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';
import ConfidenceMeter from '../components/ui/ConfidenceMeter';

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
        setAnalysisResult({ type: 'rejected', reason: res.data.reason, confidence: res.data.confidence });
      } else {
        setAnalysisResult({ 
          type: 'success', 
          actionId: res.data.action_id,
          recommendation: res.data.recommended_action,
          confidence: res.data.confidence,
          reasoning: res.data.reasoning
        });
      }
    } catch (err) {
      console.error("Analysis failed", err);
      setAnalysisResult({ type: 'error', message: "Analysis failed. Please check logs." });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecute = async (actionId) => {
    setExecuting(true);
    try {
      const res = await apiClient.post(`/recovery/execute/${actionId}`);
      if (res.data.status === 'success') {
        setAnalysisResult(prev => ({ ...prev, executed: true, executeMessage: 'Action executed successfully.' }));
      } else {
        setAnalysisResult(prev => ({ ...prev, executed: true, executeMessage: `Execution returned status: ${res.data.status}` }));
      }
      // Refresh payment data
      const paymentRes = await apiClient.get(`/payments/${id}`);
      setPayment(paymentRes.data);
    } catch (err) {
      console.error("Execution failed", err);
      setAnalysisResult(prev => ({ ...prev, executed: true, executeMessage: "Execution failed (see logs)." }));
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-muted">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-xl font-medium text-text">Payment Not Found</p>
        <button onClick={() => navigate('/payments')} className="mt-4 text-primary hover:underline">Return to list</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/payments')}
        className="flex items-center gap-2 text-muted hover:text-text transition-colors group mb-2"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Payments</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard>
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm font-medium text-muted uppercase tracking-wider mb-1">Transaction</p>
                <h1 className="text-3xl font-bold text-text font-mono tracking-tight">{payment.transaction_id || 'N/A'}</h1>
                <p className="text-muted mt-2">{payment.customer_email}</p>
              </div>
              <StatusBadge status={payment.status} className="text-sm px-3 py-1" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4 mb-2">
              <div>
                <p className="text-sm text-muted mb-1">Amount</p>
                <p className="text-2xl font-bold text-text">${payment.amount.toFixed(2)} <span className="text-base text-muted uppercase font-normal">{payment.currency}</span></p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Failure Code</p>
                <p className="text-text font-medium">{payment.failure_code || 'None'}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Retries</p>
                <p className="text-text font-medium">{payment.recovery_retries}</p>
              </div>
              <div className="col-span-2 md:col-span-3">
                <p className="text-sm text-muted mb-2">Failure Reason</p>
                <div className="bg-background/50 p-4 rounded-lg border border-border/50 text-text text-sm font-medium">
                  {payment.failure_reason || 'No reason provided by gateway.'}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: AI Analysis & Actions */}
        <div className="space-y-6">
          <SectionCard className="border-t-4 border-t-primary">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-text">AI Recovery Engine</h2>
            </div>
            
            {payment.status === 'RECOVERED' ? (
              <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg text-success">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm font-medium leading-relaxed">
                  This payment has been successfully recovered. No further AI action required.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {!analysisResult ? (
                  <button 
                    onClick={handleAnalyze} 
                    disabled={analyzing}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  >
                    {analyzing ? (
                      <>
                        <Activity className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4" />
                        Run AI Analysis
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Confidence Meter if available */}
                    {analysisResult.confidence !== undefined && analysisResult.confidence !== null && (
                      <ConfidenceMeter score={analysisResult.confidence} />
                    )}
                    
                    {analysisResult.type === 'success' && (
                      <div className="space-y-4 pt-2">
                        <div>
                          <p className="text-xs text-muted mb-1 uppercase tracking-wider">Recommendation</p>
                          <p className="text-sm font-medium text-text bg-background/50 p-3 rounded-lg border border-border/50">
                            {analysisResult.recommendation || `Action ID: ${analysisResult.actionId}`}
                          </p>
                        </div>
                        {analysisResult.reasoning && (
                          <div>
                            <p className="text-xs text-muted mb-1 uppercase tracking-wider">AI Reasoning</p>
                            <p className="text-sm text-muted italic border-l-2 border-primary/50 pl-3">
                              "{analysisResult.reasoning}"
                            </p>
                          </div>
                        )}
                        
                        {!analysisResult.executed ? (
                          <button 
                            onClick={() => handleExecute(analysisResult.actionId)}
                            disabled={executing}
                            className="btn-secondary w-full flex items-center justify-center gap-2 mt-4"
                          >
                            {executing ? (
                              <>
                                <Activity className="w-4 h-4 animate-spin" />
                                Executing...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Execute Recovery Action
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-lg text-sm text-text">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>{analysisResult.executeMessage}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {analysisResult.type === 'rejected' && (
                      <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-warning font-semibold text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Rejected by Policy Engine</span>
                        </div>
                        <p className="text-sm text-text/80">{analysisResult.reason}</p>
                      </div>
                    )}
                    
                    {analysisResult.type === 'error' && (
                      <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-danger font-semibold text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Analysis Error</span>
                        </div>
                        <p className="text-sm text-text/80">{analysisResult.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
