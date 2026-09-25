// ─── Roles ────────────────────────────────────────────────────────────────────
export type Role = 'employee' | 'agent' | 'hr_admin';

// ─── Organizations ─────────────────────────────────────────────────────────────
export interface SlaConfig {
  placed: number;       // hours
  confirmed: number;
  sourced: number;
  dispatched: number;
  in_transit: number;
  delivered: number;
  // repair stages
  pickup_scheduled: number;
  picked_up: number;
  at_service_center: number;
  repaired: number;
  dispatched_back: number;
}

export interface Organization {
  id: string;
  name: string;
  hrmsProvider: string;
  slaConfig: SlaConfig;
  createdAt: string;
}

// ─── Users ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  orgId: string;
  department: string;
  grade: string;
  createdAt: string;
}

export interface SafeUser extends Omit<User, 'passwordHash'> {}

// ─── Cases (Orders + Repairs) ───────────────────────────────────────────────
export type CaseType = 'order' | 'repair';

export type OrderStage =
  | 'placed'
  | 'confirmed'
  | 'sourced'
  | 'dispatched'
  | 'in_transit'
  | 'delivered';

export type RepairStage =
  | 'pickup_scheduled'
  | 'picked_up'
  | 'at_service_center'
  | 'repaired'
  | 'dispatched_back'
  | 'delivered';

export type CaseStage = OrderStage | RepairStage;

export interface Case {
  id: string;
  type: CaseType;
  employeeId: string;
  orgId: string;
  deviceName: string;
  deviceValue: number;
  tenureMonths?: number;
  currentStage: CaseStage;
  stageEnteredAt: string;  // ISO timestamp
  isBreached: boolean;
  breachedAt?: string;
  breachReason?: string;
  createdAt: string;
  resolvedAt?: string;
  // Repair-specific
  loanerDeviceId?: string;
}

// ─── Case Events (Immutable Append-Only Log) ───────────────────────────────
export interface CaseEvent {
  id: string;
  caseId: string;
  fromStage: CaseStage | null;
  toStage: CaseStage;
  actor: string;   // user ID or 'system'
  actorName: string;
  reasonCode?: string;
  note?: string;
  createdAt: string;
}

// ─── Tickets ────────────────────────────────────────────────────────────────
export type TicketCategory =
  | 'order-stuck'
  | 'repair-overdue'
  | 'billing-dispute'
  | 'device-issue'
  | 'general';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface Ticket {
  id: string;
  caseId: string;
  employeeId: string;
  orgId: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId?: string;
  slaDeadlineHours: number;
  slaDeadlineAt: string;
  isSlaBreached: boolean;
  aiConfidence?: number;
  aiUsed: boolean;
  response?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ─── Loaner Devices ─────────────────────────────────────────────────────────
export interface LoanerDevice {
  id: string;
  repairCaseId: string;
  deviceTag: string;
  deviceName: string;
  issuedAt: string;
  returnedAt?: string;
}

// ─── Benefit Usage ──────────────────────────────────────────────────────────
export interface BenefitUsage {
  id: string;
  employeeId: string;
  policyYear: number;
  freeRepairsUsed: number;
  freeRepairsCap: number;
}

// ─── Notifications ──────────────────────────────────────────────────────────
export type NotificationChannel = 'in_app' | 'email' | 'whatsapp';

export interface Notification {
  id: string;
  userId: string;
  caseId?: string;
  ticketId?: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  read: boolean;
  sentAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  role: Role;
  orgId: string;
}

export interface LoginResponse {
  token: string;
  user: SafeUser;
}

// ─── AI Triage ───────────────────────────────────────────────────────────────
export interface TriageResult {
  category: TicketCategory;
  suggestedPriority: TicketPriority;
  confidence: number;
  method: 'ai' | 'rule_based' | 'mock';
  reasoning?: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Dashboard Types ─────────────────────────────────────────────────────────
export interface HrSummary {
  orgName: string;
  totalEmployees: number;
  activeOrders: number;
  activeRepairs: number;
  adoptionRate: number;
  avgFulfilmentHours: number;
  openBreaches: number;
  breachRate: number;
  openTickets: number;
  resolvedThisWeek: number;
  trendData: TrendPoint[];
}

export interface TrendPoint {
  date: string;
  orders: number;
  breaches: number;
}

export interface AgentQueueItem extends Case {
  employeeName: string;
  employeeEmail: string;
  orgName: string;
  hoursInStage: number;
  slaLimitHours: number;
  slaRemainingHours: number;
  openTicketCount: number;
}

export interface CaseWithTimeline extends Case {
  events: CaseEvent[];
  employee: SafeUser;
  ticket?: Ticket;
  loaner?: LoanerDevice;
  benefitUsage?: BenefitUsage;
}
