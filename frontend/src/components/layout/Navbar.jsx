import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Menu, X, LogOut, User } from 'lucide-react';

const ROLE_BADGE = {
  ADMIN:      { cls: 'text-purple-400 bg-purple-400/10 border-purple-400/30',   emoji: '🛡️'  },
  AUTHORITY:  { cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30',         emoji: '🏛️'  },
  RESEARCH:   { cls: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',          emoji: '🔬'  },
  FARMER:     { cls: 'text-risk-low bg-risk-lowBg border-risk-low/30',           emoji: '🌾'  },
  TRAVELLER:  { cls: 'text-risk-moderate bg-risk-moderateBg border-risk-moderate/30', emoji: '🧭' },
  PUBLIC:     { cls: 'text-brand-muted bg-brand-border/20 border-brand-border',  emoji: '👤'  },
};

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <defs>
      <linearGradient id="nb-flame" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ff6b35"/>
        <stop offset="100%" stopColor="#ffd500"/>
      </linearGradient>
    </defs>
    <path
      d="M12 2C12 2 16 7 16 11C16 12.7 14.9 13.9 14 13.5C14.8 11.5 13.2 8.5 12 7C12 7 13 10 10.5 12.5C9.5 13.5 8 12.8 8 11.5C8 9.5 9 7.5 9 7.5C7.5 9.5 6.5 11.5 7 14C7.5 16.5 10 19 12 20C14 19 16.5 16.5 17 14C17.8 10 15 5 12 2Z"
      fill="url(#nb-flame)"
    />
    <path
      d="M9 20.5Q12 18.5 15 20.5"
      stroke="#ff9500"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.7"
    />
  </svg>
);

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const roleKey = user?.role?.toUpperCase() || 'PUBLIC';
  const badge = ROLE_BADGE[roleKey] || ROLE_BADGE.PUBLIC;

  return (
    <header className="sticky top-0 z-40 w-full h-14 flex items-center justify-between border-b border-brand-border/60 bg-brand-surface/95 backdrop-blur-md px-4 sm:px-6">
      {/* Gradient accent line at very bottom of navbar */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-heat-gradient opacity-20 pointer-events-none" />

      {/* Left — brand + mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5 transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Brand mark */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 border border-brand-primary/25 heat-ring">
            <FlameIcon />
          </div>
          <div className="leading-none select-none">
            <div className="font-heading text-sm font-extrabold tracking-tight">
              <span className="text-brand-text">Heat</span>
              <span className="gradient-text">Wave</span>
              <span className="text-brand-faint ml-1 font-medium text-[10px] uppercase tracking-widest hidden sm:inline">AI</span>
            </div>
            <p className="text-[9px] text-brand-faint font-medium uppercase tracking-widest hidden sm:block leading-none mt-0.5">
              Karnataka EWS
            </p>
          </div>
        </div>
      </div>

      {/* Right — user info + sign out */}
      <div className="flex items-center gap-2.5">
        {user && (
          <div className="hidden sm:flex items-center gap-2 bg-brand-card border border-brand-border/80 rounded-full px-3 py-1.5 text-xs">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/10">
              <User className="h-3 w-3 text-brand-primary" />
            </div>
            <span className="text-brand-text font-semibold max-w-[100px] truncate">{user.name}</span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${badge.cls}`}>
              {badge.emoji} {user.role}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-risk-extreme transition-colors px-2.5 py-1.5 rounded-lg hover:bg-risk-extreme/5 border border-transparent hover:border-risk-extreme/20 focus:outline-none"
          title="Sign Out"
          id="navbar-signout-btn"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline font-medium">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
