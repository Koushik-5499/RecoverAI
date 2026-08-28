import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, RefreshCw, FileText, BarChart3, Settings } from 'lucide-react';

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
    <aside className="w-64 bg-surface border-r border-border h-full flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-background" />
        </div>
        <span className="text-xl font-bold text-primary">RecoverAI</span>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted hover:bg-background hover:text-text'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 m-4 rounded-lg bg-background border border-border text-xs text-muted text-center">
        Demo Mode Active
      </div>
    </aside>
  );
};

export default Sidebar;
