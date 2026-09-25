import type { CaseStage, CaseType, SlaConfig } from '@/types';

// ─── State Machine Definition ────────────────────────────────────────────────

/** Valid stage transitions for ORDER cases */
const ORDER_TRANSITIONS: Record<string, string[]> = {
  placed: ['confirmed'],
  confirmed: ['sourced'],
  sourced: ['dispatched'],
  dispatched: ['in_transit'],
  in_transit: ['delivered'],
  delivered: [],  // terminal
};

/** Valid stage transitions for REPAIR cases */
const REPAIR_TRANSITIONS: Record<string, string[]> = {
  pickup_scheduled: ['picked_up'],
  picked_up: ['at_service_center'],
  at_service_center: ['repaired'],
  repaired: ['dispatched_back'],
  dispatched_back: ['delivered'],
  delivered: [],  // terminal
};

/** Human-readable label for each stage */
export const STAGE_LABELS: Record<string, string> = {
  // Order stages
  placed: 'Order Placed',
  confirmed: 'Confirmed by Tortoise',
  sourced: 'Device Sourced',
  dispatched: 'Dispatched',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  // Repair stages
  pickup_scheduled: 'Pickup Scheduled',
  picked_up: 'Device Picked Up',
  at_service_center: 'At Service Center',
  repaired: 'Repair Complete',
  dispatched_back: 'Return Dispatched',
};

/** Stage description — shown in the employee timeline */
export const STAGE_DESCRIPTIONS: Record<string, string> = {
  placed: 'Your order has been received. We are confirming availability with our supplier.',
  confirmed: 'Your order is confirmed! We are sourcing the device from our verified supplier network.',
  sourced: 'Device has been sourced and is being prepared for dispatch.',
  dispatched: 'Your device has been dispatched from the warehouse. Tracking info will follow.',
  in_transit: 'Your device is on its way! Expected delivery within 2–3 business days.',
  delivered: '✅ Your device has been delivered. Enjoy your new device!',
  pickup_scheduled: 'Repair pickup has been scheduled. Our technician will arrive in the given window.',
  picked_up: 'Your device has been picked up by our service partner.',
  at_service_center: 'Your device is at the authorized service center. Diagnosis is in progress.',
  repaired: 'Repair complete! Your device is being dispatched back to you.',
  dispatched_back: 'Your repaired device is on its way back to you.',
};

/** Order of stages — for progress bar calculation */
export const ORDER_STAGE_ORDER: CaseStage[] = [
  'placed', 'confirmed', 'sourced', 'dispatched', 'in_transit', 'delivered',
];

export const REPAIR_STAGE_ORDER: CaseStage[] = [
  'pickup_scheduled', 'picked_up', 'at_service_center', 'repaired', 'dispatched_back', 'delivered',
];

// ─── Default SLA Config (hours per stage) ────────────────────────────────────
export const DEFAULT_SLA_CONFIG: SlaConfig = {
  // Order SLAs
  placed: 24,        // 1 day to confirm
  confirmed: 48,     // 2 days to source
  sourced: 24,       // 1 day to dispatch
  dispatched: 24,    // 1 day to go in-transit
  in_transit: 72,    // 3 days in transit
  delivered: 0,      // terminal — no SLA
  // Repair SLAs
  pickup_scheduled: 24,      // 1 day to pick up
  picked_up: 4,              // 4 hrs to reach service center
  at_service_center: 48,     // 2 days to repair
  repaired: 8,               // 8 hrs to dispatch back
  dispatched_back: 48,       // 2 days to deliver back
};

// ─── State Machine Functions ──────────────────────────────────────────────────

/** Returns true if transitioning from → to is valid for the given case type */
export function isValidTransition(
  caseType: CaseType,
  from: CaseStage,
  to: CaseStage
): boolean {
  const transitions = caseType === 'order' ? ORDER_TRANSITIONS : REPAIR_TRANSITIONS;
  return (transitions[from] ?? []).includes(to);
}

/** Returns all valid next stages from the current stage */
export function getValidNextStages(
  caseType: CaseType,
  currentStage: CaseStage
): CaseStage[] {
  const transitions = caseType === 'order' ? ORDER_TRANSITIONS : REPAIR_TRANSITIONS;
  return (transitions[currentStage] ?? []) as CaseStage[];
}

/** Returns true if stage is terminal (no further transitions) */
export function isTerminalStage(caseType: CaseType, stage: CaseStage): boolean {
  return getValidNextStages(caseType, stage).length === 0;
}

/** Returns stage index (for progress bars — 0-based) */
export function getStageIndex(caseType: CaseType, stage: CaseStage): number {
  const order = caseType === 'order' ? ORDER_STAGE_ORDER : REPAIR_STAGE_ORDER;
  return order.indexOf(stage);
}

/** Returns total stages count */
export function getTotalStages(caseType: CaseType): number {
  return caseType === 'order' ? ORDER_STAGE_ORDER.length : REPAIR_STAGE_ORDER.length;
}

/** Progress percentage (0–100) */
export function getProgressPercent(caseType: CaseType, stage: CaseStage): number {
  const idx = getStageIndex(caseType, stage);
  const total = getTotalStages(caseType);
  return Math.round(((idx + 1) / total) * 100);
}

/** Compute SLA deadline for a stage */
export function computeSlaDeadline(
  stageEnteredAt: string,
  stage: CaseStage,
  slaConfig: SlaConfig
): Date {
  const enteredMs = new Date(stageEnteredAt).getTime();
  const limitHours = slaConfig[stage as keyof SlaConfig] ?? 24;
  return new Date(enteredMs + limitHours * 60 * 60 * 1000);
}

/** Check if a case's current stage has breached SLA */
export function isSlaBreached(
  stageEnteredAt: string,
  stage: CaseStage,
  slaConfig: SlaConfig
): boolean {
  const slaLimitHours = slaConfig[stage as keyof SlaConfig] ?? 24;
  if (slaLimitHours === 0) return false; // terminal stage, no SLA
  const deadline = computeSlaDeadline(stageEnteredAt, stage, slaConfig);
  return new Date() > deadline;
}

/** Hours elapsed in current stage */
export function hoursInStage(stageEnteredAt: string): number {
  return (Date.now() - new Date(stageEnteredAt).getTime()) / (1000 * 60 * 60);
}

/** Hours remaining until SLA breach (negative = already breached) */
export function slaRemainingHours(
  stageEnteredAt: string,
  stage: CaseStage,
  slaConfig: SlaConfig
): number {
  const deadline = computeSlaDeadline(stageEnteredAt, stage, slaConfig);
  return (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
}

/** Breach reason codes */
export const BREACH_REASON_CODES: Record<string, string> = {
  supplier_delay: 'Supplier Delay',
  logistics_hold: 'Logistics Hold',
  customs_clearance: 'Customs Clearance',
  service_center_backlog: 'Service Center Backlog',
  part_unavailable: 'Part Unavailable',
  escalation_pending: 'Pending Escalation',
  system_update: 'System Update Required',
};
