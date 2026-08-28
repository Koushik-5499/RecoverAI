import { Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-end px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="text-muted hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
};

export default Header;
