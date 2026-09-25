'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const EMPLOYEE_NAV = [
  { href: '/employee/dashboard', label: 'My Devices', icon: '📱' },
  { href: '/employee/support', label: 'Support Tickets', icon: '🎫' },
];
const AGENT_NAV = [
  { href: '/agent/queue', label: 'Case Queue', icon: '📋' },
];
const HR_NAV = [
  { href: '/hr/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/hr/breaches', label: 'Active Breaches', icon: '🚨' },
];

export default function Sidebar() {
  const { user, logout, unreadCount } = useAuth();
  const pathname = usePathname();

  const nav = user?.role === 'agent' ? AGENT_NAV
    : user?.role === 'hr_admin' ? HR_NAV
    : EMPLOYEE_NAV;

  const roleLabel = user?.role === 'agent' ? 'Support Agent'
    : user?.role === 'hr_admin' ? 'HR Admin'
    : 'Employee';

  const initials = (user?.name ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: '232px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100%', background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 900, fontSize: '20px', color: '#ffffff', letterSpacing: '-0.03em' }}>
            tortoise
          </span>
          <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 800, fontSize: '20px', color: 'var(--brand)', letterSpacing: '-0.03em' }}>
            pulse
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {nav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '10px',
                fontSize: '13.5px', fontWeight: isActive ? 600 : 500,
                textDecoration: 'none', transition: 'all 0.15s',
                background: isActive ? 'rgba(131,237,168,0.12)' : 'transparent',
                color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(131,237,168,0.22)' : '1px solid transparent',
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
            </Link>
          );
        })}

        {/* Workflow */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px', paddingLeft: '4px' }}>
            Workflow
          </p>
          {[
            { n: '1', text: 'Order placed → state machine starts' },
            { n: '2', text: 'SLA breach → auto escalation' },
            { n: '3', text: 'AI triage → priority routing' },
          ].map((item) => (
            <div key={item.n} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <span style={{
                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(131,237,168,0.12)', color: 'var(--brand)',
                fontSize: '10px', fontWeight: 700,
              }}>{item.n}</span>
              <span style={{ lineHeight: 1.5, marginTop: '1px' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(131,237,168,0.15)', border: '1.5px solid rgba(131,237,168,0.35)',
            color: 'var(--brand)', fontSize: '13px', fontWeight: 700,
          }}>{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: 500 }}>{roleLabel}</div>
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
    </aside>
  );
}
