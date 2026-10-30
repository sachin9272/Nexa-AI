import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { TenantContextService } from '../common/tenancy/tenant-context.service';
import {
  CONSENT_OPTED_IN,
  CONSENT_OPTED_OUT,
  WHATSAPP_OPTOUT_KEYWORDS,
} from '../common/constants';

export class CreateCustomerDto {
  name: string;
  phone: string; // will be normalized to E.164
  email?: string;
  tags?: string[];
  consentStatus?: string;
  consentSource?: string;
  notes?: string;
  lastVisitAt?: string;
}

export class ImportCustomerItemDto {
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
  lastVisitAt?: string;
}

export class ImportCustomersDto {
  customers: ImportCustomerItemDto[];
  consentSource?: string;
  defaultTags?: string[];
}

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Normalizes a phone string to standard E.164 format.
   * Defaults to India (+91) if 10 digits are provided without a country code.
   */
  normalizePhone(phone: string): string {
    if (!phone) throw new BadRequestException('Phone number is required');
    let cleaned = phone.replace(/[^0-9+]/g, '');

    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Default to +91 if standard 10 digit Indian mobile
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }

    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }

    return `+${cleaned}`;
  }

  async create(dto: CreateCustomerDto): Promise<CustomerDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const phoneE164 = this.normalizePhone(dto.phone);

    const existing = await this.customerModel.findOne({ tenantId, phoneE164 });
    if (existing) {
      throw new ConflictException(`Customer with phone ${phoneE164} already exists`);
    }

    return this.customerModel.create({
      tenantId,
      name: dto.name.trim(),
      phoneE164,
      email: dto.email?.trim().toLowerCase(),
      tags: dto.tags ?? [],
      consentStatus: dto.consentStatus ?? CONSENT_OPTED_IN,
      consentSource: dto.consentSource ?? 'manual',
      consentTimestamp: new Date(),
      notes: dto.notes ?? null,
      lastVisitAt: dto.lastVisitAt ? new Date(dto.lastVisitAt) : null,
    });
  }

  async importBatch(dto: ImportCustomersDto): Promise<{
    imported: number;
    updated: number;
    skipped: number;
    errors: Array<{ phone: string; error: string }>;
  }> {
    const tenantId = this.tenantContext.getTenantId();
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ phone: string; error: string }> = [];

    const defaultTags = dto.defaultTags ?? [];
    const consentSource = dto.consentSource ?? 'import';

    for (const item of dto.customers) {
      try {
        if (!item.name || !item.phone) {
          skipped++;
          continue;
        }

        const phoneE164 = this.normalizePhone(item.phone);
        const itemTags = Array.from(new Set([...defaultTags, ...(item.tags ?? [])]));

        const existing = await this.customerModel.findOne({ tenantId, phoneE164 });
        if (existing) {
          // If customer previously opted out, preserve opt-out!
          if (existing.consentStatus === CONSENT_OPTED_OUT) {
            existing.name = item.name.trim();
            if (item.email) existing.email = item.email.trim().toLowerCase();
            existing.tags = Array.from(new Set([...existing.tags, ...itemTags]));
            await existing.save();
            updated++;
          } else {
            existing.name = item.name.trim();
            if (item.email) existing.email = item.email.trim().toLowerCase();
            existing.tags = Array.from(new Set([...existing.tags, ...itemTags]));
            if (item.lastVisitAt) existing.lastVisitAt = new Date(item.lastVisitAt);
            await existing.save();
            updated++;
          }
        } else {
          await this.customerModel.create({
            tenantId,
            name: item.name.trim(),
            phoneE164,
            email: item.email?.trim().toLowerCase(),
            tags: itemTags,
            consentStatus: CONSENT_OPTED_IN,
            consentSource,
            consentTimestamp: new Date(),
            lastVisitAt: item.lastVisitAt ? new Date(item.lastVisitAt) : null,
          });
          imported++;
        }
      } catch (err) {
        errors.push({ phone: item.phone, error: (err as Error).message });
      }
    }

    return { imported, updated, skipped, errors };
  }

  async handleOptOut(phoneE164: string, tenantId?: Types.ObjectId): Promise<boolean> {
    const query: Record<string, unknown> = { phoneE164 };
    if (tenantId) query['tenantId'] = tenantId;

    const result = await this.customerModel.updateMany(query, {
      consentStatus: CONSENT_OPTED_OUT,
      optedOutAt: new Date(),
    });

    this.logger.log(`Opted out customer with phone ${phoneE164}, modified: ${result.modifiedCount}`);
    return result.modifiedCount > 0;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    consentStatus?: string;
  }): Promise<{ items: CustomerDocument[]; total: number }> {
    const tenantId = this.tenantContext.getTenantId();
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const filter: Record<string, unknown> = { tenantId, isActive: true };

    if (params.consentStatus) {
      filter['consentStatus'] = params.consentStatus;
    }
    if (params.tag) {
      filter['tags'] = params.tag;
    }
    if (params.search) {
      filter['$or'] = [
        { name: { $regex: params.search, $options: 'i' } },
        { phoneE164: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.customerModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<CustomerDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const customer = await this.customerModel.findOne({ _id: id, tenantId });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, updates: Partial<CreateCustomerDto>): Promise<CustomerDocument> {
    const tenantId = this.tenantContext.getTenantId();
    const customer = await this.customerModel.findOne({ _id: id, tenantId });
    if (!customer) throw new NotFoundException('Customer not found');

    if (updates.name) customer.name = updates.name.trim();
    if (updates.email) customer.email = updates.email.trim().toLowerCase();
    if (updates.tags) customer.tags = updates.tags;
    if (updates.notes !== undefined) customer.notes = updates.notes;
    if (updates.lastVisitAt) customer.lastVisitAt = new Date(updates.lastVisitAt);
    if (updates.consentStatus) customer.consentStatus = updates.consentStatus;

    return customer.save();
  }
}
