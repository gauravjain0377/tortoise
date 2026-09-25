import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { hoursInStage, slaRemainingHours, getProgressPercent, DEFAULT_SLA_CONFIG, STAGE_LABELS, STAGE_DESCRIPTIONS } from '@/lib/stateMachine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    const store = await getStore();
    const c = store.findCaseById(id);

    if (!c) return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });

    // Employees can only see their own cases
    if (payload.role === 'employee' && c.employeeId !== payload.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    // HR admins can only see cases from their org
    if (payload.role === 'hr_admin' && c.orgId !== payload.orgId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const org = store.findOrgById(c.orgId);
    const slaConfig = org?.slaConfig ?? DEFAULT_SLA_CONFIG;
    const events = store.getEventsForCase(c.id);
    const employee = store.findUserById(c.employeeId);
    const tickets = store.getTicketsForCase(c.id);
    const loaner = c.loanerDeviceId ? store.getLoanerByCase(c.id) : undefined;
    const benefitUsage = store.getBenefitUsage(c.employeeId);

    const { passwordHash: _, ...safeEmployee } = employee ?? { passwordHash: '' };

    return NextResponse.json({
      success: true,
      data: {
        ...c,
        hoursInStage: Math.round(hoursInStage(c.stageEnteredAt) * 10) / 10,
        slaRemainingHours: Math.round(slaRemainingHours(c.stageEnteredAt, c.currentStage, slaConfig) * 10) / 10,
        progressPercent: getProgressPercent(c.type, c.currentStage),
        currentStageLabel: STAGE_LABELS[c.currentStage] ?? c.currentStage,
        currentStageDescription: STAGE_DESCRIPTIONS[c.currentStage] ?? '',
        slaLimitHours: slaConfig[c.currentStage as keyof typeof slaConfig] ?? 24,
        events: events.map((e) => ({
          ...e,
          stageLabel: STAGE_LABELS[e.toStage] ?? e.toStage,
        })),
        employee: safeEmployee,
        tickets,
        loaner,
        benefitUsage,
        orgName: org?.name,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
