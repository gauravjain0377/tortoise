import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { hoursInStage, DEFAULT_SLA_CONFIG, STAGE_LABELS } from '@/lib/stateMachine';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (payload.role !== 'hr_admin') {
      return NextResponse.json({ success: false, error: 'HR Admins only' }, { status: 403 });
    }

    const store = await getStore();
    const org = store.findOrgById(payload.orgId);
    const slaConfig = org?.slaConfig ?? DEFAULT_SLA_CONFIG;

    const breachedCases = store.getBreachedCasesForOrg(payload.orgId);

    const enriched = breachedCases.map((c) => {
      const employee = store.findUserById(c.employeeId);
      const tickets = store.getTicketsForCase(c.id);
      const hrs = hoursInStage(c.stageEnteredAt);
      const slaLimitHours = slaConfig[c.currentStage as keyof typeof slaConfig] ?? 24;

      return {
        ...c,
        currentStageLabel: STAGE_LABELS[c.currentStage] ?? c.currentStage,
        employeeName: employee?.name ?? 'Unknown',
        employeeEmail: employee?.email ?? '',
        employeeDepartment: employee?.department ?? '',
        hoursInStage: Math.round(hrs * 10) / 10,
        slaLimitHours,
        hoursOverdue: Math.round((hrs - slaLimitHours) * 10) / 10,
        openTicketCount: tickets.filter((t) => t.status !== 'resolved').length,
      };
    });

    // Sort by hours overdue (worst first)
    enriched.sort((a, b) => b.hoursOverdue - a.hoursOverdue);

    return NextResponse.json({ success: true, data: enriched });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
