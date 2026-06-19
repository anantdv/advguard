import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import CustomerDetail from '../pages/CustomerDetail';
import Devices from '../pages/Devices';
import DeviceDetail from '../pages/DeviceDetail';
import Renewals from '../pages/Renewals';
import Tickets from '../pages/Tickets';
import TicketDetail from '../pages/TicketDetail';
import SLA from '../pages/SLA';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Login from '../pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'support' | 'sales')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isLoggedIn, currentUser } = useAppStore();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role as any)) {
    if (currentUser.role === 'support') {
      return <Navigate to="/tickets" replace />;
    }
    if (currentUser.role === 'sales') {
      return <Navigate to="/renewals" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { isLoggedIn, currentUser } = useAppStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            {currentUser.role === 'support' ? (
              <Navigate to="/tickets" replace />
            ) : currentUser.role === 'sales' ? (
              <Navigate to="/renewals" replace />
            ) : (
              <Dashboard />
            )}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Customers Master */}
      <Route 
        path="/customers" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'support', 'sales']}>
            <Customers />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/customers/:id" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'support', 'sales']}>
            <CustomerDetail />
          </ProtectedRoute>
        } 
      />

      {/* Devices Master */}
      <Route 
        path="/devices" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'support', 'sales']}>
            <Devices />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/devices/:id" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'support', 'sales']}>
            <DeviceDetail />
          </ProtectedRoute>
        } 
      />

      {/* Renewals Management */}
      <Route 
        path="/renewals" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'sales']}>
            <Renewals />
          </ProtectedRoute>
        } 
      />

      {/* Tickets Management */}
      <Route 
        path="/tickets" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'support']}>
            <Tickets />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tickets/:id" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'support']}>
            <TicketDetail />
          </ProtectedRoute>
        } 
      />

      {/* SLA Policy Configurations */}
      <Route 
        path="/sla" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SLA />
          </ProtectedRoute>
        } 
      />

      {/* Reports */}
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        } 
      />

      {/* Settings */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
