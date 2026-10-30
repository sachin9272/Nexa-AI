import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CustomersService,
  CreateCustomerDto,
  ImportCustomersDto,
} from './customers.service';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';

@ApiTags('Customers & CRM')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TenantContextInterceptor)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer contact with E.164 normalization' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Batch import customers from CSV/list with consent audit logging' })
  importBatch(@Body() dto: ImportCustomersDto) {
    return this.customersService.importBatch(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated customers list with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'consentStatus', required: false, type: String })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('consentStatus') consentStatus?: string,
  ) {
    return this.customersService.findAll({
      page: +page,
      limit: +limit,
      search,
      tag,
      consentStatus,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer profile details by ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer details' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCustomerDto>) {
    return this.customersService.update(id, dto);
  }

  @Post('opt-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Explicitly mark a customer phone number as OPTED_OUT' })
  optOut(@Body('phone') phone: string) {
    const phoneE164 = this.customersService.normalizePhone(phone);
    return this.customersService.handleOptOut(phoneE164);
  }
}
