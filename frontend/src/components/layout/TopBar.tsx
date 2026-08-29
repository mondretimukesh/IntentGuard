import { Link } from 'react-router-dom';
import { MaterialIcon } from '../ui/MaterialIcon';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="flex justify-between items-center w-full px-6 py-3.5 border-b border-border-subtle bg-background/50 backdrop-blur-md sticky top-0 z-40">
      {/* Left Title & Home Shortcut */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold hover:bg-amber-500/20 transition-all shrink-0"
          title="Return to Landing Page"
        >
          <MaterialIcon name="shield" className="text-sm icon-fill" />
          <span>Home</span>
        </Link>
        <span className="text-slate-600 hidden sm:inline">/</span>
        <div className="min-w-0">
          <h2 className="font-heading text-base sm:text-lg font-bold text-white truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="font-mono text-[11px] text-slate-400 truncate hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Workspace Toolbar: Actions & Account Profile */}
      <div className="flex items-center gap-3">
        {actions}

        <Link
          to="/settings"
          className="text-slate-400 hover:text-amber-400 transition-colors p-1"
          title="Account Settings"
        >
          <MaterialIcon name="account_circle" className="text-2xl" />
        </Link>
      </div>
    </header>
  );
}
