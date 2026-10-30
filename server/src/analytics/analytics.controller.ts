import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantContextService } from '../common/tenancy/tenant-context.service';

@ApiTags('Analytics & ROI Engine')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TenantContextInterceptor)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get outcome-focused business KPI metrics and unit economics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getOverview(@Query('days') days = 30) {
    return this.analyticsService.getDashboardOverview(+days);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Get daily timeseries metrics for chart visualization' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getTimeseries(@Query('days') days = 14) {
    return this.analyticsService.getTimeseries(+days);
  }

  @Post('digest/test')
  @ApiOperation({ summary: 'Trigger a sample Monday morning WhatsApp digest for the tenant' })
  sendTestDigest() {
    const tenantId = this.tenantContext.getTenantId();
    return this.analyticsService.sendWeeklyDigest(tenantId);
  }
}
