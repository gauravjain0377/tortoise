import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    const store = await getStore();
    const usage = store.getBenefitUsage(payload.userId);

    return NextResponse.json({
      success: true,
      data: usage ?? {
        employeeId: payload.userId,
        policyYear: new Date().getFullYear(),
        freeRepairsUsed: 0,
        freeRepairsCap: 2,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
