import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getStore, newId } from '@/lib/store';
import { isValidTransition, STAGE_LABELS, DEFAULT_SLA_CONFIG } from '@/lib/stateMachine';
import type { CaseStage } from '@/types';

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

    const body = await req.json() as {
      toStage?: CaseStage;
      reasonCode?: string;
      note?: string;
    };

    if (!body.toStage) {
      return NextResponse.json({ success: false, error: 'toStage is required' }, { status: 400 });
    }

    const store = await getStore();
    const c = store.findCaseById(id);

    if (!c) return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });

    // Validate transition
    if (!isValidTransition(c.type, c.currentStage, body.toStage)) {
      return NextResponse.json({
        success: false,
        error: `Invalid transition: ${c.currentStage} → ${body.toStage}`,
      }, { status: 409 });
    }

    const now = new Date().toISOString();

    // Append immutable event
    const event = {
      id: newId('ev'),
      caseId: c.id,
      fromStage: c.currentStage,
      toStage: body.toStage,
      actor: payload.userId,
      actorName: store.findUserById(payload.userId)?.name ?? 'Agent',
      reasonCode: body.reasonCode,
      note: body.note,
      createdAt: now,
    };
    store.addCaseEvent(event);

    // Update case
    const org = store.findOrgById(c.orgId);
    const slaConfig = org?.slaConfig ?? DEFAULT_SLA_CONFIG;
    const slaLimitHours = slaConfig[body.toStage as keyof typeof slaConfig] ?? 24;

    store.updateCase(c.id, {
      currentStage: body.toStage,
      stageEnteredAt: now,
      isBreached: false,
      breachedAt: undefined,
    });

    // Notify employee of stage change
    store.addNotification({
      id: newId('notif'),
      userId: c.employeeId,
      caseId: c.id,
      channel: 'in_app',
      title: `📦 Order update: ${STAGE_LABELS[body.toStage] ?? body.toStage}`,
      message: body.note ?? `Your ${c.deviceName} order has moved to: ${STAGE_LABELS[body.toStage] ?? body.toStage}`,
      read: false,
      sentAt: now,
    });

    return NextResponse.json({
      success: true,
      data: { event, slaLimitHours },
      message: `Case transitioned to ${body.toStage}`,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
