import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { TenantContextService } from '../common/tenancy/tenant-context.service';

export class UpdateTenantProfileDto {
  name?: string;
  category?: string;
  city?: string;
  timezone?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  operatingHours?: Record<string, string[]>;
  servicesCatalog?: Array<{
    name: string;
    description: string;
    price: string;
    durationMinutes: number;
    category: string;
  }>;
  brandVoice?: {
    tone: string;
    languages: string[];
    signatureText: string;
    ctaText: string;
    appointmentLink: string;
    highlightServices: string[];
  };
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    private readonly tenantContext: TenantContextService,
  ) {}

  async getCurrentTenant(): Promise<TenantDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateProfile(dto: UpdateTenantProfileDto): Promise<TenantDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (dto.name) tenant.name = dto.name.trim();
    if (dto.category) tenant.category = dto.category.trim();
    if (dto.city) tenant.city = dto.city.trim();
    if (dto.timezone) tenant.timezone = dto.timezone.trim();
    if (dto.email) tenant.email = dto.email.trim().toLowerCase();
    if (dto.phone) tenant.phone = dto.phone.trim();
    if (dto.website) tenant.website = dto.website.trim();
    if (dto.address) tenant.address = dto.address.trim();
    if (dto.operatingHours) tenant.operatingHours = dto.operatingHours;
    if (dto.servicesCatalog) tenant.servicesCatalog = dto.servicesCatalog;
    if (dto.brandVoice) tenant.brandVoice = { ...tenant.brandVoice, ...dto.brandVoice };

    return tenant.save();
  }
}
