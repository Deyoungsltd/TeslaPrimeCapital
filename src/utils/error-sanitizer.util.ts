/**
 * TeslaPrimeCapital — Client-Boundary Error Sanitizer (`error-sanitizer.util.ts`)
 *
 * Hard rule for every controller catch-block: the only error text allowed to
 * cross the API boundary toward a client is text that was AUTHORED for
 * clients. ORM frames, driver errors, TLS stacks, and infra topology (hosts,
 * ports, connection strings) are winston-logged server-side and replaced with
 * calm, non-attributable language here.
 *
 * Curated domain errors thrown by the service layer are exempt by convention:
 * they are prefixed with a machine code (`ERR_...`, `CONCURRENCY_LOCK_BUSY`)
 * and every character after the prefix was written for end users, so they
 * pass through verbatim — including their code prefix, which some dashboards
 * use for localization/state mapping.
 */

const DOMAIN_ERROR_PREFIX = /^(ERR_[A-Z0-9_]+|CONCURRENCY_LOCK_BUSY)\b/;

/** Prisma connection-phase engine codes — the data layer itself cannot be reached. */
const PRISMA_UNREACHABLE_CODES = new Set(['P1001', 'P1002', 'P1003', 'P1008', 'P1009', 'P1010', 'P1011', 'P1017']);
/** Schema drift codes — connected, but the expected tables/columns do not exist. */
const PRISMA_SCHEMA_MISSING_CODES = new Set(['P2021', 'P2022']);

const SAFE_DATA_LAYER_UNREACHABLE =
  'Our secure data layer is briefly unreachable. Please retry in a few seconds.';
const SAFE_SCHEMA_INITIALIZING =
  'The platform data layer is still initializing. Please retry in a minute.';
const SAFE_UPSTREAM_UNREACHABLE =
  'A required secure upstream service is briefly unreachable. Please retry shortly.';

/**
 * Returns the message that may be sent to the client. Any internal detail is
 * assumed to have already been logged by the calling controller.
 */
export function sanitizeErrorMessage(
  err: unknown,
  fallbackMessage = 'An internal error occurred while processing this request. The incident has been logged.',
): string {
  const e = err as { message?: unknown; code?: unknown; name?: unknown } | null | undefined;
  const message = typeof e?.message === 'string' ? e.message : '';

  // 1. Curated domain errors — authored for clients, pass through untouched.
  if (DOMAIN_ERROR_PREFIX.test(message)) {
    return message;
  }

  // 2. Prisma structured errors (carry a P#### code on the error object).
  const prismaCode = typeof e?.code === 'string' ? e.code : '';
  if (/^P\d{4}$/.test(prismaCode)) {
    if (PRISMA_UNREACHABLE_CODES.has(prismaCode)) return SAFE_DATA_LAYER_UNREACHABLE;
    if (PRISMA_SCHEMA_MISSING_CODES.has(prismaCode)) return SAFE_SCHEMA_INITIALIZING;
    if (prismaCode === 'P2025') return 'The requested record could not be found. It may have already been processed.';
    if (prismaCode === 'P2002') return 'A record with these details already exists.';
    return 'An internal data error occurred. The incident has been logged.';
  }

  // 3. Prisma error frames without a structured code (validation frames,
  //    engine panics, "Invalid `prisma.x()` invocation" wrappings carrying
  //    raw connection text, missing-env boot failures).
  if (/Invalid `prisma\.|Can't reach database server|Environment variable not found|PrismaClient/i.test(message)) {
    return SAFE_DATA_LAYER_UNREACHABLE;
  }

  // 4. Driver/network/TLS markers from Redis, Cloudinary, Resend, SMTP chains.
  if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED|ECONNRESET|EHOSTUNREACH|ENETUNREACH|socket hang up|certificate|UNABLE_TO_GET_ISSUER|self[- ]signed/i.test(message)) {
    return SAFE_UPSTREAM_UNREACHABLE;
  }

  // 5. Anything unrecognized never leaks internals to the client.
  return fallbackMessage;
}
