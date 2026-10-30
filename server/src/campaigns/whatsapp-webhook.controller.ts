import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { WhatsAppCloudService } from './whatsapp-cloud.service';
import { CampaignsService } from './campaigns.service';

@ApiTags('WhatsApp Webhook')
@Controller('webhook/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly whatsappService: WhatsAppCloudService,
    private readonly campaignsService: CampaignsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Meta Webhook verification handshake' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: any,
  ) {
    if (mode === 'subscribe' && token === this.whatsappService.getVerifyToken()) {
      this.logger.log('WhatsApp webhook successfully verified');
      return res.status(HttpStatus.OK).send(challenge);
    }
    return res.status(HttpStatus.FORBIDDEN).send('Verification failed');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Incoming WhatsApp Cloud status updates and message replies' })
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    // Validate signature
    if (!this.whatsappService.verifySignature(JSON.stringify(payload), signature)) {
      this.logger.warn('Invalid WhatsApp webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    try {
      const entry = payload?.entry?.[0];
      const changes = entry?.changes?.[0]?.value;

      if (!changes) return { status: 'ignored' };

      // 1. Process message status updates (sent, delivered, read, failed)
      if (changes.statuses && changes.statuses.length > 0) {
        for (const statusUpdate of changes.statuses) {
          await this.campaignsService.processWebhookStatus({
            id: statusUpdate.id,
            status: statusUpdate.status,
            timestamp: statusUpdate.timestamp,
            errors: statusUpdate.errors,
          });
        }
      }

      // 2. Process incoming messages (replies, STOP opt-outs)
      if (changes.messages && changes.messages.length > 0) {
        for (const msg of changes.messages) {
          await this.campaignsService.processWebhookIncomingMessage({
            from: msg.from,
            id: msg.id,
            text: msg.text,
            timestamp: msg.timestamp,
          });
        }
      }

      return { status: 'processed' };
    } catch (err) {
      this.logger.error('Error handling WhatsApp webhook:', err);
      return { status: 'error', message: (err as Error).message };
    }
  }
}
