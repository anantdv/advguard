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

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'support' | 'sales')[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
  const currentUser = useAppStore(state => state.currentUser);
  
  if (!allowedRoles.includes(currentUser.role as any)) {
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
  const currentUser = useAppStore(state => state.currentUser);

  return (
    <Routes>
      {/* Dashboard - Admin only */}
      <Route 
        path="/" 
        element={
          currentUser.role === 'support' ? (
            <Navigate to="/tickets" replace />
          ) : currentUser.role === 'sales' ? (
            <Navigate to="/renewals" replace />
          ) : (
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </RoleProtectedRoute>
          )
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </RoleProtectedRoute>
        } 
      />

      {/* Customers Master */}
      <Route 
        path="/customers" 
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'support', 'sales']}>
            <Customers />
          </RoleProtectedRoute>
        } 
      />
      
      <Route 
        path="/customers/:id" 
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'support', 'sales']}>
            <CustomerDetail />
          </RoleProtectedRoute>
        } 
      />

      {/* Devices Master */}
      <Route 
        path="/devices" 
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'support', 'sales']}>
            <Devices />
          </RoleProtectedRoute>
        } 
      />
      
      <Route 
        path="/devices/:id" 
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'support', 'sales']}>
            <DeviceDetail />
          </RoleProtectedRoute>
        } 
      />

      {/* Renewals Management */}
      <Route 
        path="/renewals" 
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'sales']}>
            <Renewals />
          </RoleProtectedRoute>
        } 
      />

      {/* Tickets Management */}
      <Route 
        path="/tickets" 
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'support']}>
            <Tickets />
          </RoleProtectedRoute>
        } 
      />
      
      <Route 
        path="/tickets/:id" 
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'support']}>
            <TicketDetail />
          </RoleProtectedRoute>
        } 
      />

      {/* SLA Policy Configurations */}
      <Route 
        path="/sla" 
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <SLA />
          </RoleProtectedRoute>
        } 
      />

      {/* Reports */}
      <Route 
        path="/reports" 
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </RoleProtectedRoute>
        } 
      />

      {/* Settings */}
      <Route 
        path="/settings" 
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </RoleProtectedRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
