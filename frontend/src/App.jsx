import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DashboardLayout from './components/layout/DashboardLayout';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PredictionPage from './pages/PredictionPage';
import AlertsPage from './pages/AlertsPage';
import ForecastPage from './pages/ForecastPage';
import AdvisoryPage from './pages/AdvisoryPage';
import MapPage from './pages/MapPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ResearchPage from './pages/ResearchPage';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'glass-panel' }} />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute allowedRoles={['PUBLIC', 'AUTHORITY', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="prediction" element={<PredictionPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="forecast" element={<ForecastPage />} />
            <Route path="advisory" element={<AdvisoryPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            
            <Route 
              path="admin" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="research" 
              element={
                <ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']}>
                  <ResearchPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
