import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Menu, X, LogOut, User } from 'lucide-react';
import Logo from './Logo';

const ROLE_BADGE = {
  ADMIN:      { cls: 'text-purple-400 bg-purple-400/10 border-purple-400/30',   emoji: '🛡️'  },
  AUTHORITY:  { cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30',         emoji: '🏛️'  },
  RESEARCH:   { cls: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',          emoji: '🔬'  },
  FARMER:     { cls: 'text-risk-low bg-risk-lowBg border-risk-low/30',           emoji: '🌾'  },
  TRAVELLER:  { cls: 'text-risk-moderate bg-risk-moderateBg border-risk-moderate/30', emoji: '🧭' },
  PUBLIC:     { cls: 'text-brand-muted bg-brand-border/20 border-brand-border',  emoji: '👤'  },
};

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
            <Logo className="h-5 w-5" />
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
