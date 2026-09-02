import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, RefreshCw, FileText, BarChart3, Settings, User } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Failed Payments', path: '/payments', icon: AlertCircle },
    { name: 'Recovery Actions', path: '/recovery', icon: RefreshCw },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Audit Trail', path: '/audit', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border/50 h-full flex flex-col shadow-2xl relative z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <RefreshCw className="w-5 h-5 text-background" />
        </div>
        <span className="text-xl font-bold text-gradient-gold">RecoverAI</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-inner'
                  : 'text-muted hover:bg-background hover:text-text'
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border/50 mt-auto">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-background cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
            <User className="w-4 h-4 text-muted" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text">Admin User</span>
            <span className="text-xs text-muted">admin@recoverai.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
