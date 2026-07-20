/**
 * TeslaPrimeCapital — KYC Database Repository (`kyc.repository.ts`)
 */

import { prisma } from '@/lib/prisma';
import { KYCDocument, DocumentType, VerificationStatus, KycTier } from '@prisma/client';

export class KYCRepository {
  public async findByUserId(userId: string): Promise<KYCDocument[]> {
    return await prisma.kYCDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findById(id: string): Promise<(KYCDocument & { user: { email: string; firstName: string; lastName: string } }) | null> {
    return await prisma.kYCDocument.findUnique({
      where: { id },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });
  }

  public async findPendingQueue(options: { page: number; limit: number }): Promise<{
    documents: (KYCDocument & { user: { email: string; firstName: string; lastName: string; kycTier: KycTier } })[];
    totalCount: number;
  }> {
    const where = { status: VerificationStatus.PENDING_REVIEW };
    const [documents, totalCount] = await Promise.all([
      prisma.kYCDocument.findMany({
        where,
        include: { user: { select: { email: true, firstName: true, lastName: true, kycTier: true } } },
        orderBy: { createdAt: 'asc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.kYCDocument.count({ where }),
    ]);
    return { documents, totalCount };
  }

  public async createDocumentRecord(userId: string, documentType: DocumentType, cloudinaryPublicId: string): Promise<KYCDocument> {
    return await prisma.kYCDocument.create({
      data: {
        userId,
        documentType,
        cloudinaryPublicId,
        status: VerificationStatus.PENDING_REVIEW,
      },
    });
  }

  public async executeReviewAction(data: {
    documentId: string;
    userId: string;
    action: 'APPROVE' | 'REJECT';
    targetTier: KycTier;
    notes?: string;
    adminId: string;
  }): Promise<KYCDocument> {
    const newStatus = data.action === 'APPROVE' ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;

    return await prisma.$transaction(async (tx: any) => {
      const doc = await tx.kYCDocument.update({
        where: { id: data.documentId },
        data: {
          status: newStatus,
          reviewNotes: data.notes ?? null,
          reviewedById: data.adminId,
        },
      });

      if (data.action === 'APPROVE') {
        await tx.user.update({
          where: { id: data.userId },
          data: { kycTier: data.targetTier },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: data.adminId,
          actorRole: 'COMPLIANCE_OFFICER',
          actionType: `KYC_DOCUMENT_${newStatus}`,
          resourceId: data.documentId,
          newValue: { targetTier: data.targetTier, notes: data.notes },
        },
      });

      return doc;
    });
  }
}

export const kycRepository = new KYCRepository();
