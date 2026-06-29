import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col bg-brand-bg relative overflow-hidden">
      {/* Premium Background decorative layer */}
      <div className="absolute inset-0 dot-grid opacity-[0.4] pointer-events-none" />
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-brand-primary/[0.03] blur-[120px] orb-drift pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-brand-mid/[0.02] blur-[100px] orb-drift pointer-events-none" style={{ animationDelay: '-6s' }} />

      {/* Top Navbar */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Lower Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        {/* Left Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page content */}
        <main className="flex-1 h-full min-w-0 overflow-y-auto bg-brand-bg relative z-0">
          {/* Subtle top heat gradient bar */}
          <div className="h-px w-full bg-heat-gradient opacity-30 sticky top-0 z-20" />
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
