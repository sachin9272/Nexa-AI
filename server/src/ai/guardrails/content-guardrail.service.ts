import { Injectable, Logger } from '@nestjs/common';

export interface GuardrailResult {
  isValid: boolean;
  violations: string[];
}

// Healthcare-specific banned patterns
const BANNED_CLAIM_PATTERNS: RegExp[] = [
  /\b(best|top-rated|#1|number one|leading|premier|superior)\s+(clinic|doctor|dentist|hospital)\b/gi,
  /\b(guaranteed|100%)\s+(results?|cure|success|treatment)\b/gi,
  /\bpermanently\s+(cure|fix|heal|eliminate)\b/gi,
  /\b(no side effects|completely safe)\b/gi,
  /\bFDA\s+approved\b/gi, // unless verified
  /\bcured?\s+(cancer|diabetes|arthritis|fibromyalgia)\b/gi,
  /\bmiracl(e|ulous)\b/gi,
];

const BANNED_MEDICAL_DIAGNOSES_IN_REPLY: RegExp[] = [
  /\byour\s+(condition|diagnosis|disease|ailment)\b/gi,
  /\byou\s+(have|suffer from|are experiencing)\b/gi,
  /\bmedical\s+(advice|recommendation)\b/gi,
];

@Injectable()
export class ContentGuardrailService {
  private readonly logger = new Logger(ContentGuardrailService.name);

  validateGbpPost(content: string, servicesCatalog: string[]): GuardrailResult {
    const violations: string[] = [];

    // 1. Check banned claim patterns
    for (const pattern of BANNED_CLAIM_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`Banned claim detected: matches pattern "${pattern.source}"`);
      }
    }

    // 2. Length validation
    if (content.length > 1500) {
      violations.push(`Post exceeds 1500 characters (${content.length} chars)`);
    }
    if (content.length < 50) {
      violations.push('Post is too short (minimum 50 characters)');
    }

    // 3. Validate no invented services (if catalog provided)
    if (servicesCatalog.length > 0) {
      this.checkInventedServices(content, servicesCatalog, violations);
    }

    if (violations.length > 0) {
      this.logger.warn(`GBP Post guardrail violations: ${violations.join('; ')}`);
    }

    return { isValid: violations.length === 0, violations };
  }

  validateReviewReply(
    replyText: string,
    isNegativeReview: boolean,
  ): GuardrailResult {
    const violations: string[] = [];

    // 1. Length validation
    if (replyText.length > 600) {
      violations.push(`Reply exceeds 600 characters (${replyText.length} chars)`);
    }
    if (replyText.length < 20) {
      violations.push('Reply is too short (minimum 20 characters)');
    }

    // 2. For negative reviews, check diagnostic language
    if (isNegativeReview) {
      for (const pattern of BANNED_MEDICAL_DIAGNOSES_IN_REPLY) {
        if (pattern.test(replyText)) {
          violations.push(`Prohibited diagnostic language in review reply: "${pattern.source}"`);
        }
      }
    }

    // 3. General banned claims in replies
    for (const pattern of BANNED_CLAIM_PATTERNS) {
      if (pattern.test(replyText)) {
        violations.push(`Banned claim in reply: "${pattern.source}"`);
      }
    }

    if (violations.length > 0) {
      this.logger.warn(`Review Reply guardrail violations: ${violations.join('; ')}`);
    }

    return { isValid: violations.length === 0, violations };
  }

  validateWhatsAppMessage(content: string, maxLength = 1024): GuardrailResult {
    const violations: string[] = [];

    if (content.length > maxLength) {
      violations.push(`WhatsApp message exceeds ${maxLength} characters`);
    }

    for (const pattern of BANNED_CLAIM_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`Banned claim in WhatsApp: "${pattern.source}"`);
      }
    }

    return { isValid: violations.length === 0, violations };
  }

  private checkInventedServices(
    content: string,
    servicesCatalog: string[],
    violations: string[],
  ): void {
    // Common medical/dental services NOT in catalog detection heuristic
    const commonServicesNotInCatalog = [
      'laser', 'botox', 'fillers', 'ivf', 'surrogacy', 'hair transplant',
    ].filter(
      (svc) =>
        content.toLowerCase().includes(svc) &&
        !servicesCatalog.some((s) => s.toLowerCase().includes(svc)),
    );

    if (commonServicesNotInCatalog.length > 0) {
      violations.push(
        `Content may reference services not in catalog: ${commonServicesNotInCatalog.join(', ')}`,
      );
    }
  }
}
