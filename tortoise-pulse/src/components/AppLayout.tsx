'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function RequireAuth({ children, expectedRole }: { children: React.ReactNode; expectedRole?: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && expectedRole && user.role !== expectedRole) {
      // Redirect to correct dashboard for the user's actual role
      if (user.role === 'employee') router.push('/employee/dashboard');
      else if (user.role === 'agent') router.push('/agent/queue');
      else if (user.role === 'hr_admin') router.push('/hr/dashboard');
    }
  }, [user, loading, router, expectedRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export function AppLayout({ children, expectedRole }: { children: React.ReactNode; expectedRole?: string }) {
  return (
    <RequireAuth expectedRole={expectedRole}>
      {children}
    </RequireAuth>
  );
}

