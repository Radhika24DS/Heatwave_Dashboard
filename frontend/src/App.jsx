import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PublicDashboard from './pages/dashboard/PublicDashboard';
import FarmerDashboard from './pages/dashboard/FarmerDashboard';
import TravellerDashboard from './pages/dashboard/TravellerDashboard';
import ResearchDashboard from './pages/dashboard/ResearchDashboard';
import AuthorityDashboard from './pages/dashboard/AuthorityDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected dashboard routes with nested routing under DashboardLayout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['PUBLIC', 'FARMER', 'TRAVELLER', 'RESEARCH', 'AUTHORITY', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard/public" element={<PublicDashboard />} />
            
            <Route
              path="/farmer"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/traveller"
              element={
                <ProtectedRoute allowedRoles={['TRAVELLER', 'ADMIN']}>
                  <TravellerDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/research"
              element={
                <ProtectedRoute allowedRoles={['RESEARCH', 'ADMIN']}>
                  <ResearchDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard/authority"
              element={
                <ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']}>
                  <AuthorityDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Redirect root to public dashboard */}
          <Route path="/" element={<Navigate to="/dashboard/public" replace />} />
          
          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
