import { Types } from 'mongoose';

// ─── Prompt Template Registry ────────────────────────────────────────────────

export interface PromptTemplate {
  key: string;
  version: string;
  model: 'fast' | 'reasoning';
  systemPrompt: string;
  userPromptTemplate: string; // Uses {{variable}} placeholders
  outputSchema: Record<string, unknown>; // JSON Schema for structured output
  maxTokens: number;
  temperature: number;
}

export interface TenantContext {
  tenantId: Types.ObjectId;
  businessName: string;
  category: string;
  city: string;
  services: Array<{ name: string; description: string; price: string }>;
  brandVoice: {
    tone: string;
    languages: string[];
    signatureText: string;
    ctaText: string;
    appointmentLink: string;
  };
  operatingHours?: Record<string, string[]>;
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  'gbp_weekly_post_v1': {
    key: 'gbp_weekly_post',
    version: '1.0.0',
    model: 'fast',
    maxTokens: 800,
    temperature: 0.7,
    systemPrompt: `You are an expert local SEO and Google Business Profile content specialist.
You create engaging, compliant GBP posts for local clinics and businesses.

MANDATORY RULES:
1. NEVER make comparative superiority claims ("best", "top-rated", "#1")
2. NEVER guarantee medical outcomes ("cure", "guaranteed results", "permanently fix")
3. NEVER mention any service or price NOT explicitly listed in the provided services catalog
4. ALWAYS include a single clear Call-To-Action
5. Keep posts between 150-300 words for GBP
6. Use friendly, professional tone appropriate to the business
7. Output ONLY valid JSON matching the schema provided`,
    userPromptTemplate: `Generate a Google Business Profile post for this business:

Business: {{businessName}}
Category: {{category}}  
City: {{city}}
Services: {{services}}
Brand Tone: {{tone}}
CTA Text: {{ctaText}}
Appointment Link: {{appointmentLink}}
Topic Focus: {{topicFocus}}

Return JSON with this exact schema:
{
  "body": "post text here",
  "callToActionType": "BOOK|LEARN_MORE|CALL",
  "callToActionUrl": "url or null",
  "suggestedHashtags": ["tag1", "tag2"],
  "topicSummary": "one sentence summary"
}`,
    outputSchema: {
      type: 'object',
      required: ['body', 'callToActionType'],
      properties: {
        body: { type: 'string', minLength: 100, maxLength: 1500 },
        callToActionType: { type: 'string', enum: ['BOOK', 'LEARN_MORE', 'CALL', 'SIGN_UP'] },
        callToActionUrl: { type: ['string', 'null'] },
        suggestedHashtags: { type: 'array', items: { type: 'string' } },
        topicSummary: { type: 'string' },
      },
    },
  },

  'review_reply_positive_v1': {
    key: 'review_reply_positive',
    version: '1.0.0',
    model: 'fast',
    maxTokens: 300,
    temperature: 0.6,
    systemPrompt: `You are a professional patient relations specialist.
You write warm, authentic replies to positive Google reviews on behalf of healthcare clinics.

MANDATORY RULES:
1. Be genuine and personal - reference the review content when possible
2. NEVER make medical claims or diagnosis suggestions
3. NEVER offer discounts or special deals in replies
4. Keep replies between 50-120 words
5. Thank the reviewer by name if available
6. Invite them back naturally
7. Output ONLY valid JSON`,
    userPromptTemplate: `Write a Google review reply for this positive review:

Business: {{businessName}}
Reviewer: {{authorName}}
Rating: {{rating}}/5
Review: {{reviewText}}
Brand Signature: {{signatureText}}

Return JSON:
{
  "replyText": "reply here"
}`,
    outputSchema: {
      type: 'object',
      required: ['replyText'],
      properties: {
        replyText: { type: 'string', minLength: 30, maxLength: 500 },
      },
    },
  },

  'review_reply_negative_v1': {
    key: 'review_reply_negative',
    version: '1.0.0',
    model: 'reasoning', // Use stronger model for sensitive replies
    maxTokens: 400,
    temperature: 0.3, // Lower temperature for more consistent, careful responses
    systemPrompt: `You are a senior patient relations and reputation management specialist.
You write empathetic, de-escalating replies to negative Google reviews.

MANDATORY RULES:
1. Express genuine empathy and take accountability where appropriate
2. NEVER argue, NEVER be defensive, NEVER make excuses
3. NEVER disclose patient medical information
4. NEVER make promises you cannot guarantee
5. Invite the reviewer to contact the clinic privately to resolve
6. Keep replies between 60-120 words
7. Be professional and human at the same time
8. Output ONLY valid JSON`,
    userPromptTemplate: `Write an empathetic Google reply for this negative review:

Business: {{businessName}}
Reviewer: {{authorName}}
Rating: {{rating}}/5
Review: {{reviewText}}
Contact Info for offline resolution: {{contactInfo}}
Brand Signature: {{signatureText}}

Return JSON:
{
  "replyText": "reply here",
  "escalationNeeded": true|false,
  "escalationReason": "reason if escalation needed or null"
}`,
    outputSchema: {
      type: 'object',
      required: ['replyText', 'escalationNeeded'],
      properties: {
        replyText: { type: 'string', minLength: 40, maxLength: 600 },
        escalationNeeded: { type: 'boolean' },
        escalationReason: { type: ['string', 'null'] },
      },
    },
  },

  'whatsapp_winback_v1': {
    key: 'whatsapp_winback',
    version: '1.0.0',
    model: 'fast',
    maxTokens: 400,
    temperature: 0.65,
    systemPrompt: `You are a WhatsApp marketing specialist for local clinics.
You write personalized win-back messages that re-engage patients who haven't visited in 3+ months.

MANDATORY RULES:
1. Be warm and personal, not salesy
2. Mention the time since last visit naturally
3. NEVER create false urgency or fake offers
4. NEVER mention specific medical diagnoses
5. Keep under 160 words
6. The message will be sent as a WhatsApp template with variables
7. Output ONLY valid JSON`,
    userPromptTemplate: `Create a win-back message for this context:

Business: {{businessName}}
Patient Name: {{patientName}}
Months since last visit: {{monthsSinceVisit}}
Services to highlight: {{services}}
CTA: {{ctaText}}
Appointment Link: {{appointmentLink}}

Return JSON matching the template variable structure:
{
  "headerText": "short attention header",
  "bodyText": "personalized message body",
  "ctaButtonText": "button label",
  "templateVariables": { "1": "value1", "2": "value2" }
}`,
    outputSchema: {
      type: 'object',
      required: ['bodyText'],
      properties: {
        headerText: { type: 'string', maxLength: 60 },
        bodyText: { type: 'string', minLength: 30, maxLength: 1024 },
        ctaButtonText: { type: 'string', maxLength: 25 },
        templateVariables: { type: 'object' },
      },
    },
  },

  'gbp_audit_v1': {
    key: 'gbp_audit',
    version: '1.0.0',
    model: 'fast',
    maxTokens: 1000,
    temperature: 0.2,
    systemPrompt: `You are a Google Business Profile optimization expert.
Analyze the provided GBP profile data and generate a concise audit report.
Output ONLY valid JSON.`,
    userPromptTemplate: `Analyze this Google Business Profile and provide top 3 actionable improvements:

Profile Data: {{profileData}}
Current Score: {{score}}/100
Missing Fields: {{missingFields}}

Return JSON:
{
  "topFixes": [
    { "priority": 1, "fix": "action text", "estimatedImpact": "impact description", "effort": "easy|medium|hard" },
    { "priority": 2, "fix": "action text", "estimatedImpact": "impact description", "effort": "easy|medium|hard" },
    { "priority": 3, "fix": "action text", "estimatedImpact": "impact description", "effort": "easy|medium|hard" }
  ],
  "summary": "2-3 sentence overall assessment"
}`,
    outputSchema: {
      type: 'object',
      required: ['topFixes'],
      properties: {
        topFixes: { type: 'array', minItems: 1, maxItems: 3 },
        summary: { type: 'string' },
      },
    },
  },
};
