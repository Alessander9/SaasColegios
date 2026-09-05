import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import {
  GenerateDocumentDto,
  UploadDocumentDto,
} from './dto/document.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';
import { DocumentType, DocumentStatus } from '@cole/database';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(AuthGuard, PermissionGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for document operations');
    }
    return user.tenantId;
  }

  @Post('generate')
  @RequirePermission(Permissions.SCHOOL_CONFIG_UPDATE)
  @ApiOperation({ summary: 'Generate a PDF document (report card, payslip, receipt, etc.)' })
  generateDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateDocumentDto,
  ) {
    return this.documentService.generateDocument(this.extractTenantId(user), {
      ...dto,
      generatedBy: user.id,
    });
  }

  @Post('upload')
  @RequirePermission(Permissions.SCHOOL_CONFIG_UPDATE)
  @ApiOperation({ summary: 'Register an uploaded document (contracts, consent forms, etc.)' })
  uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentService.uploadDocument(this.extractTenantId(user), dto);
  }

  @Get()
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiOperation({ summary: 'List documents with optional type and status filters' })
  @ApiQuery({ name: 'type', enum: DocumentType, required: false })
  @ApiQuery({ name: 'status', enum: DocumentStatus, required: false })
  getDocuments(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type') type?: DocumentType,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.documentService.getDocuments(this.extractTenantId(user), { type, status });
  }

  @Get('stats')
  @RequirePermission(Permissions.REPORTING_VIEW)
  @ApiOperation({ summary: 'Get document generation statistics' })
  getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.documentService.getDocumentStats(this.extractTenantId(user));
  }

  @Get(':id')
  @RequirePermission(Permissions.SCHOOL_CONFIG_VIEW)
  @ApiOperation({ summary: 'Get document details by ID' })
  getDocumentById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.documentService.getDocumentById(this.extractTenantId(user), id);
  }

  @Delete(':id')
  @RequirePermission(Permissions.SCHOOL_CONFIG_UPDATE)
  @ApiOperation({ summary: 'Archive a document (soft delete)' })
  deleteDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.documentService.deleteDocument(this.extractTenantId(user), id);
  }
}
