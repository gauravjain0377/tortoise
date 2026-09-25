'use client';

import { AppLayout } from '@/components/AppLayout';
import { useAuth, useApi } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
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

// Live countdown timer that ticks every second
function LiveSlaCountdown({ remainingHours, limitHours }: { remainingHours: number; limitHours: number }) {
  // Convert hours to seconds for live countdown
  const initialSecs = Math.round(remainingHours * 3600);
  const [secsLeft, setSecsLeft] = useState(initialSecs);

  useEffect(() => {
    setSecsLeft(Math.round(remainingHours * 3600));
  }, [remainingHours]);

  useEffect(() => {
    if (secsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secsLeft]);

  if (limitHours === 0) return null;

  const isOverdue = secsLeft <= 0;
  const pct = isOverdue ? 0 : Math.min(100, (secsLeft / (limitHours * 3600)) * 100);
  const color = isOverdue ? '#f87171' : pct < 25 ? '#fbbf24' : 'var(--brand)';

  const h = Math.floor(Math.abs(secsLeft) / 3600);
  const m = Math.floor((Math.abs(secsLeft) % 3600) / 60);
  const s = Math.abs(secsLeft) % 60;

  const label = isOverdue
    ? `${h}h ${m}m overdue`
    : `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '7px', color: 'rgba(255,255,255,0.7)' }}>
        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block',
            animation: !isOverdue && pct < 50 ? 'tp-sla-tick 1s infinite' : undefined,
          }} />
          SLA Timer
        </span>
        <span style={{ color, fontWeight: 800, fontFamily: "'Chivo', monospace", letterSpacing: !isOverdue ? '0.03em' : undefined }}>
          {label}
        </span>
      </div>
      <div className="sla-bar">
        <div className="sla-bar-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}80` }} />
      </div>
    </div>
  );
}

// New Order Placement Modal
const DEVICE_CATALOG = [
  { id: 'd1', name: 'MacBook Pro 14" M3', brand: 'Apple', value: 185000, icon: '🍎' },
  { id: 'd2', name: 'ThinkPad X1 Carbon', brand: 'Lenovo', value: 128000, icon: '🖥️' },
  { id: 'd3', name: 'Dell XPS 15', brand: 'Dell', value: 145000, icon: '💻' },
  { id: 'd4', name: 'HP EliteBook 840', brand: 'HP', value: 98000, icon: '💼' },
  { id: 'd5', name: 'Surface Laptop 5', brand: 'Microsoft', value: 115000, icon: '🔵' },
];

function PlaceOrderModal({ onClose }: { onClose: () => void }) {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');

  const selected = DEVICE_CATALOG.find((d) => d.id === selectedDevice);

  if (step === 'success') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      }}>
        <div className="glass-card animate-slide-up" style={{ padding: '48px', textAlign: 'center', maxWidth: '420px', width: '100%', margin: '16px' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎉</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', fontFamily: "'Chivo', sans-serif", marginBottom: '8px' }}>Order Placed!</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
            Your <strong style={{ color: 'var(--brand)' }}>{selected?.name}</strong> order has been submitted.
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '28px', lineHeight: 1.6 }}>
            SLA tracking starts now. You'll receive email updates at every stage. Estimated delivery: <strong style={{ color: 'var(--brand)' }}>3–5 business days</strong>.
          </div>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Back to Dashboard →</button>
        </div>
      </div>
    );
  }

  if (step === 'confirm' && selected) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      }}>
        <div className="glass-card animate-slide-up" style={{ padding: '32px', maxWidth: '440px', width: '100%', margin: '16px' }}>
          <div style={{ fontWeight: 900, fontSize: '20px', color: '#fff', fontFamily: "'Chivo', sans-serif", marginBottom: '20px' }}>
            Confirm Order
          </div>
          <div style={{
            padding: '20px', borderRadius: '14px',
            background: 'rgba(131,237,168,0.06)', border: '1px solid rgba(131,237,168,0.2)',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '32px' }}>{selected.icon}</span>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '16px' }}>{selected.name}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{selected.brand} · ₹{(selected.value / 1000).toFixed(0)}K</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['Order Type', 'New Device Procurement'],
                ['SLA Commitment', '3–5 Business Days'],
                ['Tracking', 'Live SLA timer + Email alerts'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{k}</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep('select')}>← Back</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => setStep('success')}>Confirm Order ✓</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-card animate-slide-up" style={{ padding: '28px', maxWidth: '520px', width: '100%', margin: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '20px', color: '#fff', fontFamily: "'Chivo', sans-serif" }}>Place New Device Order</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>Select a device from the approved catalog</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {DEVICE_CATALOG.map((device) => {
            const isSelected = selectedDevice === device.id;
            return (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px', borderRadius: '12px', textAlign: 'left',
                  background: isSelected ? 'rgba(131,237,168,0.12)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '1px solid rgba(131,237,168,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                }}
              >
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{device.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{device.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{device.brand}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? 'var(--brand)' : 'rgba(255,255,255,0.7)', fontFamily: "'Chivo', sans-serif" }}>
                  ₹{(device.value / 1000).toFixed(0)}K
                </div>
                {isSelected && (
                  <span style={{
                    width: '20px', height: '20px', borderRadius: '50%', background: 'var(--brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 800, color: '#0b2118', flexShrink: 0,
                  }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
        <button
          className="btn-primary"
          disabled={!selectedDevice}
          style={{ width: '100%', opacity: selectedDevice ? 1 : 0.5 }}
          onClick={() => setStep('confirm')}
        >
          Continue with {selected?.name ?? 'selected device'} →
        </button>
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
          animation: c.isBreached ? 'tp-breach-pulse 2.5s infinite' : undefined,
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
        <LiveSlaCountdown remainingHours={c.slaRemainingHours} limitHours={slaLimit} />
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
  const [showOrderModal, setShowOrderModal] = useState(false);

  const load = useCallback(async () => {
    const [casesRes, usageRes, notifsRes] = await Promise.all([
      call<EnrichedCase[]>('/api/employee/cases'),
      call<typeof usage>('/api/employee/benefit-usage'),
      call<typeof notifications>('/api/employee/notifications'),
    ]);
    if (casesRes.success && casesRes.data) setCases(casesRes.data);
    if (usageRes.success) setUsage(usageRes.data ?? null);
    if (notifsRes.success && notifsRes.data) setNotifications(notifsRes.data);
    setLoading(false);
  }, [call]);

  useEffect(() => { void load(); }, [load]);

  const breachedCount = cases.filter((c) => c.isBreached).length;
  const activeCount = cases.filter((c) => c.currentStage !== 'delivered').length;
  const deliveredCount = cases.filter((c) => c.currentStage === 'delivered').length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout expectedRole="employee">
      {showOrderModal && <PlaceOrderModal onClose={() => setShowOrderModal(false)} />}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowOrderModal(true)}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>+</span> New Order
            </button>
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
