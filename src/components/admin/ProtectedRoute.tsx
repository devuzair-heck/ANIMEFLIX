import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { adminAuthService } from '../../services/adminAuthService';
import { AdminErrorBoundary } from './AdminErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    // If no token exists at all in storage, immediately mark as false
    if (typeof window !== 'undefined' && !adminAuthService.getToken()) {
      return false;
    }
    return null;
  });

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      try {
        const res = await adminAuthService.getMe();
        if (isMounted) {
          setIsAuthenticated(Boolean(res.success && res.admin));
        }
      } catch (err) {
        console.error('[ProtectedRoute] Auth verification failed:', err);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#DC143C] animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
};
