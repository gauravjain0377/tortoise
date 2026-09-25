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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Top Bar ── */}
      <header style={{
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        zIndex: 50,
      }}>
        <a
          href="https://gauravjain.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.75)',
            textDecoration: 'none',
            padding: '5px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(131,237,168,0.18)',
            background: 'rgba(131,237,168,0.06)',
            transition: 'all 0.2s',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--brand)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,237,168,0.45)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(131,237,168,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,237,168,0.18)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(131,237,168,0.06)';
          }}
        >
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand) 0%, #5eead4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800, color: '#0b2118', flexShrink: 0,
          }}>GJ</span>
          Gaurav Jain
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.6 }}>
            <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </header>

      {/* ── Main Body: Sidebar + Content ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ minWidth: 0, flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
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

