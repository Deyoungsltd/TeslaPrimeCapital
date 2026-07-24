/**
 * TeslaPrimeCapital — Brand Media Request Validators (`media.validator.ts`)
 */
import { z } from 'zod';
import { isMediaSlotKey } from '@/content/media-registry';

export const MediaRecordRequestSchema = z.object({
  key: z
    .string()
    .min(3)
    .max(120)
    .refine(isMediaSlotKey, 'Unknown media slot key.'),
  cloudinaryPublicId: z
    .string()
    .min(10)
    .max(500)
    .regex(/^[a-zA-Z0-9_\-/.]+$/, 'Malformed Cloudinary public ID.'),
  altText: z.string().min(4).max(300).optional(),
});

export const MediaRevertRequestSchema = z.object({
  key: z
    .string()
    .min(3)
    .max(120)
    .refine(isMediaSlotKey, 'Unknown media slot key.'),
});

export type MediaRecordRequestInput = z.infer<typeof MediaRecordRequestSchema>;
export type MediaRevertRequestInput = z.infer<typeof MediaRevertRequestSchema>;
