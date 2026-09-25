import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { DEFAULT_SLA_CONFIG } from '@/lib/stateMachine';

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

    const orgCases = store.getCasesForOrg(payload.orgId);
    const orgEmployees = store.users.filter((u) => u.orgId === payload.orgId && u.role === 'employee');
    const openTickets = store.getOpenTicketsForOrg(payload.orgId);
    const breachedCases = orgCases.filter((c) => c.isBreached && c.currentStage !== 'delivered');

    const deliveredCases = orgCases.filter((c) => c.currentStage === 'delivered');
    const totalActiveCases = orgCases.filter((c) => c.currentStage !== 'delivered');

    // Average fulfilment time (only for delivered cases)
    let avgFulfilmentHours = 0;
    if (deliveredCases.length > 0) {
      const totalHours = deliveredCases.reduce((sum, c) => {
        return sum + (new Date(c.stageEnteredAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
      }, 0);
      avgFulfilmentHours = Math.round(totalHours / deliveredCases.length);
    }

    const adoptionRate = orgEmployees.length > 0
      ? Math.round((orgCases.length / orgEmployees.length) * 100)
      : 0;

    const breachRate = totalActiveCases.length > 0
      ? Math.round((breachedCases.length / totalActiveCases.length) * 100)
      : 0;

    const resolvedThisWeek = store.tickets.filter((t) => {
      if (t.orgId !== payload.orgId || t.status !== 'resolved' || !t.resolvedAt) return false;
      return new Date(t.resolvedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
    }).length;

    // Trend data — last 7 days
    const trendData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const dayOrders = orgCases.filter((c) => c.createdAt.slice(0, 10) === dateStr).length;
      const dayBreaches = orgCases.filter((c) => c.isBreached && c.breachedAt?.slice(0, 10) === dateStr).length;
      return { date: dateStr, orders: dayOrders, breaches: dayBreaches };
    });

    return NextResponse.json({
      success: true,
      data: {
        orgName: org?.name ?? 'Your Organization',
        totalEmployees: orgEmployees.length,
        activeOrders: orgCases.filter((c) => c.type === 'order' && c.currentStage !== 'delivered').length,
        activeRepairs: orgCases.filter((c) => c.type === 'repair' && c.currentStage !== 'delivered').length,
        adoptionRate,
        avgFulfilmentHours,
        openBreaches: breachedCases.length,
        breachRate,
        openTickets: openTickets.length,
        resolvedThisWeek,
        trendData,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
