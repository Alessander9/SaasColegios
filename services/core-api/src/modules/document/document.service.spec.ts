import { DocumentService } from './document.service';
import { db } from '@cole/database';

jest.mock('@cole/database', () => ({
  db: {
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
  },
  DocumentStatus: {
    PENDING: 'PENDING',
    GENERATED: 'GENERATED',
    STORED: 'STORED',
    FAILED: 'FAILED',
  },
  DocumentType: {
    REPORT_CARD: 'REPORT_CARD',
    PAYSLIP: 'PAYSLIP',
    RECEIPT: 'RECEIPT',
    OTHER: 'OTHER',
  },
}));

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DocumentService();
  });

  describe('generateDocument', () => {
    it('should create document and mark as STORED after generation', async () => {
      (db.document.create as jest.Mock).mockResolvedValue({
        id: 'doc-1',
        tenantId: 'tenant-1',
        type: 'REPORT_CARD',
        status: 'PENDING',
      });
      (db.document.update as jest.Mock).mockResolvedValue({
        id: 'doc-1',
        status: 'STORED',
        fileSize: 1024,
        checksum: 'abc123',
      });

      const result = await service.generateDocument('tenant-1', {
        type: "REPORT_CARD",
        name: 'Boleta Mateo García',
        metadata: { studentId: 'stu-1' },
      });

      expect(result.status).toBe('STORED');
      expect(result.fileSize).toBe(1024);
      expect(db.document.create).toHaveBeenCalled();
      expect(db.document.update).toHaveBeenCalled();
    });

    it('should mark as FAILED when generation throws', async () => {
      (db.document.create as jest.Mock).mockResolvedValue({
        id: 'doc-2',
        status: 'PENDING',
      });
      (db.document.update as jest.Mock).mockResolvedValue({});

      // Override generatePdf to throw
      (service as any).generatePdf = jest.fn().mockRejectedValue(new Error('PDF generation error'));

      await expect(
        service.generateDocument('tenant-1', {
          type: "PAYSLIP",
          name: 'Boleta de Pago',
        }),
      ).rejects.toThrow('Document generation failed');

      expect(db.document.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      );
    });
  });

  describe('uploadDocument', () => {
    it('should create a stored document record', async () => {
      (db.document.create as jest.Mock).mockResolvedValue({
        id: 'doc-3',
        type: 'CONTRACT',
        status: 'STORED',
      });

      const result = await service.uploadDocument('tenant-1', {
        type: "OTHER",
        name: 'Contrato Laboral',
        description: 'Contrato a plazo fijo',
      });

      expect(result.status).toBe('STORED');
      expect(db.document.create).toHaveBeenCalled();
    });
  });

  describe('getDocuments', () => {
    it('should return documents with optional filters', async () => {
      (db.document.findMany as jest.Mock).mockResolvedValue([
        { id: 'doc-1', type: 'REPORT_CARD' },
      ]);

      const result = await service.getDocuments('tenant-1', {
        type: "REPORT_CARD",
      });

      expect(result).toHaveLength(1);
    });
  });

  describe('getDocumentById', () => {
    it('should return document by ID', async () => {
      (db.document.findFirst as jest.Mock).mockResolvedValue({ id: 'doc-1', name: 'Test' });

      const result = await service.getDocumentById('tenant-1', 'doc-1');
      expect(result.id).toBe('doc-1');
    });

    it('should throw when not found', async () => {
      (db.document.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.getDocumentById('tenant-1', 'nonexistent')).rejects.toThrow('Document not found');
    });
  });

  describe('deleteDocument', () => {
    it('should soft-delete by archiving', async () => {
      (db.document.findFirst as jest.Mock).mockResolvedValue({
        id: 'doc-1',
        description: 'Original',
      });
      (db.document.update as jest.Mock).mockResolvedValue({});

      await service.deleteDocument('tenant-1', 'doc-1');

      expect(db.document.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            description: expect.stringContaining('[ARCHIVED]'),
          }),
        }),
      );
    });

    it('should throw when not found', async () => {
      (db.document.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.deleteDocument('tenant-1', 'nonexistent')).rejects.toThrow('Document not found');
    });
  });

  describe('getDocumentStats', () => {
    it('should return document statistics by type and status', async () => {
      (db.document.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { type: 'REPORT_CARD', _count: 50, _sum: { fileSize: 51200 } },
          { type: 'PAYSLIP', _count: 30, _sum: { fileSize: 30720 } },
        ])
        .mockResolvedValueOnce([
          { status: 'STORED', _count: 75 },
          { status: 'FAILED', _count: 5 },
        ]);

      const result = await service.getDocumentStats('tenant-1');

      expect(result.total).toBe(80);
      expect(result.totalSizeBytes).toBe(81920);
      expect(result.byType).toHaveLength(2);
      expect(result.byStatus).toHaveLength(2);
    });
  });
});
