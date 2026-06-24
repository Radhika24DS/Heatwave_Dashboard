// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark px-4 text-center">
      <h1 className="text-9xl font-black text-risk-high tracking-widest animate-pulse">404</h1>
      <h2 className="text-3xl font-extrabold text-brand-text mt-4">Page Not Found</h2>
      <p className="text-brand-muted mt-2 max-w-md">
        The resource you are looking for does not exist or has been relocated to another coordinate.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-brand-slate text-brand-text hover:bg-brand-border border border-brand-border rounded-xl font-bold transition-all duration-150"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
