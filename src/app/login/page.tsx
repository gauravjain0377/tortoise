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
    color: '#83eda8',
  },
  {
    label: 'Support Agent',
    email: 'agent@tortoise.pro',
    role: 'Manage case queue & advance fulfilment stages',
    tag: 'Tortoise Ops',
    icon: '⚡',
    color: '#67e8f9',
  },
  {
    label: 'HR Admin',
    email: 'hr@deloitte.in',
    role: 'Org-wide health dashboard & proactive breach alerts',
    tag: 'HR Management',
    icon: '📊',
    color: '#c4b5fd',
  },
];

const FEATURE_PILLS = [
  { icon: '🛡️', text: 'Proactive SLA Breach Alerts via Email' },
  { icon: '⏱️', text: 'Real-time SLA Countdown Timers' },
  { icon: '📦', text: 'End-to-End Device Order Tracking' },
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
        backgroundImage: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(131,237,168,0.09) 0%, transparent 60%)',
        position: 'relative',
      }}
    >
      {/* ── GLOBAL TOP BAR with Gaurav Jain ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(8,9,12,0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 900, fontSize: '19px', color: '#ffffff', letterSpacing: '-0.03em' }}>tortoise</span>
          <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 800, fontSize: '19px', color: 'var(--brand)', letterSpacing: '-0.03em' }}>pulse</span>
        </div>
        <a
          href="https://gauravjain.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.82)',
            textDecoration: 'none', padding: '6px 14px', borderRadius: '8px',
            border: '1px solid rgba(131,237,168,0.22)',
            background: 'rgba(131,237,168,0.06)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--brand)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,237,168,0.5)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(131,237,168,0.12)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(131,237,168,0.15)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.82)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,237,168,0.22)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(131,237,168,0.06)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand) 0%, #5eead4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 800, color: '#0b2118', flexShrink: 0,
          }}>GJ</span>
          Gaurav Jain
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.55 }}>
            <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
      {/* LEFT BRAND PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{
          width: '520px',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(180deg, #0c0f18 0%, #080a10 100%)',
          padding: '96px 3rem 3.5rem',
        }}
      >
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-120px',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(131,237,168,0.09) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '120px', left: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(103,232,249,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Hero Copy */}
        <div className="relative z-10 my-auto">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '9999px', marginBottom: '24px',
            background: 'rgba(131,237,168,0.12)', border: '1px solid rgba(131,237,168,0.3)',
            fontSize: '11px', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.06em',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%', background: 'var(--brand)',
              display: 'inline-block', boxShadow: '0 0 8px var(--brand)',
              animation: 'tp-pulse-dot 2s infinite',
            }} />
            ENTERPRISE DEVICE LIFECYCLE
          </div>

          <h1 style={{
            fontFamily: "'Chivo', sans-serif",
            fontSize: '46px', fontWeight: 900, lineHeight: 1.1,
            color: '#ffffff', letterSpacing: '-0.035em', marginBottom: '20px',
          }}>
            Every device.<br />
            <span style={{ color: 'var(--brand)' }}>Every repair.</span><br />
            <span style={{
              background: 'linear-gradient(90deg, #5eead4 0%, #83eda8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Live & SLA-backed.</span>
          </h1>

          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', marginBottom: '30px', maxWidth: '380px' }}>
            Tortoise Pulse turns employee laptop procurement and repairs into a fully transparent,
            SLA-enforced timeline — preventing delays before they become escalations.
          </p>

          {/* Feature Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '32px' }}>
            {FEATURE_PILLS.map((f) => (
              <div key={f.text} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <span style={{ fontSize: '16px' }}>{f.icon}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.76)', fontWeight: 500 }}>{f.text}</span>
                <span style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, boxShadow: '0 0 6px var(--brand)' }} />
              </div>
            ))}
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { value: '100%', label: 'SLA Tracking', color: 'var(--brand)' },
              { value: '15min', label: 'Proactive Alert', color: '#5eead4' },
              { value: '0', label: 'Blackbox Delays', color: '#ffffff' },
            ].map((s) => (
              <div key={s.label} style={{
                padding: '16px', borderRadius: '12px', textAlign: 'center',
                background: 'rgba(131,237,168,0.05)', border: '1px solid rgba(131,237,168,0.14)',
              }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: s.color, fontFamily: "'Chivo', sans-serif", lineHeight: 1.1, marginBottom: '4px' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.03em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', position: 'relative', zIndex: 10 }}>
          Designed for Tortoise (tortoise.pro) · SDE Intern Assignment
        </div>
      </div>

      {/* RIGHT PANEL — Sign In Form */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: '96px 2rem 2.5rem' }}>
        <div className="w-full animate-slide-up" style={{ maxWidth: '460px' }}>
          
          {/* Mobile brand header */}
          <div className="flex items-baseline gap-2 mb-6 lg:hidden">
            <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 900, fontSize: '24px', color: '#ffffff', letterSpacing: '-0.03em' }}>tortoise</span>
            <span style={{ fontFamily: "'Chivo', sans-serif", fontWeight: 800, fontSize: '24px', color: 'var(--brand)', letterSpacing: '-0.03em' }}>pulse</span>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontFamily: "'Chivo', sans-serif", fontSize: '32px', fontWeight: 900, color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.025em' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Select a persona or enter your credentials below.
            </p>
          </div>

          {/* Quick 1-click Demo Account Selection */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand)' }}>
                1-Click Demo Logins
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
                Auto-fills credentials
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
                      padding: '13px 16px', borderRadius: '12px', textAlign: 'left',
                      background: isSelected ? `${acc.color}12` : 'rgba(255,255,255,0.03)',
                      border: isSelected ? `1px solid ${acc.color}50` : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: isSelected ? `0 0 20px ${acc.color}12` : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.055)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      }
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${acc.color}18`, fontSize: '18px',
                      border: `1px solid ${acc.color}28`,
                    }}>
                      {acc.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{acc.label}</span>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px',
                          background: `${acc.color}15`, color: acc.color, border: `1px solid ${acc.color}30`,
                        }}>
                          {acc.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.58)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acc.role}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: isSelected ? acc.color : 'rgba(255,255,255,0.38)', fontWeight: 600, flexShrink: 0 }}>
                      {isSelected ? '✓ Ready' : 'Use →'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{
              marginTop: '10px', padding: '9px 14px', borderRadius: '8px',
              background: 'rgba(131,237,168,0.04)', border: '1px solid rgba(131,237,168,0.12)',
              fontSize: '12px', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>Demo password for all accounts:</span>
              <code style={{ fontFamily: 'monospace', color: 'var(--brand)', fontWeight: 700, background: 'rgba(0,0,0,0.4)', padding: '2px 9px', borderRadius: '5px' }}>
                demo123
              </code>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>or enter manually</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Form */}
          <form onSubmit={(e) => { void handleLogin(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '6px' }}>
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
                  border: focusedField === 'email' ? '1px solid var(--brand)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(131,237,168,0.12)' : 'none',
                  background: 'rgba(255,255,255,0.04)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'rgba(255,255,255,0.82)', marginBottom: '6px' }}>
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
                  border: focusedField === 'password' ? '1px solid var(--brand)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(131,237,168,0.12)' : 'none',
                  background: 'rgba(255,255,255,0.04)',
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 14px', borderRadius: '10px', fontSize: '13px',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171',
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
                marginTop: '4px',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.01em',
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

          <p style={{ marginTop: '20px', fontSize: '11.5px', color: 'rgba(255,255,255,0.38)', textAlign: 'center' }}>
            Enterprise device lifecycle management · tortoise.pro
          </p>
        </div>
      </div>

      <style>{`
        @keyframes tp-pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--brand); }
          50% { opacity: 0.5; box-shadow: 0 0 4px var(--brand); }
        }
      `}</style>
    </div>
  );
}
