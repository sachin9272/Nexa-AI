import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiGatewayService } from './ai-gateway.service';
import { ContentGuardrailService } from './guardrails/content-guardrail.service';
import { MetricsDaily, MetricsDailySchema } from '../analytics/schemas/metrics-daily.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MetricsDaily.name, schema: MetricsDailySchema },
    ]),
  ],
  providers: [AiGatewayService, ContentGuardrailService],
  exports: [AiGatewayService, ContentGuardrailService],
})
export class AiModule {}
