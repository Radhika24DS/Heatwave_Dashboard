import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Map as MapIcon, History, AlertTriangle, ShieldAlert, FileBarChart, SunSnow, UserCircle, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import RoleBadge from '../common/RoleBadge';
import Logo from './Logo';

const ROLE_TAGLINES = {
  PUBLIC: "Know Heat. Stay Safe.",
  AUTHORITY: "District-Level Awareness, Real-Time Action",
  ADMIN: "System Awareness, End to End"
};

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  ];

  // History is research/analytics (accessible for Admin)
  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'History Logs', path: '/app/history', icon: History });
  }

  const tagline = ROLE_TAGLINES[user?.role] || "Heatwave Warning System";

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Navigation for ALL roles */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-[#f97316]/10 rounded-lg">
            <Logo className="h-7 w-7" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-[#9d4300] tracking-tight">SAMVIT</span>
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest hidden sm:inline-block border-l border-stone-200 pl-3">
              {tagline}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-stone-600">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`hover:text-[#f97316] transition-colors ${location.pathname.startsWith(item.path) ? 'text-[#f97316] font-black' : ''}`}
            >
              {item.name}
            </Link>
          ))}
          <Link
            to="/app/profile"
            className={`hover:text-[#f97316] transition-colors ${location.pathname.startsWith('/app/profile') ? 'text-[#f97316] font-black' : ''}`}
          >
            Profile
          </Link>
          
          <div className="flex items-center gap-3 border-l border-stone-200 pl-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center font-black text-[#9d4300] text-xs">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-black text-stone-850">{user?.name || 'User'}</p>
                <div className="mt-0.5"><RoleBadge role={user?.role} /></div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 text-xs font-black text-red-650 bg-red-50 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md bg-stone-100"
          >
            {isMobileMenuOpen
              ? <X className="w-6 h-6 text-stone-700" />
              : <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            }
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute inset-x-0 top-[65px] z-50 bg-white border-b border-stone-200 shadow-lg flex flex-col p-4 space-y-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${isActive ? 'bg-[#f97316] text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                {item.name}
              </Link>
            );
          })}
          <Link
            to="/app/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${location.pathname.startsWith('/app/profile') ? 'bg-[#f97316] text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            Profile
          </Link>
          <div className="border-t border-stone-100 pt-3 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center font-black text-[#9d4300] text-xs">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-stone-850">{user?.name || 'User'}</p>
                <div className="mt-0.5"><RoleBadge role={user?.role} /></div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-black text-red-650 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-auto bg-[#fafaf9]">
        <Outlet />
      </main>
    </div>
  );
}

