/**
 * TeslaPrimeCapital — Singleton PrismaClient Wrapper
 * Configured for PgBouncer connection pooling and exact query logging.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger.util';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Attach structured query logging
prisma.$on('query' as never, (e: any) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(`Prisma Query: ${e.query} -- Params: ${e.params} (${e.duration}ms)`);
  }
});

prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma Database Error Intercepted:', { message: e.message, target: e.target });
});
