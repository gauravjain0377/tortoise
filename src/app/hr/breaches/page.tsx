'use client';

import { AppLayout } from '@/components/AppLayout';
import { useApi } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BreachedCase {
  id: string;
  type: 'order' | 'repair';
  deviceName: string;
  deviceValue: number;
  currentStage: string;
  currentStageLabel: string;
  isBreached: boolean;
  breachReason?: string;
  employeeName: string;
  employeeEmail: string;
  employeeDepartment: string;
  orgName?: string;
  hoursInStage: number;
  slaLimitHours: number;
  hoursOverdue: number;
  openTicketCount: number;
  createdAt: string;
}

const BREACH_REASONS: Record<string, string> = {
  supplier_delay: 'Supplier Logistics Delay',
  logistics_hold: 'Courier Transit Hold',
  customs_clearance: 'Customs & Regulatory Delay',
  service_center_backlog: 'OEM Service Center Backlog',
};

function OverdueBadge({ hours }: { hours: number }) {
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  const label = days > 0 ? `${days}d ${remainingHours}h overdue` : `${hours.toFixed(0)}h overdue`;
  const color = hours > 72 ? '#f87171' : '#fbbf24';
  return (
    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
    }}>
      {label}
    </span>
  );
}

export default function HrBreachesPage() {
  const { call } = useApi();
  const [breaches, setBreaches] = useState<BreachedCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await call<BreachedCase[]>('/api/hr/breaches');
      if (res.success && res.data) setBreaches(res.data);
      setLoading(false);
    };
    void load();
  }, [call]);

  return (
    <AppLayout expectedRole="hr_admin">
      <div style={{ padding: '32px', maxWidth: '1140px', margin: '0 auto' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '16px' }}>
          <Link
            href="/hr/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--brand)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
          >
            ← Back to Program Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', fontFamily: "'Chivo', sans-serif", letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Active SLA Breaches
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
              Hardware orders and repairs that exceeded promised timelines. Sorted by overdue severity.
            </p>
          </div>
          {breaches.length > 0 && (
            <div className="glass-card" style={{ padding: '14px 20px', textAlign: 'center', borderColor: 'rgba(248,113,113,0.3)' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#f87171', fontFamily: "'Chivo', sans-serif", lineHeight: 1 }}>{breaches.length}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                Breached Orders
              </div>
            </div>
          )}
        </div>

        {/* Proactive notice */}
        <div style={{
          marginBottom: '28px', padding: '18px 22px', borderRadius: '16px',
          background: 'rgba(131,237,168,0.06)', border: '1px solid rgba(131,237,168,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '14px', marginBottom: '3px' }}>Proactive SLA Escalation in Progress</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                Tortoise Pulse has automatically flagged these orders to our dedicated operations desk. Affected employees have been notified with updated delivery windows so you never face frustrated escalations. For special handling, contact <span style={{ color: 'var(--brand)', fontWeight: 700 }}>ops@tortoise.pro</span>.
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="glass-card p-6 h-36 shimmer" />)}
          </div>
        ) : breaches.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', fontFamily: "'Chivo', sans-serif", marginBottom: '8px' }}>
              Zero Active Breaches
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '440px', margin: '0 auto 24px' }}>
              All device shipments and repairs across your organization are running strictly on time within contractual SLA thresholds.
            </div>
            <Link href="/hr/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-primary">Back to Dashboard</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {breaches.map((b) => (
              <div
                key={b.id}
                className="glass-card animate-slide-up"
                style={{ padding: '24px', borderColor: 'rgba(248,113,113,0.35)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0,
                      background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.25)',
                    }}>
                      {b.type === 'order' ? '💻' : '🔧'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '16px' }}>{b.deviceName}</div>
                      <div style={{ fontSize: '13px', marginTop: '2px', color: 'rgba(255,255,255,0.8)' }}>
                        {b.employeeName} &bull; {b.employeeDepartment}
                      </div>
                      <div style={{ fontSize: '12px', marginTop: '2px', color: 'rgba(255,255,255,0.6)' }}>
                        {b.employeeEmail}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <OverdueBadge hours={b.hoursOverdue} />
                    {b.breachReason && (
                      <div style={{ fontSize: '12px', marginTop: '8px', color: '#fbbf24', fontWeight: 600 }}>
                        Root cause: {BREACH_REASONS[b.breachReason] ?? b.breachReason}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Current Stage</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{b.currentStageLabel}</div>
                  </div>
                  <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Target SLA Window</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>
                      Within {b.slaLimitHours} hours
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Elapsed Duration</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#f87171' }}>
                      {b.hoursInStage.toFixed(0)} hours in stage
                    </div>
                  </div>
                </div>

                {b.openTicketCount > 0 && (
                  <div style={{
                    marginTop: '14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px',
                    color: '#fbbf24', fontWeight: 600,
                  }}>
                    <span>🎫</span>
                    <span>{b.openTicketCount} active support ticket{b.openTicketCount > 1 ? 's' : ''} opened by this employee</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
