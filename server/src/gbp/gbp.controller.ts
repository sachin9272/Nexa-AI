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
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GbpService } from './gbp.service';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { TenantContextService } from '../common/tenancy/tenant-context.service';

@ApiTags('Google Business Profile')
@Controller('gbp')
export class GbpController {
  constructor(
    private readonly gbpService: GbpService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Get('oauth/url')
  @ApiOperation({ summary: 'Get Google OAuth authorization URL' })
  getOAuthUrl(@Query('state') state?: string) {
    let tenantId = 'demo-tenant';
    try {
      tenantId = this.tenantContext.getTenantId()?.toString() || 'demo-tenant';
    } catch {}
    return { url: this.gbpService.getOAuthUrl(state || tenantId) };
  }

  @Get('oauth/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback (called by Google redirect)' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
    @Res() res?: any,
  ) {
    try {
      const connection = await this.gbpService.handleOAuthCallback(code, state);
      if (res && typeof res.redirect === 'function') {
        return res.redirect('http://localhost:3000/?connected=true');
      }
      return { message: 'Google Business Profile connected successfully', connection };
    } catch (err) {
      if (res && typeof res.redirect === 'function') {
        return res.redirect('http://localhost:3000/?error=' + encodeURIComponent((err as Error).message));
      }
      throw err;
    }
  }

  @Get('connections')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(TenantContextInterceptor)
  @ApiOperation({ summary: 'List all GBP connections for the tenant' })
  getConnections() {
    return this.gbpService.getConnections();
  }

  @Get('connections/:id/audit/latest')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(TenantContextInterceptor)
  @ApiOperation({ summary: 'Get the latest GBP audit for a connection' })
  getLatestAudit(@Param('id') id: string) {
    return this.gbpService.getLatestAudit(id);
  }

  @Post('connections/:id/audit')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(TenantContextInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger a new GBP audit for a connection' })
  async triggerAudit(@Param('id') id: string) {
    const tenantId = this.tenantContext.getTenantId();
    return this.gbpService.runAudit(id, tenantId);
  }

  @Get('connections/:id/reviews')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(TenantContextInterceptor)
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
