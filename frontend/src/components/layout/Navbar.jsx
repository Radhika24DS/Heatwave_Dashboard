import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Menu, X, LogOut, User, Sun } from 'lucide-react';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-brand-border bg-brand-navy px-4 shadow-md sm:px-6 lg:px-8">
      {/* Brand logo & mobile hamburger toggle */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-brand-muted hover:text-brand-text focus:outline-none md:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600/10 text-risk-high border border-risk-high/30 animate-pulse">
            <Sun className="h-5 w-5" />
          </div>
          <span className="text-md sm:text-lg font-bold tracking-tight text-brand-text">
            HEATWAVE <span className="text-risk-high">AI</span> EWS
          </span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="hidden sm:flex items-center space-x-2 bg-brand-slate px-3 py-1.5 rounded-full border border-brand-border text-xs text-brand-muted">
            <User className="h-3.5 w-3.5 text-risk-low" />
            <span className="font-semibold text-brand-text">{user.name}</span>
            <span className="bg-brand-navy px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold text-risk-moderate border border-brand-border">
              {user.role}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-xs text-brand-muted hover:text-risk-extreme px-3 py-1.5 rounded-lg border border-transparent hover:border-risk-extreme/30 hover:bg-risk-extreme/5 transition-all focus:outline-none"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
