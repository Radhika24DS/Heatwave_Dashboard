import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  Home, 
  Sprout, 
  Compass, 
  LineChart, 
  ShieldAlert, 
  Settings, 
  UserCircle2
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { role, user } = useAuth();
  
  // Navigation config based on roles
  const navItems = [
    {
      name: 'Public Dashboard',
      path: '/dashboard/public',
      icon: Home,
      roles: ['PUBLIC', 'FARMER', 'TRAVELLER', 'RESEARCH', 'AUTHORITY', 'ADMIN']
    },
    {
      name: 'Farmer Dashboard',
      path: '/farmer',
      icon: Sprout,
      roles: ['FARMER', 'ADMIN']
    },
    {
      name: 'Traveller Dashboard',
      path: '/traveller',
      icon: Compass,
      roles: ['TRAVELLER', 'ADMIN']
    },
    {
      name: 'Research Insights',
      path: '/research',
      icon: LineChart,
      roles: ['RESEARCH', 'ADMIN']
    },
    {
      name: 'Authority Panel',
      path: '/dashboard/authority',
      icon: ShieldAlert,
      roles: ['AUTHORITY', 'ADMIN']
    },
    {
      name: 'Admin Settings',
      path: '/dashboard/admin',
      icon: Settings,
      roles: ['ADMIN']
    }
  ];

  // Filter items matching current user's role
  const filteredItems = navItems.filter(item => item.roles.includes(role));

  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-brand-slate text-risk-high shadow-inner border-l-4 border-risk-high'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-slate/40'
    }`;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-brand-navy border-r border-brand-border py-4">
      {/* User profile brief (mobile only) */}
      {user && (
        <div className="px-6 py-4 border-b border-brand-border/40 mb-4 md:hidden">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-slate border border-brand-border">
              <UserCircle2 className="h-6 w-6 text-brand-muted" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-text truncate w-32">{user.name}</p>
              <p className="text-xs text-brand-muted uppercase font-bold text-[9px] tracking-wide">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={linkClass}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / System Status */}
      <div className="px-6 py-4 border-t border-brand-border/40">
        <div className="flex items-center space-x-2 text-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-risk-low animate-ping" />
          <span className="text-brand-muted font-medium">Model Serving Active</span>
        </div>
        <p className="text-[10px] text-brand-muted/60 mt-1">EWS Version 1.4.2</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Slideout */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block md:w-64 md:flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
