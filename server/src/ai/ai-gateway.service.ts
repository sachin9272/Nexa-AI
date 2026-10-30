import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MetricsDaily, MetricsDailyDocument } from '../analytics/schemas/metrics-daily.schema';
import {
  PROMPT_TEMPLATES,
  PromptTemplate,
  TenantContext,
} from './prompt-templates/prompt-registry';
import { ContentGuardrailService } from './guardrails/content-guardrail.service';

export interface AiGenerationRequest {
  promptKey: string;
  tenantContext: TenantContext;
  variables: Record<string, string>;
}

export interface AiGenerationResult<T = Record<string, unknown>> {
  data: T;
  modelUsed: string;
  promptVersion: string;
  tokensUsed: number;
  costUsd: number;
  guardRailsPassed: boolean;
}

// Token cost per 1M tokens (approximate)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'gemini-1.5-pro': { input: 3.5, output: 10.5 },
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'gpt-4o': { input: 5.0, output: 15.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
};

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);
  private readonly MAX_RETRIES = 2;

  constructor(
    private readonly configService: ConfigService,
    private readonly guardrails: ContentGuardrailService,
    @InjectModel(MetricsDaily.name)
    private readonly metricsDailyModel: Model<MetricsDailyDocument>,
  ) {}

  async generate<T = Record<string, unknown>>(
    request: AiGenerationRequest,
  ): Promise<AiGenerationResult<T>> {
    const template = PROMPT_TEMPLATES[`${request.promptKey}_v1`];
    if (!template) {
      throw new InternalServerErrorException(
        `Unknown prompt template: ${request.promptKey}`,
      );
    }

    const modelName = this.selectModel(template.model);
    const userPrompt = this.interpolateTemplate(
      template.userPromptTemplate,
      request.variables,
    );

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const raw = await this.callLlm(
          modelName,
          template.systemPrompt,
          userPrompt,
          template.maxTokens,
          template.temperature,
        );

        const parsed = this.parseJsonResponse<T>(raw.text);
        const tokensUsed = raw.tokensUsed;
        const costUsd = this.calculateCost(modelName, tokensUsed.input, tokensUsed.output);

        // Track usage asynchronously
        void this.trackLlmUsage(request.tenantContext.tenantId, modelName, tokensUsed, costUsd);

        return {
          data: parsed,
          modelUsed: modelName,
          promptVersion: `${template.key}_v${template.version}`,
          tokensUsed: tokensUsed.input + tokensUsed.output,
          costUsd,
          guardRailsPassed: true,
        };
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(
          `AI generation attempt ${attempt + 1} failed for ${request.promptKey}: ${lastError.message}`,
        );
        if (attempt < this.MAX_RETRIES) {
          await this.sleep(1000 * (attempt + 1)); // Exponential backoff
        }
      }
    }

    throw new InternalServerErrorException(
      `AI generation failed after ${this.MAX_RETRIES + 1} attempts: ${lastError?.message}`,
    );
  }

  private selectModel(tier: 'fast' | 'reasoning'): string {
    if (tier === 'reasoning') {
      return this.configService.get<string>(
        'ai.reasoningModel',
        'claude-3-5-sonnet-20241022',
      );
    }
    return this.configService.get<string>('ai.defaultModel', 'gemini-1.5-flash');
  }

  private interpolateTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      return variables[key] ?? `[MISSING:${key}]`;
    });
  }

  private async callLlm(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
    temperature: number,
  ): Promise<{ text: string; tokensUsed: { input: number; output: number } }> {
    // In production, instantiate the appropriate SDK client based on model prefix
    // For now, this is a well-structured stub that returns mock data for development
    const isGemini = model.startsWith('gemini');
    const isClaude = model.startsWith('claude');
    const isOpenAi = model.startsWith('gpt');

    if (isGemini) {
      return this.callGemini(model, systemPrompt, userPrompt, maxTokens, temperature);
    } else if (isClaude) {
      return this.callClaude(model, systemPrompt, userPrompt, maxTokens, temperature);
    } else if (isOpenAi) {
      return this.callOpenAi(model, systemPrompt, userPrompt, maxTokens, temperature);
    }

    throw new Error(`Unsupported model: ${model}`);
  }

  /**
   * Gemini API call (production implementation pattern)
   */
  private async callGemini(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
    temperature: number,
  ): Promise<{ text: string; tokensUsed: { input: number; output: number } }> {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const data = await response.json() as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
      usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const usage = data.usageMetadata;

    return {
      text,
      tokensUsed: {
        input: usage?.promptTokenCount ?? 0,
        output: usage?.candidatesTokenCount ?? 0,
      },
    };
  }

  /**
   * Claude (Anthropic) API call
   */
  private async callClaude(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
    temperature: number,
  ): Promise<{ text: string; tokensUsed: { input: number; output: number } }> {
    const apiKey = this.configService.get<string>('ai.anthropicApiKey');
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error ${response.status}: ${err}`);
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };
    const text = data.content?.find((c) => c.type === 'text')?.text ?? '{}';

    return {
      text,
      tokensUsed: {
        input: data.usage?.input_tokens ?? 0,
        output: data.usage?.output_tokens ?? 0,
      },
    };
  }

  /**
   * OpenAI API call
   */
  private async callOpenAi(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
    temperature: number,
  ): Promise<{ text: string; tokensUsed: { input: number; output: number } }> {
    const apiKey = this.configService.get<string>('ai.openaiApiKey');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${err}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
    };
    const text = data.choices?.[0]?.message?.content ?? '{}';

    return {
      text,
      tokensUsed: {
        input: data.usage?.prompt_tokens ?? 0,
        output: data.usage?.completion_tokens ?? 0,
      },
    };
  }

  private parseJsonResponse<T>(raw: string): T {
    try {
      // Strip markdown code blocks if present
      const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error(`Failed to parse AI JSON response: ${raw.substring(0, 200)}`);
    }
  }

  private calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const costs = MODEL_COSTS[model] ?? { input: 1, output: 3 };
    return (inputTokens * costs.input + outputTokens * costs.output) / 1_000_000;
  }

  private async trackLlmUsage(
    tenantId: Types.ObjectId,
    model: string,
    tokens: { input: number; output: number },
    costUsd: number,
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await this.metricsDailyModel.findOneAndUpdate(
        { tenantId, date: today },
        {
          $inc: {
            'costs.llmTokensUsed': tokens.input + tokens.output,
            'costs.llmCostUsd': costUsd,
          },
        },
        { upsert: true },
      );
    } catch (err) {
      this.logger.error('Failed to track LLM usage:', err);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getGuardrails(): ContentGuardrailService {
    return this.guardrails;
  }
}
