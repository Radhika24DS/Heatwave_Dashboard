// src/pages/UnauthorizedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const UnauthorizedPage = () => {
  const { role, logout } = useAuth();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark px-4 text-center">
      <h1 className="text-9xl font-black text-red-500 tracking-widest">403</h1>
      <h2 className="text-3xl font-extrabold text-brand-text mt-4">Access Denied</h2>
      <p className="text-brand-muted mt-2 max-w-md">
        Your account role <span className="font-bold text-red-400">({role || 'PUBLIC'})</span> does not possess the permissions required to view this dashboard segment.
      </p>
      
      <div className="flex space-x-4 mt-6">
        <Link
          to="/"
          className="px-6 py-3 bg-brand-slate text-brand-text hover:bg-brand-border border border-brand-border rounded-xl font-bold transition-all duration-150"
        >
          Go to Home
        </Link>
        <button
          onClick={logout}
          className="px-6 py-3 bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-500/20 rounded-xl font-bold transition-all duration-150"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
