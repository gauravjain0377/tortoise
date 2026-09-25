import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { hoursInStage, slaRemainingHours, DEFAULT_SLA_CONFIG } from '@/lib/stateMachine';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (payload.role !== 'agent') {
      return NextResponse.json({ success: false, error: 'Agents only' }, { status: 403 });
    }

    const store = await getStore();
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter');

    // Agents see all active cases across all orgs
    let cases = store.cases.filter((c) => c.currentStage !== 'delivered');

    if (filter === 'breached') {
      cases = cases.filter((c) => c.isBreached);
    }

    const enriched = cases.map((c) => {
      const org = store.findOrgById(c.orgId);
      const slaConfig = org?.slaConfig ?? DEFAULT_SLA_CONFIG;
      const employee = store.findUserById(c.employeeId);
      const tickets = store.getTicketsForCase(c.id);
      const hrs = hoursInStage(c.stageEnteredAt);
      const slaLimitHours = slaConfig[c.currentStage as keyof typeof slaConfig] ?? 24;
      const remaining = slaRemainingHours(c.stageEnteredAt, c.currentStage, slaConfig);

      return {
        ...c,
        employeeName: employee?.name ?? 'Unknown',
        employeeEmail: employee?.email ?? '',
        orgName: org?.name ?? 'Unknown Org',
        hoursInStage: Math.round(hrs * 10) / 10,
        slaLimitHours,
        slaRemainingHours: Math.round(remaining * 10) / 10,
        openTicketCount: tickets.filter((t) => t.status !== 'resolved').length,
      };
    });

    // Sort: breached first, then by hours in stage descending
    enriched.sort((a, b) => {
      if (a.isBreached && !b.isBreached) return -1;
      if (!a.isBreached && b.isBreached) return 1;
      return b.hoursInStage - a.hoursInStage;
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
