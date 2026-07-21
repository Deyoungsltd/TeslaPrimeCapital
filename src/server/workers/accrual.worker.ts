/**
 * TeslaPrimeCapital — Asynchronous Daily Compounding & Lump-Sum Maturity Worker (`accrual.worker.ts`)
 * Powered by BullMQ and Redis (`accruals-queue`), scheduled at 00:00 UTC every 24 hours.
 */

import { Worker, Queue } from 'bullmq';
import { redis } from '@/lib/redis';
import { investmentService } from '../services/investment.service';
import { logger } from '@/utils/logger.util';

export const accrualsQueue = new Queue('accruals-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const accrualWorker = new Worker(
  'accruals-queue',
  async (job) => {
    logger.info(`Processing BullMQ job [${job.id}]: ${job.name}`);
    if (job.name === 'execute-daily-accruals') {
      const stats = await investmentService.processDailyAccrualsAndMaturities();
      return stats;
    }
  },
  { connection: redis, concurrency: 1 }
);

accrualWorker.on('completed', (job, result) => {
  logger.info(`BullMQ job [${job.id}] completed cleanly. Result:`, result);
});

accrualWorker.on('failed', (job, err) => {
  logger.error(`BullMQ job [${job?.id}] failed: ${err.message}`, { stack: err.stack });
});

/**
 * Initializes the automated 00:00 UTC repeat cron schedule inside Redis.
 */
export async function scheduleDailyAccrualCron(): Promise<void> {
  await accrualsQueue.add(
    'execute-daily-accruals',
    { triggeredBy: 'SCHEDULED_CRON_00_00_UTC' },
    { repeat: { pattern: '0 0 * * *' }, jobId: 'cron_daily_accrual_job' }
  );
  logger.info('Automated daily accrual cron schedule [0 0 * * *] registered in BullMQ.');
}
