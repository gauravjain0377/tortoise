'use client';

import { AppLayout } from '@/components/AppLayout';
import { useApi } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HrSummary {
  orgName: string;
  totalEmployees: number;
  activeOrders: number;
  activeRepairs: number;
  adoptionRate: number;
  avgFulfilmentHours: number;
  openBreaches: number;
  breachRate: number;
  openTickets: number;
  resolvedThisWeek: number;
  trendData: Array<{ date: string; orders: number; breaches: number }>;
}

function SvgBarChart({ data, maxVal, color, labels }: { data: number[]; maxVal: number; color: string; labels?: string[] }) {
  const W = 100;
  const H = 72;
  const barW = W / data.length - 3;
  const max = Math.max(maxVal, 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '80px', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`bar-grad-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const barH = Math.max(4, (v / max) * (H - 10));
        const x = i * (W / data.length) + 1.5;
        const y = H - barH;
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx="3"
              fill={`url(#bar-grad-${color.replace(/[^a-z0-9]/gi, '')})`}
              style={{ transition: 'height 0.5s, y 0.5s' }}
            />
            {v > 0 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle" fill={color} fontSize="7" fontWeight="700" opacity="0.8">
                {v}
              </text>
            )}
          </g>
        );
      })}
      {labels && labels.map((l, i) => (
        <text
          key={l}
          x={i * (W / labels.length) + (W / labels.length) / 2}
          y={H + 10}
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize="7"
          fontWeight="600"
        >{l}</text>
      ))}
    </svg>
  );
}

function StatCard({ title, value, subtitle, icon, color, trend }: {
  title: string; value: string | number; subtitle?: string;
  icon: string; color: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="glass-card" style={{ padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
          background: 'rgba(131,237,168,0.12)', border: '1px solid rgba(131,237,168,0.2)',
        }}>
          {icon}
        </div>
        {trend && (
          <span style={{
            fontSize: '13px', fontWeight: 700,
            color: trend === 'up' ? '#f87171' : trend === 'down' ? 'var(--brand)' : 'rgba(255,255,255,0.6)',
          }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          </span>
        )}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 900, color, fontFamily: "'Chivo', sans-serif", lineHeight: 1.1, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{subtitle}</div>}
    </div>
  );
}

export default function HrDashboardPage() {
  const { call } = useApi();
  const [summary, setSummary] = useState<HrSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await call<HrSummary>('/api/hr/summary');
      if (res.success && res.data) setSummary(res.data);
      setLoading(false);
    };
    void load();
  }, [call]);

  if (loading) {
    return (
      <AppLayout expectedRole="hr_admin">
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="shimmer glass-card" style={{ height: '120px' }} />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!summary) {
    return (
      <AppLayout expectedRole="hr_admin">
        <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
          Failed to load program health data.
        </div>
      </AppLayout>
    );
  }

  const orderValues = summary.trendData.map((d) => d.orders);
  const breachValues = summary.trendData.map((d) => d.breaches);
  const maxOrders = Math.max(...orderValues, 1);
  const maxBreaches = Math.max(...breachValues, 1);

  return (
    <AppLayout expectedRole="hr_admin">
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', fontFamily: "'Chivo', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {summary.orgName} — Device Program Health
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)' }}>
              Live hardware procurement analytics, employee satisfaction & SLA compliance
            </p>
          </div>
          <Link href="/hr/breaches" style={{ textDecoration: 'none' }}>
            <button
              className={summary.openBreaches > 0 ? 'btn-danger' : 'btn-secondary'}
              style={{ fontSize: '13px', fontWeight: 700, padding: '10px 18px' }}
            >
              {summary.openBreaches > 0
                ? `🚨 ${summary.openBreaches} Active Breach${summary.openBreaches > 1 ? 'es' : ''}`
                : '✅ 100% SLA Compliant'}
            </button>
          </Link>
        </div>

        {/* Breach Alert */}
        {summary.openBreaches > 0 && (
          <div style={{
            marginBottom: '24px', padding: '20px 24px', borderRadius: '16px',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.4)',
            boxShadow: '0 0 40px rgba(248,113,113,0.06)',
            animation: 'tp-breach-pulse 2.5s infinite',
          }} className="animate-slide-up">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                background: 'rgba(248,113,113,0.2)',
              }}>🚨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '15px', marginBottom: '4px' }}>
                  {summary.openBreaches} order{summary.openBreaches > 1 ? 's have' : ' has'} exceeded the contractual SLA
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                  Affected employees have been <span style={{ color: '#f87171', fontWeight: 700 }}>notified via email</span> proactively to prevent internal complaints.{' '}
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>Breach rate: {summary.breachRate}%</span>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['📧 Email alerts sent', '⚡ Ops desk notified', '📞 Escalation active'].map((tag) => (
                    <span key={tag} style={{
                      fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px',
                      background: 'rgba(248,113,113,0.12)', color: '#f87171',
                      border: '1px solid rgba(248,113,113,0.25)',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
              <Link href="/hr/breaches">
                <button className="btn-danger" style={{ fontSize: '13px', padding: '10px 18px', whiteSpace: 'nowrap' }}>
                  View Escalations →
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* KPI Grid Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
          <StatCard title="Program Adoption" value={`${summary.adoptionRate}%`}
            subtitle={`${summary.activeOrders + summary.activeRepairs} of ${summary.totalEmployees} employees`}
            icon="📈" color="var(--brand)" />
          <StatCard title="Active Orders" value={summary.activeOrders} subtitle="Procurement pipeline" icon="💻" color="#5eead4" />
          <StatCard title="Active Repairs" value={summary.activeRepairs} subtitle="In service center" icon="🔧" color="#93c5fd" />
          <StatCard title="SLA Breaches" value={summary.openBreaches}
            subtitle={`${summary.breachRate}% breach rate`} icon="🚨"
            color={summary.openBreaches > 0 ? '#f87171' : 'var(--brand)'}
            trend={summary.openBreaches > 0 ? 'up' : 'neutral'} />
        </div>

        {/* KPI Grid Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          <StatCard title="Avg Delivery" value={`${summary.avgFulfilmentHours}h`} subtitle="Order to doorstep" icon="⚡" color="#fbbf24" />
          <StatCard title="Open Tickets" value={summary.openTickets} subtitle="Employee queries" icon="🎫" color="#5eead4"
            trend={summary.openTickets > 3 ? 'up' : 'neutral'} />
          <StatCard title="Resolved Weekly" value={summary.resolvedThisWeek} subtitle="Closed within SLA" icon="✅" color="var(--brand)" />
          <StatCard title="Org Employees" value={summary.totalEmployees} subtitle={`Enrolled in ${summary.orgName}`} icon="👥" color="#ffffff" />
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Orders Trend */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontWeight: 800, color: '#ffffff', fontSize: '15px', marginBottom: '3px', fontFamily: "'Chivo', sans-serif" }}>New Device Orders — Last 7 Days</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>Daily procurement volume</p>
              </div>
              <span className="badge-info">{orderValues.reduce((a, b) => a + b, 0)} total orders</span>
            </div>
            <SvgBarChart
              data={orderValues}
              maxVal={maxOrders}
              color="var(--brand)"
              labels={summary.trendData.map((d) => new Date(d.date).toLocaleDateString('en-IN', { weekday: 'narrow' }))}
            />
          </div>

          {/* Breaches Trend */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontWeight: 800, color: '#ffffff', fontSize: '15px', marginBottom: '3px', fontFamily: "'Chivo', sans-serif" }}>SLA Breaches — Last 7 Days</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>Proactively detected delays</p>
              </div>
              <span className="badge-breach">{breachValues.reduce((a, b) => a + b, 0)} total</span>
            </div>
            <SvgBarChart
              data={breachValues}
              maxVal={maxBreaches}
              color="#f87171"
              labels={summary.trendData.map((d) => new Date(d.date).toLocaleDateString('en-IN', { weekday: 'narrow' }))}
            />
          </div>
        </div>

        {/* Program Health Score */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 800, color: '#ffffff', fontSize: '16px', marginBottom: '20px', fontFamily: "'Chivo', sans-serif" }}>Program Health Compliance Index</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Employee Adoption Rate', value: summary.adoptionRate, color: 'var(--brand)' },
              { label: 'SLA Delivery Compliance', value: Math.max(0, 100 - summary.breachRate), color: '#5eead4' },
              {
                label: 'Support Ticket Resolution Rate',
                value: summary.openTickets === 0 ? 100 : Math.max(0, Math.round((summary.resolvedThisWeek / (summary.resolvedThisWeek + summary.openTickets)) * 100)),
                color: '#93c5fd',
              },
            ].map((m) => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{m.label}</span>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: m.color }}>{m.value}%</span>
                </div>
                <div style={{ height: '7px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '9999px', width: `${m.value}%`,
                    background: m.color,
                    transition: 'width 0.7s ease',
                    boxShadow: `0 0 10px ${m.color}80`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
