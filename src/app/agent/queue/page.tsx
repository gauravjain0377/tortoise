'use client';

import { AppLayout } from '@/components/AppLayout';
import { useApi } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface QueueItem {
  id: string;
  type: 'order' | 'repair';
  deviceName: string;
  deviceValue: number;
  currentStage: string;
  stageEnteredAt: string;
  isBreached: boolean;
  breachedAt?: string;
  breachReason?: string;
  employeeName: string;
  employeeEmail: string;
  orgName: string;
  hoursInStage: number;
  slaLimitHours: number;
  slaRemainingHours: number;
  openTicketCount: number;
  createdAt: string;
}

interface TransitionState {
  caseId: string;
  loading: boolean;
}

const STAGE_LABELS: Record<string, string> = {
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

const NEXT_STAGES: Record<string, string> = {
  placed: 'confirmed',
  confirmed: 'sourced',
  sourced: 'dispatched',
  dispatched: 'in_transit',
  in_transit: 'delivered',
  pickup_scheduled: 'picked_up',
  picked_up: 'at_service_center',
  at_service_center: 'repaired',
  repaired: 'dispatched_back',
  dispatched_back: 'delivered',
};

export default function AgentQueuePage() {
  const { call } = useApi();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'breached'>('all');
  const [transitioning, setTransitioning] = useState<TransitionState | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const load = async (f: 'all' | 'breached' = filter) => {
    const res = await call<QueueItem[]>(`/api/agent/queue${f === 'breached' ? '?filter=breached' : ''}`);
    if (res.success && res.data) setQueue(res.data);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const handleTransition = async (c: QueueItem) => {
    const toStage = NEXT_STAGES[c.currentStage];
    if (!toStage) return;
    setTransitioning({ caseId: c.id, loading: true });
    const res = await call(`/api/agent/cases/${c.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ toStage, note: `Advanced to ${STAGE_LABELS[toStage] ?? toStage} by agent` }),
    });
    setTransitioning(null);
    if (res.success) {
      setSuccessId(c.id);
      setTimeout(() => setSuccessId(null), 2000);
      void load(filter);
    }
  };

  const breachedCount = queue.filter((c) => c.isBreached).length;
  const displayed = filter === 'breached' ? queue.filter((c) => c.isBreached) : queue;

  return (
    <AppLayout expectedRole="agent">
      <div style={{ padding: '32px 40px', maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(131,237,168,0.1)', border: '1px solid rgba(131,237,168,0.25)', marginBottom: '12px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand)' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Hardware Operations
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', fontFamily: "'Chivo', sans-serif", letterSpacing: '-0.02em', margin: 0 }}>
              Case & Order Queue
            </h1>
            <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              Real-time audit queue tracking fulfilment states, logistics, and SLA compliance
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex', padding: '4px', borderRadius: '12px',
            background: '#11141c', border: '1px solid rgba(255,255,255,0.08)', gap: '4px',
          }}>
            <button
              onClick={() => { setFilter('all'); void load('all'); }}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                background: filter === 'all' ? 'var(--brand)' : 'transparent',
                color: filter === 'all' ? '#08090c' : 'rgba(255,255,255,0.7)',
              }}
            >
              All Cases ({queue.length})
            </button>
            <button
              onClick={() => { setFilter('breached'); void load('breached'); }}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                background: filter === 'breached' ? '#ef4444' : 'transparent',
                color: filter === 'breached' ? '#ffffff' : 'rgba(255,255,255,0.7)',
              }}
            >
              SLA Breached ({breachedCount})
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Active Pipeline', value: queue.length, note: 'All live cases', color: '#ffffff' },
            { label: 'SLA Breaches', value: breachedCount, note: breachedCount > 0 ? 'Requires attention' : 'Zero breaches', color: breachedCount > 0 ? '#f87171' : 'var(--brand)' },
            { label: 'New Orders', value: queue.filter((c) => c.type === 'order').length, note: 'Procurement track', color: 'var(--brand)' },
            { label: 'Repairs & Care', value: queue.filter((c) => c.type === 'repair').length, note: 'Service track', color: '#67e8f9' },
          ].map((k) => (
            <div
              key={k.label}
              style={{
                padding: '20px 24px', borderRadius: '16px',
                background: '#11141c', border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {k.label}
              </div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: k.color, fontFamily: "'Chivo', sans-serif", margin: '6px 0 2px', lineHeight: 1 }}>
                {k.value}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                {k.note}
              </div>
            </div>
          ))}
        </div>

        {/* Main Table Card */}
        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          background: '#11141c', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              Loading operations queue…
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>✓</div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '16px' }}>No cases found</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                {filter === 'breached' ? 'All hardware cases are running within SLA.' : 'Queue is completely clear.'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#0c0e14', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '14px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Device & Recipient
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Current Stage
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      SLA Status
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Enterprise Org
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Tickets
                    </th>
                    <th style={{ padding: '14px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((c) => {
                    const nextStage = NEXT_STAGES[c.currentStage];
                    const isTransitioning = transitioning?.caseId === c.id;
                    const isSuccess = successId === c.id;

                    return (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        {/* Device & Recipient */}
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                              background: '#161922', border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                              {c.type === 'order' ? '💻' : '🔧'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>
                                {c.deviceName}
                              </div>
                              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                                {c.employeeName} &bull; ₹{(c.deviceValue / 1000).toFixed(0)}K
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Current Stage */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                            background: 'rgba(255,255,255,0.06)', color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}>
                            {STAGE_LABELS[c.currentStage] ?? c.currentStage}
                          </span>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                            {c.hoursInStage.toFixed(0)}h in stage
                          </div>
                        </td>

                        {/* SLA Status */}
                        <td style={{ padding: '16px 20px' }}>
                          {c.isBreached ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                              background: 'rgba(239,68,68,0.12)', color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.25)',
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                              {Math.abs(c.slaRemainingHours).toFixed(0)}h Overdue
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                              background: 'rgba(131,237,168,0.1)', color: 'var(--brand)',
                              border: '1px solid rgba(131,237,168,0.25)',
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand)' }} />
                              {c.slaRemainingHours.toFixed(0)}h remaining
                            </span>
                          )}
                        </td>

                        {/* Enterprise Org */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                            {c.orgName}
                          </span>
                        </td>

                        {/* Tickets */}
                        <td style={{ padding: '16px 20px' }}>
                          {c.openTicketCount > 0 ? (
                            <span style={{
                              padding: '3px 10px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 700,
                              background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)',
                            }}>
                              {c.openTicketCount} open
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>—</span>
                          )}
                        </td>

                        {/* Workflow Action */}
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {isSuccess ? (
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand)' }}>✓ Stage Advanced</span>
                            ) : nextStage ? (
                              <button
                                onClick={() => void handleTransition(c)}
                                disabled={isTransitioning}
                                className="btn-primary"
                                style={{
                                  padding: '7px 14px', fontSize: '12px', fontWeight: 700, borderRadius: '8px',
                                  opacity: isTransitioning ? 0.6 : 1,
                                }}
                              >
                                {isTransitioning ? '…' : `Advance to ${STAGE_LABELS[nextStage] ?? nextStage} →`}
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand)' }}>✓ Delivered</span>
                            )}

                            <Link
                              href={`/employee/cases/${c.id}`}
                              style={{
                                padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.color = '#fff';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                              }}
                            >
                              Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
