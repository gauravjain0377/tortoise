'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const DEMO_ACCOUNTS = [
  {
    label: 'Employee',
    email: 'priya@deloitte.in',
    role: 'Track orders, repairs & raise support tickets',
    tag: 'Deloitte India',
    icon: '💻',
  },
  {
    label: 'Support Agent',
    email: 'agent@tortoise.pro',
    role: 'Manage case queue & advance fulfilment stages',
    tag: 'Tortoise Ops',
    icon: '⚡',
  },
  {
    label: 'HR Admin',
    email: 'hr@deloitte.in',
    role: 'Org-wide health dashboard & proactive breach alerts',
    tag: 'HR Management',
    icon: '📊',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      const token = localStorage.getItem('tp_token');
      if (!token) { setLoading(false); return; }
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json() as { success: boolean; data?: { user: { role: string } } };
      const role = data.data?.user?.role;
      if (role === 'employee') router.push('/employee/dashboard');
      else if (role === 'agent') router.push('/agent/queue');
      else if (role === 'hr_admin') router.push('/hr/dashboard');
      else router.push('/employee/dashboard');
    } else {
      setError(result.error ?? 'Login failed. Check your credentials.');
      setLoading(false);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('demo123');
    setError('');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: '#08090c',
        backgroundImage: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(131,237,168,0.08) 0%, transparent 60%)',
      }}
    >
      {/* LEFT BRAND PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{
          width: '500px',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg, #0e1117 0%, #090b0f 100%)',
          padding: '3.5rem 3rem',
        }}
      >
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(131,237,168,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Brand Logo - clean typography only */}
        <div className="flex items-baseline gap-2 relative z-10">
          <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 900, fontSize: '26px', color: '#ffffff', letterSpacing: '-0.03em' }}>
            tortoise
          </span>
          <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 800, fontSize: '26px', color: 'var(--brand)', letterSpacing: '-0.03em' }}>
            pulse
          </span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto py-8">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '9999px', marginBottom: '22px',
            background: 'rgba(131,237,168,0.12)', border: '1px solid rgba(131,237,168,0.3)',
            fontSize: '12px', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.05em',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand)', display: 'inline-block', boxShadow: '0 0 8px var(--brand)' }} />
            ENTERPRISE DEVICE LIFECYCLE
          </div>

          <h1 style={{
            fontFamily: "'Chivo', sans-serif",
            fontSize: '44px', fontWeight: 900, lineHeight: 1.12,
            color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '18px',
          }}>
            Every device.<br />
            <span style={{ color: 'var(--brand)' }}>Every repair.</span><br />
            Live & SLA-backed.
          </h1>

          <p style={{ fontSize: '15px', lineHeight: 1.65, color: 'rgba(255,255,255,0.78)', marginBottom: '32px', maxWidth: '380px' }}>
            Tortoise Pulse turns employee laptop procurement and repairs into an end-to-end transparent timeline —
            preventing delays before they turn into escalations.
          </p>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { value: '100%', label: 'SLA Tracking', color: 'var(--brand)' },
              { value: '15min', label: 'Proactive Alert', color: '#5eead4' },
              { value: '0', label: 'Blackbox Delays', color: '#ffffff' },
            ].map((s) => (
              <div key={s.label} style={{
                padding: '14px 16px', borderRadius: '12px',
                background: 'rgba(131,237,168,0.06)', border: '1px solid rgba(131,237,168,0.18)',
              }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, fontFamily: "'Chivo', sans-serif", lineHeight: 1.1, marginBottom: '4px' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.03em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 10 }}>
          Designed for Tortoise (tortoise.pro) • SDE Intern Assignment
        </div>
      </div>

      {/* RIGHT PANEL — Sign In Form */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: '2.5rem 2rem' }}>
        <div className="w-full animate-slide-up" style={{ maxWidth: '460px' }}>
          
          {/* Mobile brand header */}
          <div className="flex items-baseline gap-2 mb-6 lg:hidden">
            <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 900, fontSize: '24px', color: '#ffffff', letterSpacing: '-0.03em' }}>
              tortoise
            </span>
            <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 800, fontSize: '24px', color: 'var(--brand)', letterSpacing: '-0.03em' }}>
              pulse
            </span>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: "'Chivo', sans-serif", fontSize: '30px', fontWeight: 800, color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Sign in
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)' }}>
              Select a persona below or sign in with your work email.
            </p>
          </div>

          {/* Quick 1-click Demo Account Selection */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand)' }}>
                1-Click Demo Logins
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                Click to autofill
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '12px 16px', borderRadius: '12px', textAlign: 'left',
                      background: isSelected ? 'rgba(131,237,168,0.15)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? '1px solid var(--brand)' : '1px solid rgba(131,237,168,0.18)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(131,237,168,0.08)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,237,168,0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,237,168,0.18)';
                      }
                    }}
                  >
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(131,237,168,0.15)', fontSize: '18px',
                    }}>
                      {acc.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{acc.label}</span>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                          background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)',
                        }}>
                          {acc.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acc.role}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: 600, flexShrink: 0 }}>
                      {isSelected ? '✓ Ready' : 'Use'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{
              marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
              background: 'rgba(131,237,168,0.06)', border: '1px solid rgba(131,237,168,0.12)',
              fontSize: '12px', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>Demo password for all accounts:</span>
              <code style={{ fontFamily: 'monospace', color: 'var(--brand)', fontWeight: 700, background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                demo123
              </code>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(131,237,168,0.15)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or enter manually</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(131,237,168,0.15)' }} />
          </div>

          {/* Form */}
          <form onSubmit={(e) => { void handleLogin(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '6px' }}>
                Work Email
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                autoComplete="email"
                style={{
                  border: focusedField === 'email' ? '1px solid var(--brand)' : '1px solid rgba(131,237,168,0.2)',
                  boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(131,237,168,0.15)' : 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                autoComplete="current-password"
                style={{
                  border: focusedField === 'password' ? '1px solid var(--brand)' : '1px solid rgba(131,237,168,0.2)',
                  boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(131,237,168,0.15)' : 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 14px', borderRadius: '10px', fontSize: '13px',
                background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', padding: '14px', fontSize: '15px',
                marginTop: '6px',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : 'Sign in to Tortoise Pulse →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
