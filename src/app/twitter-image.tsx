/**
 * Twitter/X Card Image — reuses the default Open Graph renderer byte-for-byte
 * (same 1200×630 canvas, same brand composition) so both unfurlers always
 * agree on what a TeslaPrimeCapital link looks like.
 */
export { default, alt, size, contentType, runtime } from './opengraph-image';
