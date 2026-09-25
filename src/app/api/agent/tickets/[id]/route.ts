import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getStore, newId } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (payload.role !== 'agent') {
      return NextResponse.json({ success: false, error: 'Agents only' }, { status: 403 });
    }

    const body = await req.json() as { response?: string; resolve?: boolean };
    if (!body.response) {
      return NextResponse.json({ success: false, error: 'Response text is required' }, { status: 400 });
    }

    const store = await getStore();
    const ticket = store.getTicketById(id);
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });

    const now = new Date().toISOString();
    const updates = {
      response: body.response,
      assignedAgentId: payload.userId,
      status: (body.resolve ? 'resolved' : 'in_progress') as 'resolved' | 'in_progress',
      resolvedAt: body.resolve ? now : undefined,
    };

    store.updateTicket(ticket.id, updates);

    // Notify employee of response
    store.addNotification({
      id: newId('notif'),
      userId: ticket.employeeId,
      caseId: ticket.caseId,
      ticketId: ticket.id,
      channel: 'in_app',
      title: body.resolve ? '✅ Ticket resolved' : '💬 Agent responded to your ticket',
      message: body.response.slice(0, 120) + (body.response.length > 120 ? '...' : ''),
      read: false,
      sentAt: now,
    });

    return NextResponse.json({ success: true, data: store.getTicketById(ticket.id) });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
