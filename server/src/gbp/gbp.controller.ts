import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  Redirect,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GbpService } from './gbp.service';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantContextService } from '../common/tenancy/tenant-context.service';

@ApiTags('Google Business Profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TenantContextInterceptor)
@Controller('gbp')
export class GbpController {
  constructor(
    private readonly gbpService: GbpService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Get('oauth/url')
  @ApiOperation({ summary: 'Get Google OAuth authorization URL' })
  getOAuthUrl(@Query('state') state: string) {
    const tenantId = this.tenantContext.getTenantId().toString();
    return { url: this.gbpService.getOAuthUrl(state ?? tenantId) };
  }

  @Get('oauth/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback (called by Google)' })
  async handleCallback(@Query('code') code: string) {
    const connection = await this.gbpService.handleOAuthCallback(code);
    return { message: 'Google Business Profile connected successfully', connection };
  }

  @Get('connections')
  @ApiOperation({ summary: 'List all GBP connections for the tenant' })
  getConnections() {
    return this.gbpService.getConnections();
  }

  @Get('connections/:id/audit/latest')
  @ApiOperation({ summary: 'Get the latest GBP audit for a connection' })
  getLatestAudit(@Param('id') id: string) {
    return this.gbpService.getLatestAudit(id);
  }

  @Post('connections/:id/audit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger a new GBP audit for a connection' })
  async triggerAudit(@Param('id') id: string) {
    const tenantId = this.tenantContext.getTenantId();
    return this.gbpService.runAudit(id, tenantId);
  }

  @Get('connections/:id/reviews')
  @ApiOperation({ summary: 'List reviews for a GBP location' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'replyStatus', required: false, type: String })
  getReviews(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('replyStatus') replyStatus?: string,
  ) {
    return this.gbpService.getReviews(id, +page, +limit, replyStatus);
  }
}
