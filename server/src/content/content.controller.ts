import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContentService, GenerateGbpPostDto, ApproveContentDto } from './content.service';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';

@ApiTags('Content & Approvals')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(TenantContextInterceptor)
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('gbp-post/generate')
  @ApiOperation({ summary: 'Generate an AI GBP post and queue for approval' })
  generateGbpPost(@Body() dto: GenerateGbpPostDto) {
    return this.contentService.generateGbpPost(dto);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get all content pending owner approval (1-tap queue)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  getPending(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('type') type?: string,
  ) {
    return this.contentService.getPendingApprovals(+page, +limit, type);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '1-tap approve (with optional edit) and schedule for publishing' })
  approve(@Param('id') id: string, @Body() dto: ApproveContentDto) {
    return this.contentService.approveContent(id, dto);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject content and optionally provide a reason' })
  reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.contentService.rejectContent(id, body.reason);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get content history with optional status and type filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  getHistory(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.contentService.getContentHistory(+page, +limit, status, type);
  }
}
