import type { TriageResult, TicketCategory, TicketPriority } from '@/types';

// ─── Rule-Based Classifier ────────────────────────────────────────────────────

interface RuleSet {
  keywords: string[];
  category: TicketCategory;
  priority: TicketPriority;
}

const RULES: RuleSet[] = [
  {
    keywords: ['stuck', 'no update', 'no response', 'weeks', 'months', 'not delivered', 'where is', 'status'],
    category: 'order-stuck',
    priority: 'high',
  },
  {
    keywords: ['repair', 'overdue', 'pickup', 'service center', 'not returned', 'loaner', 'broken', 'damage'],
    category: 'repair-overdue',
    priority: 'high',
  },
  {
    keywords: ['billing', 'deduction', 'salary', 'charged', 'wrong amount', 'refund', 'emi', 'payment'],
    category: 'billing-dispute',
    priority: 'critical',
  },
  {
    keywords: ['defective', 'not working', 'malfunction', 'crash', 'dead', 'screen', 'battery', 'performance'],
    category: 'device-issue',
    priority: 'medium',
  },
];

export function ruleBasedTriage(subject: string, description: string): TriageResult {
  const text = `${subject} ${description}`.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return {
        category: rule.category,
        suggestedPriority: rule.priority,
        confidence: 0.75,
        method: 'rule_based',
        reasoning: `Matched keywords for "${rule.category}"`,
      };
    }
  }

  return {
    category: 'general',
    suggestedPriority: 'medium',
    confidence: 0.5,
    method: 'rule_based',
    reasoning: 'No specific keywords matched — classified as general inquiry',
  };
}

// ─── Mock AI Responses ────────────────────────────────────────────────────────

const MOCK_RESPONSES: TriageResult[] = [
  {
    category: 'order-stuck',
    suggestedPriority: 'high',
    confidence: 0.92,
    method: 'mock',
    reasoning: 'Ticket describes an order with no status update for an extended period, indicating a fulfillment bottleneck.',
  },
  {
    category: 'repair-overdue',
    suggestedPriority: 'high',
    confidence: 0.88,
    method: 'mock',
    reasoning: 'Employee is waiting for device return post-repair, exceeding standard SLA window.',
  },
  {
    category: 'billing-dispute',
    suggestedPriority: 'critical',
    confidence: 0.95,
    method: 'mock',
    reasoning: 'Financial discrepancy in payroll deduction — requires immediate finance team review.',
  },
  {
    category: 'device-issue',
    suggestedPriority: 'medium',
    confidence: 0.84,
    method: 'mock',
    reasoning: 'Device performance issue reported — likely eligible for repair under Corporate Care coverage.',
  },
  {
    category: 'general',
    suggestedPriority: 'low',
    confidence: 0.70,
    method: 'mock',
    reasoning: 'General inquiry about device benefits or eligibility — can be handled via standard support.',
  },
];

// ─── Groq AI Triage ───────────────────────────────────────────────────────────

async function groqTriage(
  subject: string,
  description: string,
  caseStage: string
): Promise<TriageResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const prompt = `You are a support ticket classifier for Tortoise, an employee device benefits platform in India.
A support ticket has been raised. Classify it into one of these categories and suggest a priority.

Categories:
- order-stuck: Order placed but no delivery update, status frozen, fulfilment issues
- repair-overdue: Repair/pickup overdue, loaner not received, service center delay
- billing-dispute: Wrong EMI deduction, salary issue, refund request, payment problem
- device-issue: Device not working, defective, performance issue, physical damage
- general: Any other query about eligibility, policy, benefits, account

Priorities: low, medium, high, critical

Ticket Subject: ${subject}
Ticket Description: ${description}
Current Case Stage: ${caseStage}

Respond with ONLY valid JSON in this exact format:
{
  "category": "<category>",
  "suggestedPriority": "<priority>",
  "confidence": <0.0-1.0>,
  "reasoning": "<one sentence explanation>"
}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = data.choices[0]?.message?.content;

  if (!content) throw new Error('Empty response from Groq');

  const parsed = JSON.parse(content) as {
    category: TicketCategory;
    suggestedPriority: TicketPriority;
    confidence: number;
    reasoning: string;
  };

  // Validate category and priority
  const validCategories: TicketCategory[] = ['order-stuck', 'repair-overdue', 'billing-dispute', 'device-issue', 'general'];
  const validPriorities: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

  return {
    category: validCategories.includes(parsed.category) ? parsed.category : 'general',
    suggestedPriority: validPriorities.includes(parsed.suggestedPriority) ? parsed.suggestedPriority : 'medium',
    confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.8,
    method: 'ai',
    reasoning: parsed.reasoning ?? '',
  };
}

// ─── Main Triage Function (with fallback chain) ───────────────────────────────

export async function triageTicket(
  subject: string,
  description: string,
  caseStage: string
): Promise<TriageResult> {
  const useMock = process.env.MOCK_AI === 'true' || !process.env.GROQ_API_KEY;

  // 1. Mock mode — realistic responses with a small delay
  if (useMock) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const text = `${subject} ${description}`.toLowerCase();
    if (text.includes('stuck') || text.includes('no update') || text.includes('weeks') || text.includes('months')) {
      return MOCK_RESPONSES[0];
    }
    if (text.includes('repair') || text.includes('loaner') || text.includes('pickup')) {
      return MOCK_RESPONSES[1];
    }
    if (text.includes('billing') || text.includes('salary') || text.includes('deduction') || text.includes('charged')) {
      return MOCK_RESPONSES[2];
    }
    if (text.includes('broken') || text.includes('defect') || text.includes('not working')) {
      return MOCK_RESPONSES[3];
    }
    return MOCK_RESPONSES[4];
  }

  // 2. Try Groq AI
  try {
    return await groqTriage(subject, description, caseStage);
  } catch (err) {
    console.warn('[Triage] Groq API failed, falling back to rule-based:', err);
  }

  // 3. Rule-based fallback — always works
  return ruleBasedTriage(subject, description);
}

/** SLA hours per ticket category */
export const TICKET_SLA_HOURS: Record<string, number> = {
  'order-stuck': 4,
  'repair-overdue': 6,
  'billing-dispute': 2,
  'device-issue': 8,
  'general': 24,
};
