'use client';

import { AppLayout } from '@/components/AppLayout';
import { useApi } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CaseEvent } from '@/types';

interface CaseDetail {
  id: string;
  type: 'order' | 'repair';
  deviceName: string;
  deviceValue: number;
  tenureMonths?: number;
  currentStage: string;
  currentStageLabel: string;
  currentStageDescription: string;
  stageEnteredAt: string;
  isBreached: boolean;
  breachedAt?: string;
  breachReason?: string;
  hoursInStage: number;
  slaRemainingHours: number;
  slaLimitHours: number;
  progressPercent: number;
  createdAt: string;
  orgName?: string;
  events: (CaseEvent & { stageLabel: string })[];
  employee: { name: string; email: string; department: string };
  tickets: Array<{ id: string; subject: string; status: string; priority: string; category: string; createdAt: string }>;
  loaner?: { deviceName: string; deviceTag: string; issuedAt: string };
  benefitUsage?: { freeRepairsUsed: number; freeRepairsCap: number };
}

const BREACH_REASONS: Record<string, string> = {
  supplier_delay: 'Supplier Logistics Delay',
  logistics_hold: 'Courier Transit Hold',
  customs_clearance: 'Customs & Regulatory Delay',
  service_center_backlog: 'OEM Service Center Backlog',
  part_unavailable: 'Replacement Part Lead Time',
};

const PRIORITY_BADGES: Record<string, { bg: string; color: string }> = {
  critical: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  high: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  medium: { bg: 'rgba(131,237,168,0.15)', color: 'var(--brand)' },
  low: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' },
};

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { call } = useApi();
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await call<CaseDetail>(`/api/employee/cases/${params.id as string}`);
      if (res.success && res.data) {
        setCaseDetail(res.data);
      }
      setLoading(false);
    };
    void load();
  }, [call, params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
          <div className="glass-card shimmer" style={{ height: '220px', marginBottom: '24px' }} />
          <div className="glass-card shimmer" style={{ height: '400px' }} />
        </div>
      </AppLayout>
    );
  }

  if (!caseDetail) {
    return (
      <AppLayout>
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>❌</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>Case not found</div>
          <Link href="/employee/dashboard" style={{ color: 'var(--brand)', fontSize: '14px', marginTop: '12px', display: 'inline-block' }}>
            ← Back to My Devices
          </Link>
        </div>
      </AppLayout>
    );
  }

  const c = caseDetail;

  return (
    <AppLayout>
      <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)',
              background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--brand)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
          >
            ← Back to Devices
          </button>
        </div>

        {/* Top Header Card */}
        <div style={{
          padding: '28px', borderRadius: '16px', marginBottom: '24px',
          background: '#11141c', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {/* Main Title Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                background: '#161922', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {c.type === 'order' ? '💻' : '🔧'}
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', fontFamily: "'Chivo', sans-serif", margin: 0 }}>
                  {c.deviceName}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.65)', flexWrap: 'wrap' }}>
                  <span style={{ textTransform: 'capitalize' }}>{c.type}</span>
                  <span>&bull;</span>
                  <span>₹{c.deviceValue.toLocaleString('en-IN')} value</span>
                  {c.tenureMonths && (
                    <>
                      <span>&bull;</span>
                      <span>{c.tenureMonths} month lease</span>
                    </>
                  )}
                  <span>&bull;</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{c.orgName}</span>
                </div>
              </div>
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              {c.isBreached ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
                    background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }} />
                    SLA Breached ({Math.abs(c.slaRemainingHours).toFixed(0)}h Overdue)
                  </span>
                </div>
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
                  background: 'rgba(131,237,168,0.12)', color: 'var(--brand)', border: '1px solid rgba(131,237,168,0.25)',
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--brand)' }} />
                  On Track ({c.slaRemainingHours.toFixed(0)}h remaining)
                </span>
              )}
              {c.isBreached && c.breachReason && (
                <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>
                  Reason: {BREACH_REASONS[c.breachReason] ?? c.breachReason}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
              <span>Fulfilment Lifecycle Progress</span>
              <span style={{ color: 'var(--brand)', fontWeight: 800 }}>{c.progressPercent}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '9999px', width: `${c.progressPercent}%`,
                background: 'linear-gradient(90deg, #5dd68a, #83eda8)',
                boxShadow: '0 0 10px rgba(131,237,168,0.4)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>

          {/* SLA Metrics Row */}
          {c.currentStage !== 'delivered' && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
              marginTop: '20px', padding: '16px 20px', borderRadius: '12px',
              background: '#0d0f15', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Stage</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', marginTop: '3px' }}>{c.currentStageLabel}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stage Allowance</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', marginTop: '3px' }}>{c.slaLimitHours} hours max</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time in Stage</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', marginTop: '3px' }}>{c.hoursInStage.toFixed(1)} hours</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SLA Target</div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: c.isBreached ? '#f87171' : 'var(--brand)', marginTop: '3px' }}>
                  {c.isBreached ? `${Math.abs(c.slaRemainingHours).toFixed(0)}h overdue` : `${c.slaRemainingHours.toFixed(0)}h remaining`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Main Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Timeline */}
          <div style={{
            padding: '28px', borderRadius: '16px',
            background: '#11141c', border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', fontFamily: "'Chivo', sans-serif", marginBottom: '24px' }}>
              Audit & Fulfilment Timeline
            </h2>

            {c.events.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                No events recorded yet.
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '8px' }}>
                {c.events.map((ev, idx) => {
                  const isLast = idx === c.events.length - 1;
                  const isCurrent = isLast && c.currentStage !== 'delivered';
                  const date = new Date(ev.createdAt);

                  return (
                    <div key={ev.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                      {/* Vertical line connector */}
                      {!isLast && (
                        <div style={{
                          position: 'absolute', left: '17px', top: '38px', bottom: '0', width: '2px',
                          background: isCurrent ? 'var(--brand)' : 'rgba(255,255,255,0.1)',
                        }} />
                      )}

                      {/* Dot icon */}
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, position: 'relative', zIndex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                        background: isCurrent ? 'rgba(131,237,168,0.15)' : '#161922',
                        border: isCurrent ? '2px solid var(--brand)' : '1px solid rgba(255,255,255,0.15)',
                        boxShadow: isCurrent ? '0 0 12px rgba(131,237,168,0.4)' : 'none',
                      }}>
                        {ev.toStage === 'delivered' ? '✓' : isCurrent ? '⏳' : '●'}
                      </div>

                      {/* Event content */}
                      <div style={{ flex: 1, paddingBottom: isLast ? '0' : '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>
                            {ev.stageLabel}
                          </span>
                          {isCurrent && (
                            <span style={{
                              padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                              background: 'rgba(131,237,168,0.15)', color: 'var(--brand)',
                            }}>
                              Current Stage
                            </span>
                          )}
                        </div>

                        {ev.note && (
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', lineHeight: 1.5 }}>
                            {ev.note}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
                          <span>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>&bull;</span>
                          <span>{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>&bull;</span>
                          <span>by {ev.actorName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Support Tickets & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Support Tickets Card */}
            <div style={{
              padding: '24px', borderRadius: '16px',
              background: '#11141c', border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', fontFamily: "'Chivo', sans-serif", margin: 0 }}>
                  Support Tickets
                </h3>
                <Link
                  href={`/employee/support?caseId=${c.id}`}
                  style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand)', textDecoration: 'none' }}
                >
                  + New Ticket
                </Link>
              </div>

              {c.tickets.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                  No support tickets opened for this device yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {c.tickets.map((t) => {
                    const badge = PRIORITY_BADGES[t.priority] ?? PRIORITY_BADGES.medium;
                    return (
                      <div
                        key={t.id}
                        style={{
                          padding: '12px 14px', borderRadius: '10px',
                          background: '#0d0f15', border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
                          {t.subject}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <span style={{
                            padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800,
                            background: badge.bg, color: badge.color, textTransform: 'uppercase',
                          }}>
                            {t.priority}
                          </span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                            Status: {t.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {c.currentStage !== 'delivered' && (
                <Link href={`/employee/support?caseId=${c.id}`} style={{ textDecoration: 'none', display: 'block', marginTop: '8px' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px', fontWeight: 700 }}>
                    Raise Support Ticket →
                  </button>
                </Link>
              )}
            </div>

            {/* Loaner Device Card (if active) */}
            {c.loaner && (
              <div style={{
                padding: '24px', borderRadius: '16px',
                background: '#11141c', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                  Temporary Loaner Issued
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{c.loaner.deviceName}</div>
                <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                  Asset Tag: {c.loaner.deviceTag} &bull; Issued {new Date(c.loaner.issuedAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            )}

            {/* Repair Benefit Usage (if repair) */}
            {c.benefitUsage && c.type === 'repair' && (
              <div style={{
                padding: '24px', borderRadius: '16px',
                background: '#11141c', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                  Corporate Care Repair Benefit
                </div>
                <div style={{ display: 'flex', gap: '6px', margin: '10px 0' }}>
                  {Array.from({ length: c.benefitUsage.freeRepairsCap }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1, height: '6px', borderRadius: '9999px',
                        background: i < c.benefitUsage!.freeRepairsUsed ? 'var(--brand)' : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
                  {c.benefitUsage.freeRepairsUsed} of {c.benefitUsage.freeRepairsCap} free annual repairs utilized
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
