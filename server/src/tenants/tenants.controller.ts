import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantsService, UpdateTenantProfileDto } from './tenants.service';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';

@ApiTags('Tenants & Clinic Profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TenantContextInterceptor)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant business profile and grounded settings' })
  getCurrentTenant() {
    return this.tenantsService.getCurrentTenant();
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update clinic services catalog, operating hours, and brand voice' })
  updateProfile(@Body() dto: UpdateTenantProfileDto) {
    return this.tenantsService.updateProfile(dto);
  }
}
