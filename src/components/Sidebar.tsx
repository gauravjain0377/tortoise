'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const EMPLOYEE_NAV = [
  { href: '/employee/dashboard', label: 'My Devices', icon: '📱', desc: 'Track orders & repairs' },
  { href: '/employee/support', label: 'Support Tickets', icon: '🎫', desc: 'Raise & track issues' },
];
const AGENT_NAV = [
  { href: '/agent/queue', label: 'Case Queue', icon: '📋', desc: 'Live ops queue' },
];
const HR_NAV = [
  { href: '/hr/dashboard', label: 'Dashboard', icon: '📊', desc: 'Org-wide analytics' },
  { href: '/hr/breaches', label: 'Active Breaches', icon: '🚨', desc: 'SLA escalations' },
];

export default function Sidebar() {
  const { user, logout, unreadCount } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = user?.role === 'agent' ? AGENT_NAV
    : user?.role === 'hr_admin' ? HR_NAV
    : EMPLOYEE_NAV;

  const roleLabel = user?.role === 'agent' ? 'Support Agent'
    : user?.role === 'hr_admin' ? 'HR Admin'
    : 'Employee';

  const roleColor = user?.role === 'hr_admin' ? '#c4b5fd'
    : user?.role === 'agent' ? '#67e8f9'
    : 'var(--brand)';

  const initials = (user?.name ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'baseline', gap: '5px' }}>
          <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 900, fontSize: '19px', color: '#ffffff', letterSpacing: '-0.03em' }}>
            tortoise
          </span>
          <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 800, fontSize: '19px', color: 'var(--brand)', letterSpacing: '-0.03em' }}>
            pulse
          </span>
        </Link>
        {/* Mobile close button */}
        <button
          className="mobile-only"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
            color: 'rgba(255,255,255,0.7)', borderRadius: '8px',
            width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px',
            alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>
      </div>

      {/* Role badge */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px', borderRadius: '9999px',
          background: `${roleColor}12`, border: `1px solid ${roleColor}25`,
          fontSize: '11px', fontWeight: 700, color: roleColor, letterSpacing: '0.04em',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: roleColor, display: 'inline-block' }} />
          {roleLabel.toUpperCase()}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
        {nav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isBreach = item.label === 'Active Breaches';
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '11px',
                padding: '10px 12px', borderRadius: '10px',
                fontSize: '13.5px', fontWeight: isActive ? 700 : 500,
                textDecoration: 'none', transition: 'all 0.15s',
                background: isActive ? 'rgba(131,237,168,0.12)' : 'transparent',
                color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(131,237,168,0.22)' : '1px solid transparent',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: '15px', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.label === 'Support Tickets' && unreadCount > 0 && (
                <span style={{
                  background: 'var(--red)', color: '#fff', fontSize: '10px',
                  fontWeight: 800, padding: '2px 6px', borderRadius: '9999px', minWidth: '18px', textAlign: 'center',
                }}>{unreadCount}</span>
              )}
              {isBreach && (
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#f87171', flexShrink: 0,
                  boxShadow: '0 0 6px rgba(248,113,113,0.7)',
                  animation: 'tp-breach-blink 1.5s infinite',
                }} />
              )}
            </Link>
          );
        })}

        {/* Workflow section */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '4px' }}>
            How it works
          </p>
          {[
            { n: '1', text: 'Order placed → state machine starts' },
            { n: '2', text: 'SLA breach → auto escalation + email' },
            { n: '3', text: 'AI triage → priority routing' },
          ].map((item) => (
            <div key={item.n} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '9px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <span style={{
                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(131,237,168,0.1)', color: 'var(--brand)',
                fontSize: '10px', fontWeight: 700,
              }}>{item.n}</span>
              <span style={{ lineHeight: 1.5, marginTop: '1px' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${roleColor}18`, border: `1.5px solid ${roleColor}40`,
            color: roleColor, fontSize: '13px', fontWeight: 700,
          }}>{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '11px', color: roleColor, fontWeight: 500 }}>{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', padding: '7px 10px', borderRadius: '8px',
            color: 'var(--text-muted)', background: 'transparent',
            border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--red)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,0.08)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,107,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
          }}
        >
          ← Sign out
        </button>
      </div>

      <style>{`
        @keyframes tp-breach-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );

  return (
    <>
      {/* Mobile hamburger toggle button - strictly hidden on big screens */}
      <button
        className="mobile-only"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        style={{
          position: 'fixed', top: '12px', left: '12px', zIndex: 300,
          width: '38px', height: '38px', borderRadius: '10px',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          cursor: 'pointer', fontSize: '16px', color: 'rgba(255,255,255,0.8)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >☰</button>

      {/* Desktop sidebar - visible only on big screens */}
      <aside className="desktop-only" style={{
        width: '232px', flexShrink: 0,
        height: '100%', background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        flexDirection: 'column',
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay - strictly hidden on big screens */}
      {mobileOpen && (
        <div
          className="mobile-only"
          style={{
            position: 'fixed', inset: 0, zIndex: 250,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in sidebar - strictly hidden on big screens */}
      <aside
        className="mobile-only"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 260,
          width: '260px', flexDirection: 'column',
          background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: mobileOpen ? '4px 0 32px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
