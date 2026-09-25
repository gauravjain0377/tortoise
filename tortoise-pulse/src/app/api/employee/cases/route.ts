import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { hoursInStage, slaRemainingHours, DEFAULT_SLA_CONFIG } from '@/lib/stateMachine';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (payload.role !== 'employee') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const store = await getStore();
    const cases = store.getCasesForEmployee(payload.userId);
    const org = store.findOrgById(payload.orgId);
    const slaConfig = org?.slaConfig ?? DEFAULT_SLA_CONFIG;

    const enriched = cases.map((c) => {
      const hrs = hoursInStage(c.stageEnteredAt);
      const remaining = slaRemainingHours(c.stageEnteredAt, c.currentStage, slaConfig);
      const tickets = store.getTicketsForCase(c.id);
      return {
        ...c,
        hoursInStage: Math.round(hrs * 10) / 10,
        slaRemainingHours: Math.round(remaining * 10) / 10,
        openTicketCount: tickets.filter((t) => t.status !== 'resolved').length,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
