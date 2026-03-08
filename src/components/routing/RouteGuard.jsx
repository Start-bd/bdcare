import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

/**
 * RouteGuard — wraps a page/component and enforces RBAC.
 *
 * Props:
 *   allowedRoles   {string[]}  — roles that may access this route (e.g. ['admin', 'doctor'])
 *   requireAuth    {boolean}   — redirect to login if not authenticated
 *   redirectTo     {string}    — path to redirect on failure (default: '/')
 *   children       {ReactNode}
 *
 * Usage:
 *   <RouteGuard allowedRoles={['admin']}>
 *     <AdminDashboard />
 *   </RouteGuard>
 */
export default function RouteGuard({ allowedRoles = [], requireAuth = true, redirectTo = '/', children }) {
    const navigate    = useNavigate();
    const location    = useLocation();
    const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

    useEffect(() => {
        let cancelled = false;
        const verify = async () => {
            try {
                const user = await base44.auth.me();
                if (cancelled) return;

                if (!user) {
                    if (requireAuth) {
                        base44.auth.redirectToLogin(location.pathname + location.search);
                        return;
                    }
                    setStatus('allowed');
                    return;
                }

                // Check role
                if (allowedRoles.length > 0) {
                    const userRole = user.role || 'user';
                    const userType = user.user_type || '';
                    const hasRole  = allowedRoles.some(r =>
                        r === userRole ||
                        r === userType
                    );
                    if (!hasRole) {
                        setStatus('denied');
                        navigate(redirectTo, { replace: true });
                        return;
                    }
                }

                setStatus('allowed');
            } catch {
                if (requireAuth) {
                    base44.auth.redirectToLogin(location.pathname + location.search);
                } else {
                    setStatus('allowed');
                }
            }
        };

        verify();
        return () => { cancelled = true; };
    }, [location.pathname]);

    if (status === 'checking') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (status === 'denied') return null;

    return <>{children}</>;
}