import { useState } from 'react';
import { Save, Server, Database, Cpu, CreditCard, ShieldCheck } from 'lucide-react';
import SectionCard from '../components/ui/SectionCard';

const Settings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('recoverai_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      maxRetries: 2,
      highValueThreshold: 1000,
      emailRemindersEnabled: true
    };
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('recoverai_settings', JSON.stringify(settings));
    setSuccessMessage('Settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const IntegrationStatus = ({ icon: Icon, name, description }) => (
    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-surface rounded-lg border border-border/50">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-text">{name}</h4>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success"></span>
        <span className="text-xs font-medium text-success">Configured</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System Integrations (Read Only) */}
        <div className="space-y-6">
          <SectionCard title="System Integrations" description="Core backend services and their current status.">
            <div className="space-y-4 mt-2">
              <IntegrationStatus 
                icon={Server} 
                name="Application Environment" 
                description="Production Mode" 
              />
              <IntegrationStatus 
                icon={Database} 
                name="Supabase PostgreSQL" 
                description="Primary Database" 
              />
              <IntegrationStatus 
                icon={Cpu} 
                name="Google Gemini API" 
                description="AI Recovery Engine" 
              />
              <IntegrationStatus 
                icon={CreditCard} 
                name="Razorpay Gateway" 
                description="Payment Processing & Webhooks" 
              />
              <div className="mt-4 p-3 bg-surface border border-border/50 rounded-lg flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-success shrink-0" />
                <p className="text-xs text-muted leading-relaxed">
                  All sensitive credentials (API keys, database URLs, and webhook secrets) are securely managed via backend environment variables and are never exposed to the client.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Policy Engine Rules */}
        <div className="space-y-6">
          <SectionCard title="Policy Engine Rules" description="Configure automated thresholds and actions.">
            <form onSubmit={handleSave} className="space-y-6 mt-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Max Recovery Retries</label>
                  <input 
                    type="number" 
                    name="maxRetries"
                    value={settings.maxRetries}
                    onChange={handleChange}
                    className="input w-full bg-background/50"
                  />
                  <p className="text-xs text-muted mt-1.5">Maximum number of automated retry attempts per payment.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">High Value Threshold ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input 
                      type="number" 
                      name="highValueThreshold"
                      value={settings.highValueThreshold}
                      onChange={handleChange}
                      className="input w-full pl-8 bg-background/50"
                    />
                  </div>
                  <p className="text-xs text-muted mt-1.5">Payments above this amount will be escalated for manual review.</p>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      name="emailRemindersEnabled"
                      checked={settings.emailRemindersEnabled}
                      onChange={handleChange}
                      className="w-5 h-5 cursor-pointer appearance-none bg-background border border-border rounded checked:bg-primary checked:border-primary transition-colors peer"
                    />
                    <svg className="absolute w-3 h-3 text-background left-1 top-1 pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7L5 10L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <label className="text-sm font-medium text-text cursor-pointer" onClick={() => setSettings(prev => ({...prev, emailRemindersEnabled: !prev.emailRemindersEnabled}))}>
                    Enable Automated Email Reminders
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex items-center gap-4">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
                {successMessage && (
                  <span className="text-success text-sm font-medium animate-pulse">
                    {successMessage}
                  </span>
                )}
              </div>
            </form>
          </SectionCard>
        </div>

      </div>
    </div>
  );
};

export default Settings;
