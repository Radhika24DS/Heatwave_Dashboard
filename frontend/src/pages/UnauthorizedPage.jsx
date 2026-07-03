import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-surface rounded-card p-8 shadow-card border border-surface-variant max-w-md text-center">
        <div className="flex justify-center mb-6 text-error">
          <ShieldAlert size={64} />
        </div>
        <h1 className="text-2xl font-black text-on-surface mb-2">Access Denied</h1>
        <p className="text-on-surface-variant mb-6">
          You do not have the required permissions to view this page. If you believe this is an error, contact your administrator.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-2 border border-outline rounded-full text-on-surface font-semibold hover:bg-surface-variant transition"
          >
            Go Back
          </button>
          <Link 
            to="/app/dashboard" 
            className="px-6 py-2 bg-primary text-on-primary font-bold rounded-full shadow-heat hover:bg-[#853900] transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
