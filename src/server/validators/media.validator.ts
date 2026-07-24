/**
 * TeslaPrimeCapital — Brand Media Request Validators (`media.validator.ts`)
 */
import { z } from 'zod';
import { isMediaSlotKey, isTextSlotKey, TEXT_SLOT_MAP } from '@/content/media-registry';

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

export const MediaTextSetRequestSchema = z.object({
  key: z
    .string()
    .min(3)
    .max(120)
    .refine(isTextSlotKey, 'Unknown text slot key.'),
  value: z
    .string()
    .min(1, 'Clear the field through the revert endpoint instead.')
    .max(600),
});

export const MediaTextRevertRequestSchema = z.object({
  key: z
    .string()
    .min(3)
    .max(120)
    .refine(isTextSlotKey, 'Unknown text slot key.'),
});

export type MediaRecordRequestInput = z.infer<typeof MediaRecordRequestSchema>;
export type MediaRevertRequestInput = z.infer<typeof MediaRevertRequestSchema>;
export type MediaTextSetRequestInput = z.infer<typeof MediaTextSetRequestSchema>;
export type MediaTextRevertRequestInput = z.infer<typeof MediaTextRevertRequestSchema>;

/** Per-slot max-length guard applied after schema validation. */
export function textValueWithinSlotLimit(key: string, value: string): boolean {
  const slot = TEXT_SLOT_MAP[key];
  return slot ? value.trim().length <= slot.maxLength : false;
}
