/**
 * In-Memory Data Store — Tortoise Pulse
 *
 * This module is the single source of truth for all data in the prototype.
 * It is seeded once on first import with realistic demo data.
 * All mutations go through the exported helper functions.
 *
 * In production: replace with MongoDB/Postgres queries.
 * The API layer above this file would not need to change.
 */

import bcrypt from 'bcryptjs';
import type {
  Organization,
  User,
  Case,
  CaseEvent,
  Ticket,
  LoanerDevice,
  BenefitUsage,
  Notification,
  CaseStage,
  CaseType,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '@/types';
import { DEFAULT_SLA_CONFIG } from './stateMachine';

// ─── ID Generator ─────────────────────────────────────────────────────────────
let _idCounter = 1000;
export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++_idCounter}`;
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

// ─── Singleton Store ───────────────────────────────────────────────────────────
class Store {
  organizations: Organization[] = [];
  users: User[] = [];
  cases: Case[] = [];
  caseEvents: CaseEvent[] = [];
  tickets: Ticket[] = [];
  loanerDevices: LoanerDevice[] = [];
  benefitUsage: BenefitUsage[] = [];
  notifications: Notification[] = [];

  private seeded = false;

  async seed() {
    if (this.seeded) return;
    this.seeded = true;
    await this._seedOrgs();
    await this._seedUsers();
    this._seedCases();
    this._seedTickets();
    this._seedLoaner();
    this._seedBenefitUsage();
    console.log('[Store] Seeded with demo data');
  }

  // ─── Organizations ────────────────────────────────────────────────────────
  private async _seedOrgs() {
    this.organizations = [
      {
        id: 'org_deloitte',
        name: 'Deloitte India',
        hrmsProvider: 'Darwinbox',
        slaConfig: DEFAULT_SLA_CONFIG,
        createdAt: daysAgo(180),
      },
      {
        id: 'org_paytm',
        name: 'Paytm',
        hrmsProvider: 'Keka',
        slaConfig: { ...DEFAULT_SLA_CONFIG, placed: 12, confirmed: 24 },
        createdAt: daysAgo(120),
      },
      {
        id: 'org_indus',
        name: 'Indus Towers',
        hrmsProvider: 'Zoho People',
        slaConfig: { ...DEFAULT_SLA_CONFIG, in_transit: 48 },
        createdAt: daysAgo(90),
      },
    ];
  }

  // ─── Users ─────────────────────────────────────────────────────────────────
  private async _seedUsers() {
    const hash = await bcrypt.hash('demo123', 10);

    this.users = [
      // ── Deloitte Employees ──────────────────────────────────────────────
      {
        id: 'user_priya',
        name: 'Priya Sharma',
        email: 'priya@deloitte.in',
        passwordHash: hash,
        role: 'employee',
        orgId: 'org_deloitte',
        department: 'Consulting',
        grade: 'Analyst',
        createdAt: daysAgo(150),
      },
      {
        id: 'user_rahul',
        name: 'Rahul Mehta',
        email: 'rahul@deloitte.in',
        passwordHash: hash,
        role: 'employee',
        orgId: 'org_deloitte',
        department: 'Technology',
        grade: 'Senior Analyst',
        createdAt: daysAgo(140),
      },
      {
        id: 'user_aisha',
        name: 'Aisha Khan',
        email: 'aisha@deloitte.in',
        passwordHash: hash,
        role: 'employee',
        orgId: 'org_deloitte',
        department: 'Finance',
        grade: 'Manager',
        createdAt: daysAgo(130),
      },
      {
        id: 'user_vikram',
        name: 'Vikram Singh',
        email: 'vikram@deloitte.in',
        passwordHash: hash,
        role: 'employee',
        orgId: 'org_deloitte',
        department: 'Risk Advisory',
        grade: 'Analyst',
        createdAt: daysAgo(120),
      },
      // ── Paytm Employees ────────────────────────────────────────────────
      {
        id: 'user_sneha',
        name: 'Sneha Patel',
        email: 'sneha@paytm.com',
        passwordHash: hash,
        role: 'employee',
        orgId: 'org_paytm',
        department: 'Product',
        grade: 'Senior',
        createdAt: daysAgo(100),
      },
      {
        id: 'user_arjun',
        name: 'Arjun Nair',
        email: 'arjun@paytm.com',
        passwordHash: hash,
        role: 'employee',
        orgId: 'org_paytm',
        department: 'Engineering',
        grade: 'SDE-2',
        createdAt: daysAgo(95),
      },
      // ── Indus Towers Employees ─────────────────────────────────────────
      {
        id: 'user_deepa',
        name: 'Deepa Reddy',
        email: 'deepa@industowers.com',
        passwordHash: hash,
        role: 'employee',
        orgId: 'org_indus',
        department: 'Operations',
        grade: 'Executive',
        createdAt: daysAgo(80),
      },
      // ── Tortoise Agents ────────────────────────────────────────────────
      {
        id: 'user_agent1',
        name: 'Kavya Iyer',
        email: 'agent@tortoise.pro',
        passwordHash: hash,
        role: 'agent',
        orgId: 'org_tortoise_internal',
        department: 'Customer Success',
        grade: 'Support Agent',
        createdAt: daysAgo(200),
      },
      {
        id: 'user_agent2',
        name: 'Suresh Kumar',
        email: 'agent2@tortoise.pro',
        passwordHash: hash,
        role: 'agent',
        orgId: 'org_tortoise_internal',
        department: 'Customer Success',
        grade: 'Senior Agent',
        createdAt: daysAgo(200),
      },
      // ── HR Admins ───────────────────────────────────────────────────────
      {
        id: 'user_hr_deloitte',
        name: 'Meera Pillai',
        email: 'hr@deloitte.in',
        passwordHash: hash,
        role: 'hr_admin',
        orgId: 'org_deloitte',
        department: 'Human Resources',
        grade: 'HR Manager',
        createdAt: daysAgo(150),
      },
      {
        id: 'user_hr_paytm',
        name: 'Rohan Das',
        email: 'hr@paytm.com',
        passwordHash: hash,
        role: 'hr_admin',
        orgId: 'org_paytm',
        department: 'Human Resources',
        grade: 'HR Lead',
        createdAt: daysAgo(100),
      },
    ];
  }

  // ─── Cases & Events ──────────────────────────────────────────────────────
  private _seedCases() {
    // ── Case 1: Priya — ORDER BREACHED (the "1.5 month" case — main demo case) ──
    const c1: Case = {
      id: 'case_priya_order_1',
      type: 'order',
      employeeId: 'user_priya',
      orgId: 'org_deloitte',
      deviceName: 'iPhone 15 Pro Max 256GB',
      deviceValue: 134900,
      tenureMonths: 24,
      currentStage: 'confirmed',
      stageEnteredAt: daysAgo(46),  // 46 days in "confirmed" — massively breached
      isBreached: true,
      breachedAt: daysAgo(44),
      breachReason: 'supplier_delay',
      createdAt: daysAgo(48),
    };
    this.cases.push(c1);
    this.caseEvents.push(
      { id: 'ev_c1_1', caseId: 'case_priya_order_1', fromStage: null, toStage: 'placed', actor: 'user_priya', actorName: 'Priya Sharma', note: 'Order placed via Tortoise app', createdAt: daysAgo(48) },
      { id: 'ev_c1_2', caseId: 'case_priya_order_1', fromStage: 'placed', toStage: 'confirmed', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', reasonCode: 'supplier_delay', note: 'Order confirmed. Note: supplier has received the order.', createdAt: daysAgo(46) },
    );

    // ── Case 2: Priya — ORDER delivered (healthy case) ──────────────────
    const c2: Case = {
      id: 'case_priya_order_2',
      type: 'order',
      employeeId: 'user_priya',
      orgId: 'org_deloitte',
      deviceName: 'MacBook Pro M3 14"',
      deviceValue: 198900,
      tenureMonths: 36,
      currentStage: 'delivered',
      stageEnteredAt: daysAgo(10),
      isBreached: false,
      createdAt: daysAgo(30),
    };
    this.cases.push(c2);
    this.caseEvents.push(
      { id: 'ev_c2_1', caseId: 'case_priya_order_2', fromStage: null, toStage: 'placed', actor: 'user_priya', actorName: 'Priya Sharma', createdAt: daysAgo(30) },
      { id: 'ev_c2_2', caseId: 'case_priya_order_2', fromStage: 'placed', toStage: 'confirmed', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', createdAt: daysAgo(29) },
      { id: 'ev_c2_3', caseId: 'case_priya_order_2', fromStage: 'confirmed', toStage: 'sourced', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', createdAt: daysAgo(27) },
      { id: 'ev_c2_4', caseId: 'case_priya_order_2', fromStage: 'sourced', toStage: 'dispatched', actor: 'system', actorName: 'Tortoise System', note: 'Blue Dart AWB: BD120394821', createdAt: daysAgo(25) },
      { id: 'ev_c2_5', caseId: 'case_priya_order_2', fromStage: 'dispatched', toStage: 'in_transit', actor: 'system', actorName: 'Tortoise System', createdAt: daysAgo(23) },
      { id: 'ev_c2_6', caseId: 'case_priya_order_2', fromStage: 'in_transit', toStage: 'delivered', actor: 'system', actorName: 'Tortoise System', note: 'Signed for by Priya Sharma', createdAt: daysAgo(10) },
    );

    // ── Case 3: Priya — REPAIR (pickup scheduled, breached) ─────────────
    const c3: Case = {
      id: 'case_priya_repair_1',
      type: 'repair',
      employeeId: 'user_priya',
      orgId: 'org_deloitte',
      deviceName: 'MacBook Pro M3 14"',
      deviceValue: 198900,
      currentStage: 'at_service_center',
      stageEnteredAt: daysAgo(5),
      isBreached: false,
      createdAt: daysAgo(7),
      loanerDeviceId: 'loaner_1',
    };
    this.cases.push(c3);
    this.caseEvents.push(
      { id: 'ev_c3_1', caseId: 'case_priya_repair_1', fromStage: null, toStage: 'pickup_scheduled', actor: 'user_priya', actorName: 'Priya Sharma', note: 'Accidental damage — cracked screen', createdAt: daysAgo(7) },
      { id: 'ev_c3_2', caseId: 'case_priya_repair_1', fromStage: 'pickup_scheduled', toStage: 'picked_up', actor: 'user_agent2', actorName: 'Suresh Kumar (Agent)', note: 'Technician: Ravi M. | Pickup: Koramangala, Bangalore', createdAt: daysAgo(6) },
      { id: 'ev_c3_3', caseId: 'case_priya_repair_1', fromStage: 'picked_up', toStage: 'at_service_center', actor: 'user_agent2', actorName: 'Suresh Kumar (Agent)', note: 'At Apple Authorized Service Center, Whitefield', createdAt: daysAgo(5) },
    );

    // ── Case 4: Rahul — ORDER IN TRANSIT (healthy) ──────────────────────
    const c4: Case = {
      id: 'case_rahul_order_1',
      type: 'order',
      employeeId: 'user_rahul',
      orgId: 'org_deloitte',
      deviceName: 'Samsung Galaxy S24 Ultra',
      deviceValue: 129999,
      tenureMonths: 24,
      currentStage: 'in_transit',
      stageEnteredAt: hoursAgo(18),
      isBreached: false,
      createdAt: daysAgo(7),
    };
    this.cases.push(c4);
    this.caseEvents.push(
      { id: 'ev_c4_1', caseId: 'case_rahul_order_1', fromStage: null, toStage: 'placed', actor: 'user_rahul', actorName: 'Rahul Mehta', createdAt: daysAgo(7) },
      { id: 'ev_c4_2', caseId: 'case_rahul_order_1', fromStage: 'placed', toStage: 'confirmed', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', createdAt: daysAgo(6) },
      { id: 'ev_c4_3', caseId: 'case_rahul_order_1', fromStage: 'confirmed', toStage: 'sourced', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', createdAt: daysAgo(4) },
      { id: 'ev_c4_4', caseId: 'case_rahul_order_1', fromStage: 'sourced', toStage: 'dispatched', actor: 'system', actorName: 'Tortoise System', note: 'DTDC AWB: DTDC889921003', createdAt: daysAgo(2) },
      { id: 'ev_c4_5', caseId: 'case_rahul_order_1', fromStage: 'dispatched', toStage: 'in_transit', actor: 'system', actorName: 'Tortoise System', createdAt: hoursAgo(18) },
    );

    // ── Case 5: Aisha — ORDER BREACHED at "sourced" ──────────────────────
    const c5: Case = {
      id: 'case_aisha_order_1',
      type: 'order',
      employeeId: 'user_aisha',
      orgId: 'org_deloitte',
      deviceName: 'Dell XPS 15 i7',
      deviceValue: 149000,
      tenureMonths: 36,
      currentStage: 'sourced',
      stageEnteredAt: daysAgo(14),  // 14 days in "sourced" — SLA is 1 day
      isBreached: true,
      breachedAt: daysAgo(13),
      breachReason: 'logistics_hold',
      createdAt: daysAgo(16),
    };
    this.cases.push(c5);
    this.caseEvents.push(
      { id: 'ev_c5_1', caseId: 'case_aisha_order_1', fromStage: null, toStage: 'placed', actor: 'user_aisha', actorName: 'Aisha Khan', createdAt: daysAgo(16) },
      { id: 'ev_c5_2', caseId: 'case_aisha_order_1', fromStage: 'placed', toStage: 'confirmed', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', createdAt: daysAgo(15) },
      { id: 'ev_c5_3', caseId: 'case_aisha_order_1', fromStage: 'confirmed', toStage: 'sourced', actor: 'user_agent2', actorName: 'Suresh Kumar (Agent)', reasonCode: 'logistics_hold', note: '⚠️ Logistics hold at warehouse. Escalated to supplier.', createdAt: daysAgo(14) },
    );

    // ── Case 6: Vikram — ORDER just placed ──────────────────────────────
    const c6: Case = {
      id: 'case_vikram_order_1',
      type: 'order',
      employeeId: 'user_vikram',
      orgId: 'org_deloitte',
      deviceName: 'OnePlus 12 256GB',
      deviceValue: 64999,
      tenureMonths: 12,
      currentStage: 'placed',
      stageEnteredAt: hoursAgo(4),
      isBreached: false,
      createdAt: hoursAgo(4),
    };
    this.cases.push(c6);
    this.caseEvents.push(
      { id: 'ev_c6_1', caseId: 'case_vikram_order_1', fromStage: null, toStage: 'placed', actor: 'user_vikram', actorName: 'Vikram Singh', note: 'Order placed via Tortoise app', createdAt: hoursAgo(4) },
    );

    // ── Case 7: Sneha (Paytm) — ORDER BREACHED ──────────────────────────
    const c7: Case = {
      id: 'case_sneha_order_1',
      type: 'order',
      employeeId: 'user_sneha',
      orgId: 'org_paytm',
      deviceName: 'iPhone 15 128GB',
      deviceValue: 79900,
      tenureMonths: 24,
      currentStage: 'confirmed',
      stageEnteredAt: daysAgo(18),
      isBreached: true,
      breachedAt: daysAgo(17),
      breachReason: 'supplier_delay',
      createdAt: daysAgo(20),
    };
    this.cases.push(c7);
    this.caseEvents.push(
      { id: 'ev_c7_1', caseId: 'case_sneha_order_1', fromStage: null, toStage: 'placed', actor: 'user_sneha', actorName: 'Sneha Patel', createdAt: daysAgo(20) },
      { id: 'ev_c7_2', caseId: 'case_sneha_order_1', fromStage: 'placed', toStage: 'confirmed', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', createdAt: daysAgo(18) },
    );

    // ── Case 8: Arjun (Paytm) — REPAIR delivered ────────────────────────
    const c8: Case = {
      id: 'case_arjun_repair_1',
      type: 'repair',
      employeeId: 'user_arjun',
      orgId: 'org_paytm',
      deviceName: 'Samsung Galaxy S23',
      deviceValue: 74999,
      currentStage: 'delivered',
      stageEnteredAt: daysAgo(2),
      isBreached: false,
      createdAt: daysAgo(12),
    };
    this.cases.push(c8);
    this.caseEvents.push(
      { id: 'ev_c8_1', caseId: 'case_arjun_repair_1', fromStage: null, toStage: 'pickup_scheduled', actor: 'user_arjun', actorName: 'Arjun Nair', note: 'Water damage', createdAt: daysAgo(12) },
      { id: 'ev_c8_2', caseId: 'case_arjun_repair_1', fromStage: 'pickup_scheduled', toStage: 'picked_up', actor: 'user_agent2', actorName: 'Suresh Kumar (Agent)', createdAt: daysAgo(11) },
      { id: 'ev_c8_3', caseId: 'case_arjun_repair_1', fromStage: 'picked_up', toStage: 'at_service_center', actor: 'user_agent2', actorName: 'Suresh Kumar (Agent)', createdAt: daysAgo(10) },
      { id: 'ev_c8_4', caseId: 'case_arjun_repair_1', fromStage: 'at_service_center', toStage: 'repaired', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', note: 'Motherboard replaced', createdAt: daysAgo(5) },
      { id: 'ev_c8_5', caseId: 'case_arjun_repair_1', fromStage: 'repaired', toStage: 'dispatched_back', actor: 'system', actorName: 'Tortoise System', createdAt: daysAgo(4) },
      { id: 'ev_c8_6', caseId: 'case_arjun_repair_1', fromStage: 'dispatched_back', toStage: 'delivered', actor: 'system', actorName: 'Tortoise System', note: 'Repair complete. Device returned.', createdAt: daysAgo(2) },
    );

    // ── Case 9: Deepa (Indus Towers) — ORDER BREACHED ───────────────────
    const c9: Case = {
      id: 'case_deepa_order_1',
      type: 'order',
      employeeId: 'user_deepa',
      orgId: 'org_indus',
      deviceName: 'Lenovo ThinkPad E15',
      deviceValue: 85000,
      tenureMonths: 36,
      currentStage: 'dispatched',
      stageEnteredAt: daysAgo(8),
      isBreached: true,
      breachedAt: daysAgo(7),
      breachReason: 'logistics_hold',
      createdAt: daysAgo(22),
    };
    this.cases.push(c9);
    this.caseEvents.push(
      { id: 'ev_c9_1', caseId: 'case_deepa_order_1', fromStage: null, toStage: 'placed', actor: 'user_deepa', actorName: 'Deepa Reddy', createdAt: daysAgo(22) },
      { id: 'ev_c9_2', caseId: 'case_deepa_order_1', fromStage: 'placed', toStage: 'confirmed', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', createdAt: daysAgo(20) },
      { id: 'ev_c9_3', caseId: 'case_deepa_order_1', fromStage: 'confirmed', toStage: 'sourced', actor: 'user_agent1', actorName: 'Kavya Iyer (Agent)', createdAt: daysAgo(16) },
      { id: 'ev_c9_4', caseId: 'case_deepa_order_1', fromStage: 'sourced', toStage: 'dispatched', actor: 'system', actorName: 'Tortoise System', note: 'FedEx AWB: FX9912881', createdAt: daysAgo(8) },
    );
  }

  // ─── Tickets ──────────────────────────────────────────────────────────────
  private _seedTickets() {
    this.tickets = [
      {
        id: 'ticket_1',
        caseId: 'case_priya_order_1',
        employeeId: 'user_priya',
        orgId: 'org_deloitte',
        subject: 'Order stuck for 6 weeks — no update at all',
        description: 'I placed an order for an iPhone 15 Pro Max 6 weeks ago. The app has been showing "supplier has received the order" for the entire time. I have tried WhatsApp and calling but no one is responding. This is very frustrating. Please tell me what is happening.',
        category: 'order-stuck',
        priority: 'critical',
        status: 'in_progress',
        assignedAgentId: 'user_agent1',
        slaDeadlineHours: 4,
        slaDeadlineAt: daysAgo(44),
        isSlaBreached: true,
        aiConfidence: 0.92,
        aiUsed: true,
        createdAt: daysAgo(45),
      },
      {
        id: 'ticket_2',
        caseId: 'case_aisha_order_1',
        employeeId: 'user_aisha',
        orgId: 'org_deloitte',
        subject: 'Why is my Dell laptop order delayed?',
        description: 'My order for the Dell XPS 15 has been in "sourced" status for 2 weeks. No one told me why. The EMI is already being deducted from my salary but I still don\'t have the device.',
        category: 'order-stuck',
        priority: 'high',
        status: 'open',
        slaDeadlineHours: 4,
        slaDeadlineAt: daysAgo(12),
        isSlaBreached: true,
        aiConfidence: 0.88,
        aiUsed: true,
        createdAt: daysAgo(13),
      },
      {
        id: 'ticket_3',
        caseId: 'case_sneha_order_1',
        employeeId: 'user_sneha',
        orgId: 'org_paytm',
        subject: 'No response for 2 weeks after order confirmation',
        description: 'My iPhone 15 order was confirmed 18 days ago but there\'s been no update since. I\'ve raised this with HR too. Can someone please provide an update?',
        category: 'order-stuck',
        priority: 'high',
        status: 'open',
        slaDeadlineHours: 4,
        slaDeadlineAt: daysAgo(16),
        isSlaBreached: true,
        aiConfidence: 0.85,
        aiUsed: true,
        createdAt: daysAgo(17),
      },
      {
        id: 'ticket_4',
        caseId: 'case_rahul_order_1',
        employeeId: 'user_rahul',
        orgId: 'org_deloitte',
        subject: 'Tracking information for Galaxy S24 order',
        description: 'My order is in transit but I can\'t find the courier tracking number anywhere in the app. Could you share the tracking ID?',
        category: 'general',
        priority: 'low',
        status: 'resolved',
        assignedAgentId: 'user_agent2',
        slaDeadlineHours: 24,
        slaDeadlineAt: hoursAgo(10),
        isSlaBreached: false,
        aiConfidence: 0.71,
        aiUsed: true,
        response: 'Hi Rahul, your DTDC tracking number is DTDC889921003. You can track at dtdc.com. Expected delivery is tomorrow.',
        createdAt: daysAgo(1),
        resolvedAt: hoursAgo(10),
      },
    ];
  }

  // ─── Loaner Devices ────────────────────────────────────────────────────────
  private _seedLoaner() {
    this.loanerDevices = [
      {
        id: 'loaner_1',
        repairCaseId: 'case_priya_repair_1',
        deviceTag: 'TRT-LNR-0042',
        deviceName: 'MacBook Pro M2 13" (Loaner)',
        issuedAt: daysAgo(6),
      },
    ];
  }

  // ─── Benefit Usage ─────────────────────────────────────────────────────────
  private _seedBenefitUsage() {
    this.benefitUsage = [
      {
        id: 'bu_priya',
        employeeId: 'user_priya',
        policyYear: new Date().getFullYear(),
        freeRepairsUsed: 1,
        freeRepairsCap: 2,
      },
      {
        id: 'bu_arjun',
        employeeId: 'user_arjun',
        policyYear: new Date().getFullYear(),
        freeRepairsUsed: 2,
        freeRepairsCap: 2,
      },
      {
        id: 'bu_rahul',
        employeeId: 'user_rahul',
        policyYear: new Date().getFullYear(),
        freeRepairsUsed: 0,
        freeRepairsCap: 2,
      },
    ];
  }

  // ─── Lookup Helpers ────────────────────────────────────────────────────────
  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findOrgById(id: string): Organization | undefined {
    return this.organizations.find((o) => o.id === id);
  }

  findCaseById(id: string): Case | undefined {
    return this.cases.find((c) => c.id === id);
  }

  getCasesForEmployee(employeeId: string): Case[] {
    return this.cases.filter((c) => c.employeeId === employeeId);
  }

  getCasesForOrg(orgId: string): Case[] {
    return this.cases.filter((c) => c.orgId === orgId);
  }

  getEventsForCase(caseId: string): CaseEvent[] {
    return this.caseEvents
      .filter((e) => e.caseId === caseId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getBreachedCasesForOrg(orgId: string): Case[] {
    return this.cases.filter((c) => c.orgId === orgId && c.isBreached && c.currentStage !== 'delivered');
  }

  getTicketsForCase(caseId: string): Ticket[] {
    return this.tickets.filter((t) => t.caseId === caseId);
  }

  getTicketById(id: string): Ticket | undefined {
    return this.tickets.find((t) => t.id === id);
  }

  getOpenTicketsForOrg(orgId: string): Ticket[] {
    return this.tickets.filter((t) => t.orgId === orgId && t.status !== 'resolved');
  }

  getLoanerByCase(repairCaseId: string): LoanerDevice | undefined {
    return this.loanerDevices.find((l) => l.repairCaseId === repairCaseId);
  }

  getBenefitUsage(employeeId: string): BenefitUsage | undefined {
    const year = new Date().getFullYear();
    return this.benefitUsage.find((b) => b.employeeId === employeeId && b.policyYear === year);
  }

  getNotificationsForUser(userId: string): Notification[] {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  // ─── Mutation Helpers ────────────────────────────────────────────────────
  addCaseEvent(event: CaseEvent): void {
    this.caseEvents.push(event);
  }

  updateCase(id: string, updates: Partial<Case>): Case | undefined {
    const idx = this.cases.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.cases[idx] = { ...this.cases[idx], ...updates };
    return this.cases[idx];
  }

  addTicket(ticket: Ticket): void {
    this.tickets.push(ticket);
  }

  updateTicket(id: string, updates: Partial<Ticket>): Ticket | undefined {
    const idx = this.tickets.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.tickets[idx] = { ...this.tickets[idx], ...updates };
    return this.tickets[idx];
  }

  addNotification(notification: Notification): void {
    this.notifications.push(notification);
  }

  markNotificationRead(id: string, userId: string): boolean {
    const n = this.notifications.find((n) => n.id === id && n.userId === userId);
    if (!n) return false;
    n.read = true;
    return true;
  }

  // SLA scan — called by the cron job
  runSlaScan(): { scanned: number; newBreaches: number } {
    let newBreaches = 0;
    const activeCases = this.cases.filter((c) => c.currentStage !== 'delivered');

    for (const c of activeCases) {
      const org = this.findOrgById(c.orgId);
      const slaConfig = org?.slaConfig ?? DEFAULT_SLA_CONFIG;
      const limitHours = slaConfig[c.currentStage as keyof typeof slaConfig] ?? 24;
      if (limitHours === 0) continue;

      const hoursInCurrentStage =
        (Date.now() - new Date(c.stageEnteredAt).getTime()) / (1000 * 60 * 60);

      if (hoursInCurrentStage > limitHours && !c.isBreached) {
        this.updateCase(c.id, { isBreached: true, breachedAt: new Date().toISOString() });
        newBreaches++;

        // Notify assigned agent
        const openTicket = this.tickets.find((t) => t.caseId === c.id && t.status !== 'resolved');
        const agentId = openTicket?.assignedAgentId ?? 'user_agent1';

        this.addNotification({
          id: newId('notif'),
          userId: agentId,
          caseId: c.id,
          channel: 'in_app',
          title: '🚨 SLA Breached',
          message: `Case for ${this.findUserById(c.employeeId)?.name ?? 'employee'} has breached SLA at stage "${c.currentStage}".`,
          read: false,
          sentAt: new Date().toISOString(),
        });

        // Notify employee
        this.addNotification({
          id: newId('notif'),
          userId: c.employeeId,
          caseId: c.id,
          channel: 'in_app',
          title: 'Update on your order',
          message: `Your ${c.deviceName} order is taking longer than expected. Our team is working on it. We apologize for the delay.`,
          read: false,
          sentAt: new Date().toISOString(),
        });
      }
    }

    return { scanned: activeCases.length, newBreaches };
  }
}

// Singleton instance
const globalStore = global as typeof global & { _tortoisePulseStore?: Store };
if (!globalStore._tortoisePulseStore) {
  globalStore._tortoisePulseStore = new Store();
}

export const store = globalStore._tortoisePulseStore;

// Ensure seeded before use
export async function getStore(): Promise<Store> {
  await store.seed();
  return store;
}
