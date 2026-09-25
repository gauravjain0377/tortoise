import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getStore, newId } from '@/lib/store';
import { triageTicket, TICKET_SLA_HOURS } from '@/lib/groqTriage';
import type { Ticket, TicketCategory, TicketPriority } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    const store = await getStore();

    const tickets = store.tickets.filter((t) => t.employeeId === payload.userId);
    return NextResponse.json({ success: true, data: tickets });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (payload.role !== 'employee') {
      return NextResponse.json({ success: false, error: 'Only employees can raise tickets' }, { status: 403 });
    }

    const body = await req.json() as {
      caseId?: string;
      subject?: string;
      description?: string;
    };

    if (!body.caseId || !body.subject || !body.description) {
      return NextResponse.json({ success: false, error: 'caseId, subject, and description are required' }, { status: 400 });
    }

    const store = await getStore();
    const c = store.findCaseById(body.caseId);

    if (!c) return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
    if (c.employeeId !== payload.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // AI Triage (with mock + rule-based fallback)
    const triage = await triageTicket(body.subject, body.description, c.currentStage);

    const slaHours = TICKET_SLA_HOURS[triage.category] ?? 24;
    const slaDeadlineAt = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    const ticket: Ticket = {
      id: newId('ticket'),
      caseId: body.caseId,
      employeeId: payload.userId,
      orgId: payload.orgId,
      subject: body.subject,
      description: body.description,
      category: triage.category as TicketCategory,
      priority: triage.suggestedPriority as TicketPriority,
      status: 'open',
      slaDeadlineHours: slaHours,
      slaDeadlineAt,
      isSlaBreached: false,
      aiConfidence: triage.confidence,
      aiUsed: triage.method === 'ai' || triage.method === 'mock',
      createdAt: new Date().toISOString(),
    };

    store.addTicket(ticket);

    // Notify the default agent
    store.addNotification({
      id: newId('notif'),
      userId: 'user_agent1',
      caseId: body.caseId,
      ticketId: ticket.id,
      channel: 'in_app',
      title: `New ${ticket.priority.toUpperCase()} ticket`,
      message: `${store.findUserById(payload.userId)?.name ?? 'Employee'}: "${body.subject}"`,
      read: false,
      sentAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { ticket, triage },
      message: 'Ticket created and triaged successfully',
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
