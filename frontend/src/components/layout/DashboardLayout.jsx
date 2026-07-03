import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Map as MapIcon, History, AlertTriangle, ShieldAlert, FileBarChart, SunSnow, UserCircle, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import RoleBadge from '../common/RoleBadge';

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
    { name: 'Forecast', path: '/app/forecast', icon: SunSnow },
    { name: 'Alerts', path: '/app/alerts', icon: AlertTriangle },
    { name: 'Map View', path: '/app/map', icon: MapIcon },
    { name: 'History', path: '/app/history', icon: History },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Admin Panel', path: '/app/admin', icon: ShieldAlert });
  }
  
  if (['RESEARCH', 'AUTHORITY', 'ADMIN'].includes(user?.role)) {
    navItems.push({ name: 'Research Data', path: '/app/research', icon: FileBarChart });
  }

  return (
    <div className="min-h-screen bg-background flex text-on-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-surface-variant flex-shrink-0 hidden md:flex flex-col shadow-sm z-10">
        <div className="p-6">
          <h1 className="text-2xl font-black text-primary tracking-tight">HEWS</h1>
          <p className="text-xs text-outline mt-1 font-semibold uppercase">Heatwave Warning Sys</p>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-container text-on-primary-container shadow-sm' 
                    : 'text-on-surface hover:bg-surface-variant hover:text-primary'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-on-primary-container' : 'text-outline'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-surface-variant bg-surface-container-low">
          <Link
            to="/app/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity group"
          >
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center font-black text-on-primary-container text-sm flex-shrink-0">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{user?.name || 'User'}</p>
              <div className="mt-0.5"><RoleBadge role={user?.role} /></div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-bold text-error bg-error-container rounded-full hover:bg-error hover:text-on-error transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-surface-container-lowest border-b border-surface-variant p-4 flex justify-between items-center z-20 flex-shrink-0">
          <h1 className="text-xl font-black text-primary">HEWS</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md bg-surface-variant"
          >
            {isMobileMenuOpen
              ? <X className="w-6 h-6" />
              : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            }
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-30 bg-surface-container-lowest flex flex-col pt-16">
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {[...navItems, { name: 'Profile', path: '/app/profile', icon: UserCircle }].map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container shadow-sm'
                        : 'text-on-surface hover:bg-surface-variant hover:text-primary'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-on-primary-container' : 'text-outline'} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-6 border-t border-surface-variant">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-bold text-error bg-error-container rounded-full hover:bg-error hover:text-on-error transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-surface-variant)_0%,_transparent_50%)] pointer-events-none opacity-50" />
          <div className="relative z-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
