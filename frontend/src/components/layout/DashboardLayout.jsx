import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-brand-bg relative overflow-hidden">
      {/* Premium Background decorative layer */}
      <div className="absolute inset-0 dot-grid opacity-[0.15] pointer-events-none" />
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[120px] orb-drift pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-brand-mid/5 blur-[100px] orb-drift pointer-events-none" style={{ animationDelay: '-6s' }} />

      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-brand-bg">
          {/* Subtle top heat gradient bar */}
          <div className="h-px w-full bg-heat-gradient opacity-30" />
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
