import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Menu, X, LogOut, User } from 'lucide-react';
import Logo from './Logo';

const ROLE_BADGE = {
  ADMIN:      { cls: 'text-purple-700 bg-purple-50 border-purple-200',   label: 'Admin'  },
  AUTHORITY:  { cls: 'text-blue-700 bg-blue-50 border-blue-200',         label: 'Authority'  },
  RESEARCH:   { cls: 'text-cyan-700 bg-cyan-50 border-cyan-200',          label: 'Research'  },
  FARMER:     { cls: 'text-emerald-700 bg-emerald-50 border-emerald-200',  label: 'Farmer'  },
  TRAVELLER:  { cls: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Traveller' },
  PUBLIC:     { cls: 'text-slate-700 bg-slate-50 border-slate-200',  label: 'Public'  },
};

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const roleKey = user?.role?.toUpperCase() || 'PUBLIC';
  const badge = ROLE_BADGE[roleKey] || ROLE_BADGE.PUBLIC;

  return (
    <header className="sticky top-0 z-40 w-full h-16 flex items-center justify-between border-b border-brand-border bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-sm">
      {/* Gradient accent line at very bottom of navbar */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-heat-gradient opacity-15 pointer-events-none" />

      {/* Left — brand + mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5 transition-all md:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Brand mark */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/5 border border-brand-primary/20 shadow-sm">
            <Logo className="h-6 w-6" />
          </div>
          <div className="leading-none select-none">
            <div className="font-heading text-sm font-extrabold tracking-tight">
              <span className="text-brand-navy">HEWS</span>
              <span className="gradient-text ml-1">Portal</span>
              <span className="text-brand-faint ml-1.5 font-bold text-[10px] uppercase tracking-widest hidden sm:inline">AI</span>
            </div>
            <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest hidden sm:block leading-none mt-1">
              Karnataka EWS
            </p>
          </div>
        </div>
      </div>

      {/* Right — user info + sign out */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 rounded-full pl-2 pr-3 py-1 text-xs">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/10">
              <User className="h-3.5 w-3.5 text-brand-primary" />
            </div>
            <span className="text-brand-navy font-bold max-w-[120px] truncate">{user.name}</span>
            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-risk-extreme transition-all px-3 py-1.5 rounded-lg hover:bg-risk-extremeBg border border-transparent hover:border-risk-extreme/20 focus:outline-none shadow-sm bg-white border-slate-200"
          title="Sign Out"
          id="navbar-signout-btn"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline font-bold">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
