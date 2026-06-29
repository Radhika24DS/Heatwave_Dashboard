import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Logo from './Logo';
import {
  Home,
  Sprout,
  Compass,
  LineChart,
  ShieldAlert,
  Settings,
  UserCircle2,
  Activity,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    name: 'Public Dashboard',
    path: '/dashboard/public',
    icon: Home,
    roles: ['PUBLIC', 'FARMER', 'TRAVELLER', 'RESEARCH', 'AUTHORITY', 'ADMIN'],
    color: 'text-brand-primary',
    iconBg: 'bg-brand-primary/10',
    iconBorder: 'border-brand-primary/20',
  },
  {
    name: 'Farmer View',
    path: '/farmer',
    icon: Sprout,
    roles: ['FARMER', 'ADMIN'],
    color: 'text-risk-low',
    iconBg: 'bg-risk-lowBg',
    iconBorder: 'border-risk-low/20',
  },
  {
    name: 'Traveller View',
    path: '/traveller',
    icon: Compass,
    roles: ['TRAVELLER', 'ADMIN'],
    color: 'text-risk-moderate',
    iconBg: 'bg-risk-moderateBg',
    iconBorder: 'border-risk-moderate/20',
  },
  {
    name: 'Research Insights',
    path: '/research',
    icon: LineChart,
    roles: ['RESEARCH', 'ADMIN'],
    color: 'text-cyan-400',
    iconBg: 'bg-cyan-400/10',
    iconBorder: 'border-cyan-400/20',
  },
  {
    name: 'Authority Panel',
    path: '/dashboard/authority',
    icon: ShieldAlert,
    roles: ['AUTHORITY', 'ADMIN'],
    color: 'text-blue-400',
    iconBg: 'bg-blue-400/10',
    iconBorder: 'border-blue-400/20',
  },
  {
    name: 'Admin Console',
    path: '/dashboard/admin',
    icon: Settings,
    roles: ['ADMIN'],
    color: 'text-purple-400',
    iconBg: 'bg-purple-400/10',
    iconBorder: 'border-purple-400/20',
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { role, user } = useAuth();
  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-brand-border py-4 overflow-y-auto shadow-sm">

      {/* User profile chip */}
      {user && (
        <div className="px-3 pb-4 mb-2 border-b border-brand-border">
          <div className="flex items-center gap-2.5 bg-slate-50/80 rounded-xl px-3 py-2.5 border border-slate-200/55 shadow-sm">
            <div className="relative flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 border border-brand-primary/20">
                <UserCircle2 className="h-5.5 w-5.5 text-brand-primary" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-risk-low border-2 border-white animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-brand-navy truncate leading-tight">{user.name}</p>
              <p className="text-[9px] text-brand-muted uppercase font-extrabold tracking-widest mt-0.5">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 pt-2">
        <p className="text-[10px] text-brand-faint uppercase font-extrabold tracking-[0.12em] px-2 mb-2">
          Navigation
        </p>
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => {
              // Convert text color classes to light-mode standard shades
              let activeText = item.color.replace('-400', '-600');
              if (activeText === 'text-risk-low') activeText = 'text-emerald-600';
              if (activeText === 'text-risk-moderate') activeText = 'text-amber-600';
              
              // Map background highlight colors based on active role color
              let activeBg = 'bg-brand-primary/5';
              if (item.path.includes('farmer')) activeBg = 'bg-emerald-50';
              else if (item.path.includes('traveller')) activeBg = 'bg-amber-50';
              else if (item.path.includes('research')) activeBg = 'bg-cyan-50';
              else if (item.path.includes('authority')) activeBg = 'bg-blue-50';
              else if (item.path.includes('admin')) activeBg = 'bg-purple-50';
              else activeBg = 'bg-orange-50';

              return [
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 group border',
                isActive
                  ? `${activeText} ${activeBg} border-slate-200/50 shadow-sm nav-active-bar`
                  : 'text-brand-slate hover:text-brand-primary hover:bg-slate-50 border-transparent',
              ].join(' ');
            }}
          >
            {({ isActive }) => {
              let activeText = item.color.replace('-400', '-600');
              if (activeText === 'text-risk-low') activeText = 'text-emerald-600';
              if (activeText === 'text-risk-moderate') activeText = 'text-amber-600';

              let activeIconBg = item.iconBg;
              if (item.path.includes('farmer')) activeIconBg = 'bg-emerald-50';
              else if (item.path.includes('traveller')) activeIconBg = 'bg-amber-50';
              else if (item.path.includes('research')) activeIconBg = 'bg-cyan-50';
              else if (item.path.includes('authority')) activeIconBg = 'bg-blue-50';
              else if (item.path.includes('admin')) activeIconBg = 'bg-purple-50';
              else activeIconBg = 'bg-orange-50';

              let activeIconBorder = item.iconBorder;
              if (item.path.includes('farmer')) activeIconBorder = 'border-emerald-200';
              else if (item.path.includes('traveller')) activeIconBorder = 'border-amber-200';
              else if (item.path.includes('research')) activeIconBorder = 'border-cyan-200';
              else if (item.path.includes('authority')) activeIconBorder = 'border-blue-200';
              else if (item.path.includes('admin')) activeIconBorder = 'border-purple-200';
              else activeIconBorder = 'border-orange-200';

              return (
                <>
                  <div className={[
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
                    isActive
                      ? `${activeIconBg} ${activeIconBorder}`
                      : 'bg-transparent border-transparent group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm',
                  ].join(' ')}>
                    <item.icon className={[
                      'h-4 w-4 transition-colors',
                      isActive ? activeText : 'text-slate-400 group-hover:text-brand-primary',
                    ].join(' ')} />
                  </div>
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <span className={`ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0 ${activeText.replace('text-', 'bg-')}`} />
                  )}
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* System status footer */}
      <div className="px-3 pt-4 mt-2 border-t border-brand-border">
        <div className="bg-slate-50/80 border border-slate-200/55 rounded-xl px-3 py-2.5 shadow-sm">
          <div className="flex items-center gap-2 text-[11px]">
            <Zap className="h-3.5 w-3.5 text-brand-primary" />
            <span className="text-brand-navy font-bold">XGBoost v2.0</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-risk-low animate-pulse" />
              <span className="text-risk-low font-bold">Live</span>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide leading-none mt-0.5">EWS v2.0 · Karnataka</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop persistent sidebar */}
      <aside className="hidden md:block md:w-64 md:flex-shrink-0 h-full">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
