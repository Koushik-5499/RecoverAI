import { useState } from 'react';
import { Save } from 'lucide-react';

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
      apiKey: 'sk-mock-key-****************',
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

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-text">Settings</h1>
      
      <div className="card">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Policy Engine Rules</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Max Recovery Retries</label>
                <input 
                  type="number" 
                  name="maxRetries"
                  value={settings.maxRetries}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">High Value Threshold ($)</label>
                <input 
                  type="number" 
                  name="highValueThreshold"
                  value={settings.highValueThreshold}
                  onChange={handleChange}
                  className="input w-full"
                />
                <p className="text-xs text-muted mt-1">Payments above this amount will be escalated for manual review.</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  name="emailRemindersEnabled"
                  checked={settings.emailRemindersEnabled}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
                <label className="text-sm font-medium text-text">Enable Automated Email Reminders</label>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-text mb-4">Integrations</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">OpenAI API Key</label>
                <input 
                  type="password" 
                  name="apiKey"
                  value={settings.apiKey}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
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
      </div>
    </div>
  );
};

export default Settings;
