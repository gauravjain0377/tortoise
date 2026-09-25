'use client';

import { AppLayout } from '@/components/AppLayout';
import { useApi } from '@/context/AuthContext';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Case } from '@/types';

interface TriageResult {
  category: string;
  suggestedPriority: string;
  confidence: number;
  method: string;
  reasoning?: string;
}

interface TicketResponse {
  ticket: { id: string; category: string; priority: string; slaDeadlineHours: number };
  triage: TriageResult;
}

const CATEGORY_LABELS: Record<string, string> = {
  'order-stuck': '📦 Order Delayed / Stuck',
  'repair-overdue': '🔧 Repair Delayed / Overdue',
  'billing-dispute': '💳 Billing & Lease Query',
  'device-issue': '🖥️ Hardware / Software Issue',
  'general': '💬 General Assistance',
};

const PRIORITY_BADGES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.3)', label: 'CRITICAL (2h SLA)' },
  high: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)', label: 'HIGH (4h SLA)' },
  medium: { bg: 'rgba(131,237,168,0.12)', text: 'var(--brand)', border: 'rgba(131,237,168,0.3)', label: 'MEDIUM (12h SLA)' },
  low: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.15)', label: 'LOW (24h SLA)' },
};

function TicketFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { call } = useApi();

  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState(searchParams.get('caseId') ?? '');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [triaging, setTriaging] = useState(false);
  const [result, setResult] = useState<TicketResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await call<Case[]>('/api/employee/cases');
      if (res.success && res.data) {
        setCases(res.data.filter((c) => c.currentStage !== 'delivered'));
      }
    };
    void load();
  }, [call]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !subject || !description) return;
    setLoading(true);
    setTriaging(true);
    setError('');

    const res = await call<TicketResponse>('/api/employee/tickets', {
      method: 'POST',
      body: JSON.stringify({ caseId: selectedCase, subject, description }),
    });

    setTriaging(false);
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setError(res.error ?? 'Failed to submit support ticket. Please try again.');
    }
  };

  if (result) {
    const { ticket, triage } = result;
    const priBadge = PRIORITY_BADGES[triage.suggestedPriority] ?? PRIORITY_BADGES.medium;

    return (
      <AppLayout expectedRole="employee">
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>
          <div className="glass-card animate-slide-up" style={{ padding: '36px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
              background: 'rgba(131,237,168,0.15)', border: '2px solid var(--brand)',
              boxShadow: '0 0 24px rgba(131,237,168,0.3)',
            }}>
              ✓
            </div>

            <h2 style={{ fontFamily: "'Chivo', sans-serif", fontSize: '26px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Support Ticket Submitted
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '28px' }}>
              Your ticket has been prioritized and routed to the Tortoise support team.
            </p>

            {/* AI Triage Card */}
            <div style={{
              padding: '24px', borderRadius: '16px', textAlign: 'left', marginBottom: '28px',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(131,237,168,0.15)',
                    color: 'var(--brand)', fontSize: '14px', fontWeight: 800,
                  }}>⚡</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>AI Automated Triage</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                      Confidence: {(triage.confidence * 100).toFixed(0)}% • Engine: {triage.method === 'ai' ? 'Groq AI' : 'Tortoise Rules'}
                    </div>
                  </div>
                </div>

                <span style={{
                  padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
                  background: priBadge.bg, color: priBadge.text, border: `1px solid ${priBadge.border}`,
                }}>
                  {priBadge.label}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(131,237,168,0.12)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Classification</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    {CATEGORY_LABELS[triage.category] ?? triage.category}
                  </div>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(131,237,168,0.12)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Guaranteed SLA</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand)' }}>
                    Within {ticket.slaDeadlineHours} hours
                  </div>
                </div>
              </div>

              {triage.reasoning && (
                <div style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5,
                  padding: '10px 12px', borderRadius: '8px', background: 'rgba(131,237,168,0.05)',
                }}>
                  💡 {triage.reasoning}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => router.push('/employee/dashboard')}
                className="btn-secondary"
                style={{ flex: 1, padding: '12px' }}
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={() => { setResult(null); setSubject(''); setDescription(''); }}
                className="btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                Raise Another Ticket
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout expectedRole="employee">
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '36px 24px' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '16px' }}>
          <Link
            href="/employee/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--brand)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; }}
          >
            ← Back to My Devices
          </Link>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Chivo', sans-serif", fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Raise a Support Ticket
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
            Report an issue with your device order, delivery timeline, or hardware malfunction.
          </p>
        </div>

        {/* AI Triage Banner */}
        <div style={{
          padding: '18px 20px', borderRadius: '14px', marginBottom: '24px',
          background: '#11141c', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'var(--brand)', color: '#0b2118',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 800, flexShrink: 0,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Proactive AI Triage & Routing</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              Your ticket is automatically analyzed for urgency, bound to strict SLA timers, and routed directly to Tortoise engineers.
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <form onSubmit={(e) => { void handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Case selector */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Related Device / Case <span style={{ color: 'var(--brand)' }}>*</span>
              </label>
              <select
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                className="input"
                required
                style={{ fontSize: '14px' }}
              >
                <option value="">Select the affected order or repair...</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.deviceName} — {c.currentStage.replace(/_/g, ' ').toUpperCase()} ({c.type})
                  </option>
                ))}
              </select>
              {cases.length === 0 && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
                  No active orders found. You can still reach Tortoise support via email.
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Subject / Issue Summary <span style={{ color: 'var(--brand)' }}>*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Order in transit for 5 days without courier tracking update"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={200}
                style={{ fontSize: '14px' }}
              />
            </div>

            {/* Description */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  Detailed Description <span style={{ color: 'var(--brand)' }}>*</span>
                </label>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                  {description.length}/2000 chars
                </span>
              </div>
              <textarea
                className="textarea"
                placeholder="Provide as much detail as possible (e.g. exact symptoms, delivery address, courier waybill number if applicable). This helps our AI accurately assign the right SLA window."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                minLength={15}
                style={{ fontSize: '14px' }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
                background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedCase || !subject || !description}
              className="btn-primary"
              style={{
                padding: '14px 20px', fontSize: '15px', fontWeight: 700,
                opacity: loading || !selectedCase || !subject || !description ? 0.6 : 1,
                cursor: loading || !selectedCase || !subject || !description ? 'not-allowed' : 'pointer',
              }}
            >
              {triaging ? (
                <>
                  <svg className="animate-spin" style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Classifying ticket with AI…
                </>
              ) : 'Submit Ticket & Start SLA Timer →'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={
      <AppLayout expectedRole="employee">
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '36px 24px' }}>
          <div className="glass-card shimmer" style={{ height: '350px' }} />
        </div>
      </AppLayout>
    }>
      <TicketFormContent />
    </Suspense>
  );
}
