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
import { CampaignsService, CreateCampaignDto } from './campaigns.service';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';

@ApiTags('WhatsApp Campaigns')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TenantContextInterceptor)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Draft a new WhatsApp lifecycle broadcast campaign' })
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @Post(':id/launch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Launch campaign broadcast to segmented opted-in customers' })
  launch(@Param('id') id: string) {
    return this.campaignsService.launch(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of campaigns' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.campaignsService.findAll({ page: +page, limit: +limit, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign details and real-time delivery stats' })
  findOne(@Param('id') id: string) {
    return this.campaignsService.findById(id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get campaign recipient messages log' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  getMessages(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.campaignsService.getMessages(id, +page, +limit, status);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an ongoing or scheduled campaign' })
  cancel(@Param('id') id: string) {
    return this.campaignsService.cancel(id);
  }
}
