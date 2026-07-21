/**
 * TeslaPrimeCapital — Strict Zod KYC & Compliance Validation (`kyc.validator.ts`)
 */

import { z } from 'zod';

export const UploadSignatureRequestSchema = z.object({
  documentType: z.enum(['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'PROOF_OF_ADDRESS', 'SELFIE']),
});

export const DocumentRecordRequestSchema = z.object({
  documentType: z.enum(['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'PROOF_OF_ADDRESS', 'SELFIE']),
  cloudinaryPublicId: z.string().min(5, 'Invalid Cloudinary public ID path.'),
});

export const AdminReviewActionSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required.'),
  action: z.enum(['APPROVE', 'REJECT']),
  targetTier: z.enum(['TIER_1', 'TIER_2']),
  notes: z.string().max(1000).optional(),
});

export type UploadSignatureRequestInput = z.infer<typeof UploadSignatureRequestSchema>;
export type DocumentRecordRequestInput = z.infer<typeof DocumentRecordRequestSchema>;
export type AdminReviewActionInput = z.infer<typeof AdminReviewActionSchema>;
