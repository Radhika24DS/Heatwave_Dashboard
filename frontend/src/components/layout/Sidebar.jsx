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
    <div className="flex h-full flex-col bg-sidebar-grad border-r border-brand-border/60 py-4 overflow-y-auto">

      {/* Brand logo header */}
      <div className="px-4 pb-4 mb-2 flex items-center gap-2.5 border-b border-brand-border/40">
        <Logo className="h-8 w-8" />
        <div className="leading-none select-none">
          <div className="font-heading text-sm font-extrabold tracking-tight">
            <span className="text-brand-text">Heat</span>
            <span className="text-brand-primary">Wave</span>
            <span className="text-brand-faint ml-1 font-medium text-[10px] uppercase tracking-widest">AI</span>
          </div>
          <p className="text-[9px] text-brand-faint font-medium uppercase tracking-widest leading-none mt-0.5">
            Karnataka EWS
          </p>
        </div>
      </div>

      {/* User profile chip */}
      {user && (
        <div className="px-3 pb-4 mb-1 border-b border-brand-border/40">
          <div className="flex items-center gap-2.5 bg-brand-card/80 rounded-xl px-3 py-2.5 border border-brand-border/60">
            <div className="relative flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                <UserCircle2 className="h-5 w-5 text-brand-primary" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-risk-low border-2 border-brand-surface animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-brand-text truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-brand-faint uppercase font-black tracking-widest">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 pt-2">
        <p className="text-[9px] text-brand-faint uppercase font-black tracking-[0.15em] px-2 mb-2">
          Navigation
        </p>
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              [
                'relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 group',
                isActive
                  ? `${item.color} bg-brand-card border border-brand-border/80 shadow-sm nav-active-bar`
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-card/60 border border-transparent',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <div className={[
                  'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
                  isActive
                    ? `${item.iconBg} ${item.iconBorder}`
                    : 'bg-transparent border-transparent group-hover:bg-brand-card',
                ].join(' ')}>
                  <item.icon className={[
                    'h-4 w-4 transition-colors',
                    isActive ? item.color : 'text-brand-faint group-hover:text-brand-muted',
                  ].join(' ')} />
                </div>
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <span className={`ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0 ${item.color.replace('text-', 'bg-')}`} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System status footer */}
      <div className="px-3 pt-4 mt-2 border-t border-brand-border/40">
        <div className="bg-brand-card/60 border border-brand-border/60 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2 text-[11px]">
            <Zap className="h-3 w-3 text-brand-primary" />
            <span className="text-brand-muted font-medium">XGBoost v2.0</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-risk-low animate-pulse" />
              <span className="text-risk-low font-bold">Live</span>
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <Activity className="h-3 w-3 text-brand-faint" />
            <p className="text-[9px] text-brand-faint">EWS v2.0 · Karnataka · XGBoost</p>
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
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
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
