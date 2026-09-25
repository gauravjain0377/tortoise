'use client';

import { AppLayout } from '@/components/AppLayout';
import { useAuth, useApi } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Case } from '@/types';

type EnrichedCase = Case & {
  hoursInStage: number;
  slaRemainingHours: number;
  openTicketCount: number;
};

function StageBadge({ stage, isBreached }: { stage: string; isBreached: boolean }) {
  if (isBreached) return <span className="badge-breach">🚨 SLA Breached</span>;
  const stageColors: Record<string, string> = {
    delivered: 'badge-success',
    in_transit: 'badge-info',
    dispatched: 'badge-info',
    sourced: 'badge-warning',
    confirmed: 'badge-neutral',
    placed: 'badge-neutral',
    pickup_scheduled: 'badge-neutral',
    picked_up: 'badge-info',
    at_service_center: 'badge-warning',
    repaired: 'badge-success',
    dispatched_back: 'badge-info',
  };
  const labels: Record<string, string> = {
    placed: 'Placed',
    confirmed: 'Confirmed',
    sourced: 'Sourced',
    dispatched: 'Dispatched',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    pickup_scheduled: 'Pickup Scheduled',
    picked_up: 'Picked Up',
    at_service_center: 'At Service Center',
    repaired: 'Repaired',
    dispatched_back: 'Return Dispatched',
  };
  return <span className={stageColors[stage] ?? 'badge-neutral'}>{labels[stage] ?? stage}</span>;
}

function SlaIndicator({ remaining, limit }: { remaining: number; limit: number }) {
  if (limit === 0) return null;
  const pct = Math.max(0, Math.min(100, ((limit - Math.max(0, limit - remaining)) / limit) * 100));
  const color = remaining < 0 ? '#f87171' : remaining < limit * 0.3 ? '#fbbf24' : 'var(--brand)';
  const label = remaining < 0 ? `${Math.abs(remaining).toFixed(0)}h overdue` : `${remaining.toFixed(0)}h remaining`;
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'rgba(255,255,255,0.7)' }}>
        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SLA Target</span>
        <span style={{ color, fontWeight: 700 }}>{label}</span>
      </div>
      <div className="sla-bar">
        <div className="sla-bar-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}80` }} />
      </div>
    </div>
  );
}

function CaseCard({ c }: { c: EnrichedCase }) {
  const org = { slaConfig: { placed: 24, confirmed: 48, sourced: 24, dispatched: 24, in_transit: 72, delivered: 0 } };
  const slaLimit = (org.slaConfig as Record<string, number>)[c.currentStage] ?? 24;

  return (
    <Link href={`/employee/cases/${c.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="glass-card"
        style={{
          padding: '22px',
          borderColor: c.isBreached ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              background: '#161922',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {c.type === 'order' ? '💻' : '🔧'}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '15px' }}>{c.deviceName}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '3px', textTransform: 'capitalize' }}>
                {c.type} &bull; ₹{(c.deviceValue / 1000).toFixed(0)}K device value
              </div>
            </div>
          </div>
          <StageBadge stage={c.currentStage} isBreached={c.isBreached} />
        </div>
        <SlaIndicator remaining={c.slaRemainingHours} limit={slaLimit} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
          <span>{c.hoursInStage.toFixed(0)}h in stage</span>
          {c.openTicketCount > 0 && (
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>&bull; {c.openTicketCount} open ticket{c.openTicketCount > 1 ? 's' : ''}</span>
          )}
          {c.tenureMonths && <span>&bull; {c.tenureMonths}mo lease</span>}
          <span style={{ marginLeft: 'auto', color: 'var(--brand)', fontWeight: 700 }}>View timeline →</span>
        </div>
      </div>
    </Link>
  );
}

function BenefitUsageCard({ usage }: { usage: { freeRepairsUsed: number; freeRepairsCap: number; policyYear: number } | null }) {
  if (!usage) return null;
  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(131,237,168,0.15)', fontSize: '18px',
        }}>
          🛡️
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>Tortoise Care</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>Free annual repairs — FY{usage.policyYear}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        {Array.from({ length: usage.freeRepairsCap }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: '8px', borderRadius: '9999px',
            background: i < usage.freeRepairsUsed
              ? 'var(--brand)'
              : 'rgba(255,255,255,0.12)',
            transition: 'all 0.3s',
            boxShadow: i < usage.freeRepairsUsed ? '0 0 8px rgba(131,237,168,0.4)' : 'none',
          }} />
        ))}
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
        {usage.freeRepairsUsed} of {usage.freeRepairsCap} free repairs used this policy period
        {usage.freeRepairsUsed >= usage.freeRepairsCap && (
          <span style={{ color: '#fbbf24', fontWeight: 600 }}> — annual cap reached</span>
        )}
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { call } = useApi();
  const [cases, setCases] = useState<EnrichedCase[]>([]);
  const [usage, setUsage] = useState<{ freeRepairsUsed: number; freeRepairsCap: number; policyYear: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; read: boolean; sentAt: string }>>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [casesRes, usageRes, notifsRes] = await Promise.all([
        call<EnrichedCase[]>('/api/employee/cases'),
        call<typeof usage>('/api/employee/benefit-usage'),
        call<typeof notifications>('/api/employee/notifications'),
      ]);
      if (casesRes.success && casesRes.data) setCases(casesRes.data);
      if (usageRes.success) setUsage(usageRes.data ?? null);
      if (notifsRes.success && notifsRes.data) setNotifications(notifsRes.data);
      setLoading(false);
    };
    void load();
  }, [call]);

  const breachedCount = cases.filter((c) => c.isBreached).length;
  const activeCount = cases.filter((c) => c.currentStage !== 'delivered').length;
  const deliveredCount = cases.filter((c) => c.currentStage === 'delivered').length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout expectedRole="employee">
      <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', fontFamily: "'Chivo', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Welcome, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)' }}>
              {user?.department} &middot; {user?.grade} &middot; Tortoise Enterprise Member
            </p>
          </div>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              position: 'relative', width: '44px', height: '44px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              background: 'var(--bg-card)', border: '1px solid rgba(131,237,168,0.2)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)';
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131,237,168,0.2)';
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
            }}
          >
            🔔
            {unreadNotifs > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '18px', height: '18px', borderRadius: '50%', background: '#f87171', color: 'white',
                fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadNotifs}
              </span>
            )}
          </button>
        </div>

        {/* Notifications Dropdown Panel */}
        {showNotifs && (
          <div className="glass-card animate-slide-up" style={{ marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>Notifications & Alerts</span>
              <button onClick={() => setShowNotifs(false)} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <div>
              {notifications.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>No notifications</div>
              ) : notifications.slice(0, 5).map((n) => (
                <div key={n.id} style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px',
                  borderBottom: '1px solid var(--border-light)',
                  background: n.read ? undefined : 'rgba(131,237,168,0.06)',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', flexShrink: 0, background: n.read ? 'var(--border)' : 'var(--brand)' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '3px' }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{n.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Breach Alert */}
        {breachedCount > 0 && (
          <div style={{
            marginBottom: '24px', padding: '16px 20px', borderRadius: '14px',
            display: 'flex', alignItems: 'center', gap: '14px',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          }} className="animate-slide-up">
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,113,113,0.2)', flexShrink: 0, fontSize: '18px' }}>🚨</div>
            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>
                {breachedCount} order{breachedCount > 1 ? 's have' : ' has'} exceeded the promised SLA timeline
              </div>
              <div style={{ fontSize: '12px', marginTop: '3px', color: 'rgba(255,255,255,0.75)' }}>
                Our support team is actively expedited this case with our logistics partners.
              </div>
            </div>
          </div>
        )}

        {/* Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Active Devices / Orders', value: activeCount, icon: '💻', color: 'var(--brand)' },
            { label: 'SLA Overdue Alert', value: breachedCount, icon: '🚨', color: breachedCount > 0 ? '#f87171' : 'var(--brand)' },
            { label: 'Delivered & Active', value: deliveredCount, icon: '✅', color: '#5eead4' },
          ].map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: '22px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: s.color, fontFamily: "'Chivo', sans-serif", lineHeight: 1.1, marginBottom: '6px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          {/* Cases List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: "'Chivo', sans-serif" }}>My Tracked Devices</h2>
              <Link href="/employee/support" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand)', textDecoration: 'none' }}>
                + Raise a ticket
              </Link>
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="shimmer glass-card" style={{ height: '130px' }} />
                ))}
              </div>
            ) : cases.length === 0 ? (
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>💻</div>
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '16px', marginBottom: '6px' }}>No devices enrolled yet</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Check with your HR admin or order via the Tortoise portal.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {cases.map((c) => <CaseCard key={c.id} c={c} />)}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: "'Chivo', sans-serif" }}>Program Benefits</h2>
            <BenefitUsageCard usage={usage} />

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>💬 Need Help with your Hardware?</div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '18px', lineHeight: 1.6 }}>
                Report an issue and our automated AI triage engine will prioritize and route it directly to Tortoise engineers.
              </p>
              <Link href="/employee/support">
                <button className="btn-primary" style={{ width: '100%', fontSize: '13.5px', padding: '11px' }}>
                  Raise Support Ticket →
                </button>
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>📋 Tortoise SLA Commitments</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Order Confirmation', time: '24 hrs' },
                  { label: 'Device Dispatch', time: '3 days' },
                  { label: 'Doorstep Delivery', time: '3 days' },
                  { label: 'Repair Pickup', time: '24 hrs' },
                  { label: 'Service Center Turnaround', time: '48 hrs' },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>{s.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand)' }}>{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
