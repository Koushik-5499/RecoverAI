import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/': return { title: 'Dashboard', desc: 'Executive overview and metrics' };
      case '/payments': return { title: 'Failed Payments', desc: 'Manage and review failed transactions' };
      case '/recovery': return { title: 'Recovery Actions', desc: 'Track automated and manual recovery attempts' };
      case '/analytics': return { title: 'Analytics', desc: 'Deep dive into recovery performance' };
      case '/audit': return { title: 'Audit Trail', desc: 'System-wide event logging' };
      case '/settings': return { title: 'Settings', desc: 'System configuration and integration status' };
      default: 
        if (location.pathname.startsWith('/payments/')) {
          return { title: 'Payment Details', desc: 'Detailed view and AI analysis' };
        }
        return { title: 'RecoverAI', desc: '' };
    }
  };

  const { title, desc } = getPageInfo();

  return (
    <header className="h-[72px] bg-surface/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-text">{title}</h1>
        {desc && <p className="text-xs text-muted mt-0.5">{desc}</p>}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search payments..." 
            className="input pl-9 w-64 h-9 bg-background/50 border-border/50 text-sm focus:bg-background"
          />
        </div>
        
        <button className="relative text-muted hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute 1 top-0 right-0 w-2 h-2 bg-danger rounded-full border border-surface"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
