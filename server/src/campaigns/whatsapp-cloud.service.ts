import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface WhatsAppTemplateMessageOptions {
  toPhoneE164: string;
  templateName: string;
  languageCode: string;
  bodyParameters?: string[];
  buttonUrlParameter?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class WhatsAppCloudService {
  private readonly logger = new Logger(WhatsAppCloudService.name);
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly webhookSecret: string;
  private readonly verifyToken: string;

  constructor(private readonly configService: ConfigService) {
    this.phoneNumberId = this.configService.get<string>('whatsapp.phoneNumberId', '');
    this.accessToken = this.configService.get<string>('whatsapp.accessToken', '');
    this.webhookSecret = this.configService.get<string>('whatsapp.webhookSecret', '');
    this.verifyToken = this.configService.get<string>('whatsapp.verifyToken', 'nexa-webhook-verify');
  }

  /**
   * Verifies incoming Meta Webhook signature using HMAC-SHA256
   */
  verifySignature(payload: string | Buffer, signatureHeader?: string): boolean {
    if (!this.webhookSecret || !signatureHeader) return true; // dev fallback
    try {
      const parts = signatureHeader.split('=');
      if (parts.length !== 2 || parts[0] !== 'sha256') return false;

      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(parts[1], 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  getVerifyToken(): string {
    return this.verifyToken;
  }

  /**
   * Sends a pre-approved WhatsApp template message via Meta Cloud API
   */
  async sendTemplateMessage(
    options: WhatsAppTemplateMessageOptions,
  ): Promise<WhatsAppSendResult> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('WhatsApp credentials not configured; simulating mock send.');
      return {
        success: true,
        messageId: `mock_wamid_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
    }

    const recipient = options.toPhoneE164.replace(/\+/g, '');
    const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

    const components: Array<Record<string, unknown>> = [];

    if (options.bodyParameters && options.bodyParameters.length > 0) {
      components.push({
        type: 'body',
        parameters: options.bodyParameters.map((text) => ({
          type: 'text',
          text,
        })),
      });
    }

    if (options.buttonUrlParameter) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: options.buttonUrlParameter }],
      });
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: options.templateName,
        language: {
          code: options.languageCode || 'en',
        },
        components: components.length > 0 ? components : undefined,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as {
        messages?: Array<{ id: string }>;
        error?: { message: string };
      };

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message ?? `HTTP ${response.status}`;
        this.logger.error(`Failed to send WhatsApp message to ${options.toPhoneE164}: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      const messageId = data.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`WhatsApp send network error: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }
}
