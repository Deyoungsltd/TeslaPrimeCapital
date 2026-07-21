/**
 * TeslaPrimeCapital — KYC DTOs
 */

export type DocumentType = 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PROOF_OF_ADDRESS' | 'SELFIE';
export type VerificationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface IKYCDocumentDTO {
  id: string;
  userId: string;
  documentType: DocumentType;
  status: VerificationStatus;
  reviewNotes?: string | null;
  createdAt: string;
}

export interface IAdminKYCReviewRequest {
  documentId: string;
  action: 'APPROVE' | 'REJECT';
  targetTier: 'TIER_1' | 'TIER_2';
  notes?: string;
}
