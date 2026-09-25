import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

// This endpoint is called by a cron job (or can be manually triggered)
// In production, this would be a managed scheduler (EventBridge, Cloud Scheduler)
export async function POST(req: NextRequest) {
  try {
    // Simple shared secret check for internal calls
    const secret = req.headers.get('x-internal-secret');
    if (secret !== (process.env.INTERNAL_SECRET ?? 'tortoise-internal')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const store = await getStore();
    const result = store.runSlaScan();

    return NextResponse.json({
      success: true,
      data: result,
      message: `SLA scan complete: ${result.scanned} cases scanned, ${result.newBreaches} new breaches detected`,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
