import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db, DocumentStatus, DocumentType } from '@cole/database';
import { GenerateDocumentDto, UploadDocumentDto } from './dto/document.dto';
import { StructuredLogger } from '@cole/logger';
import * as crypto from 'crypto';

@Injectable()
export class DocumentService {
  private logger = new StructuredLogger('document-service');

  // --------------------------------------------------
  // DOCUMENT GENERATION (PDF)
  // --------------------------------------------------

  async generateDocument(tenantId: string, dto: GenerateDocumentDto): Promise<any> {
    const docCode = `DOC-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0')}`;

    const document = await db.document.create({
      data: {
        tenantId,
        type: dto.type,
        name: dto.name,
        code: docCode,
        description: dto.description,
        status: DocumentStatus.PENDING,
        generatedBy: dto.generatedBy,
        metadata: dto.metadata ? (dto.metadata as any) : undefined,
      },
    });

    // Generate PDF asynchronously
    try {
      const pdfBuffer = await this.generatePdf(dto.type, dto.metadata || {});
      const checksum = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
      const filePath = `documents/${tenantId}/${docCode}.pdf`;

      // TODO: Upload to MinIO/S3
      // await this.uploadToStorage(filePath, pdfBuffer);

      const updated = await db.document.update({
        where: { id: document.id },
        data: {
          status: DocumentStatus.STORED,
          fileSize: pdfBuffer.length,
          filePath,
          checksum,
          mimeType: 'application/pdf',
        },
      });

      this.logger.info(`Document generated and stored`, {
        documentId: document.id,
        code: docCode,
        type: dto.type,
        fileSize: pdfBuffer.length,
      });

      return updated;
    } catch (err: any) {
      await db.document.update({
        where: { id: document.id },
        data: { status: DocumentStatus.FAILED },
      });
      this.logger.error(`Document generation failed`, err, { documentId: document.id });
      throw new BadRequestException(`Document generation failed: ${err.message}`);
    }
  }

  // --------------------------------------------------
  // DOCUMENT UPLOAD (External files)
  // --------------------------------------------------

  async uploadDocument(tenantId: string, dto: UploadDocumentDto): Promise<any> {
    const docCode = `DOC-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0')}`;

    return db.document.create({
      data: {
        tenantId,
        type: dto.type,
        name: dto.name,
        code: docCode,
        description: dto.description,
        status: DocumentStatus.STORED,
        metadata: dto.metadata ? (dto.metadata as any) : undefined,
      },
    });
  }

  // --------------------------------------------------
  // QUERIES
  // --------------------------------------------------

  async getDocuments(
    tenantId: string,
    options?: { type?: DocumentType; status?: DocumentStatus },
  ): Promise<any[]> {
    return db.document.findMany({
      where: {
        tenantId,
        ...(options?.type ? { type: options.type } : {}),
        ...(options?.status ? { status: options.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentById(tenantId: string, id: string): Promise<any> {
    const doc = await db.document.findFirst({
      where: { id, tenantId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async getDocumentByCode(tenantId: string, code: string): Promise<any> {
    const doc = await db.document.findFirst({
      where: { code, tenantId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async deleteDocument(tenantId: string, id: string): Promise<void> {
    const doc = await db.document.findFirst({
      where: { id, tenantId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    // Soft delete — mark as failed/archived, never hard delete
    await db.document.update({
      where: { id },
      data: { status: DocumentStatus.FAILED, description: '[ARCHIVED] ' + (doc.description || '') },
    });
  }

  async getDocumentStats(tenantId: string): Promise<any> {
    const byType = await db.document.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: true,
      _sum: { fileSize: true },
    });

    const byStatus = await db.document.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    return {
      total: byType.reduce((acc, t) => acc + t._count, 0),
      totalSizeBytes: byType.reduce((acc, t) => acc + Number(t._sum.fileSize || 0), 0),
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count,
        totalSizeBytes: Number(t._sum.fileSize || 0),
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
    };
  }

  // --------------------------------------------------
  // PDF GENERATION (Stub — plug in PDFKit / Puppeteer)
  // --------------------------------------------------

  private async generatePdf(type: DocumentType, metadata: Record<string, unknown>): Promise<Buffer> {
    // TODO: Integrate with PDFKit or Puppeteer for real PDF generation
    // For now, return a placeholder buffer
    const content = `Document Type: ${type}\nMetadata: ${JSON.stringify(metadata)}\nGenerated at: ${new Date().toISOString()}`;
    return Buffer.from(content, 'utf-8');
  }
}
