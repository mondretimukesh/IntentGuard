import { NavLink } from 'react-router-dom';
import { MaterialIcon } from '../ui/MaterialIcon';

const userNavItems = [
  { to: '/scan', icon: 'search_check', label: 'Scan APK' },
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/history', icon: 'history', label: 'Scan History' },
  { to: '/settings', icon: 'settings', label: 'Account Settings' },
];

const adminNavItems = [
  { to: '/admin', icon: 'shield_lock', label: 'Admin Portal' },
];

export function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 border-r border-border-subtle bg-surface/80 backdrop-blur-xl shadow-md z-50 py-6 px-3">
      {/* Brand */}
      <NavLink to="/" className="mb-6 flex items-center gap-3 px-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
          <MaterialIcon name="shield" className="text-primary icon-fill text-xl" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-primary tracking-tight leading-none">
            IntentShield
          </h1>
          <p className="font-mono text-xs text-on-surface-dim mt-0.5 tracking-wide">
            Analyst-Grade APK CTI
          </p>
        </div>
      </NavLink>

      {/* Nav Links */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* User Navigation Section */}
        <div>
          <span className="font-mono text-[10px] uppercase text-slate-400 font-bold tracking-wider px-4 block mb-2">
            Analyst Workspace
          </span>
          <ul className="space-y-1">
            {userNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'text-primary font-bold bg-primary/10 border-r-2 border-primary scale-[0.98]'
                        : 'text-on-surface-dim font-medium hover:bg-surface-highest hover:text-primary'
                    }`
                  }
                >
                  <MaterialIcon
                    name={item.icon}
                    className="text-lg group-hover:scale-110 transition-transform duration-150"
                  />
                  <span className="font-body text-sm">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* System Admin Section */}
        <div>
          <span className="font-mono text-[10px] uppercase text-slate-400 font-bold tracking-wider px-4 block mb-2">
            Administration
          </span>
          <ul className="space-y-1">
            {adminNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'text-amber-400 font-bold bg-amber-500/10 border-r-2 border-amber-500 scale-[0.98]'
                        : 'text-on-surface-dim font-medium hover:bg-surface-highest hover:text-amber-400'
                    }`
                  }
                >
                  <MaterialIcon
                    name={item.icon}
                    className="text-lg group-hover:scale-110 transition-transform duration-150"
                  />
                  <span className="font-body text-sm">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Auth Links & Action CTA */}
      <div className="mt-auto space-y-2 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2">
          <NavLink
            to="/login"
            className="btn-secondary text-xs py-2 text-center flex items-center justify-center gap-1"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/signup"
            className="btn-secondary text-xs py-2 text-center flex items-center justify-center gap-1"
          >
            Sign Up
          </NavLink>
        </div>

        <NavLink
          to="/scan"
          className="w-full btn-primary text-sm py-2.5 shadow-glow flex items-center justify-center gap-2"
        >
          <MaterialIcon name="add" className="text-base" />
          New Analysis
        </NavLink>
      </div>
    </nav>
  );
}
