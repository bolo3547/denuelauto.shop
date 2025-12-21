import { Queue, Worker, QueueScheduler, Job } from 'bullmq';
import Redis from 'ioredis';
import { config } from 'dotenv';
import africasTalking from './africasTalking.client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

config();

const redisUrl = process.env.REDIS_URL;
let connection: Redis | null = null;

if (redisUrl) {
  connection = new Redis(redisUrl, { lazyConnect: true });
  let disabled = false;

  const disableQueues = (reason: string, err?: unknown) => {
    if (disabled) return;
    disabled = true;
    console.warn(`Queues disabled: ${reason}`, err);
    connection?.disconnect().catch(() => null);
    connection = null;
  };

  connection.on('error', (err: any) => {
    const message = err?.message ?? '';
    if (typeof message === 'string' && message.toUpperCase().includes('WRONGPASS')) {
      disableQueues('Redis authentication failed', err);
      return;
    }
    if (!disabled) {
      console.error('Redis queue connection error', err);
    }
  });

  connection.connect().catch((err) => {
    disableQueues('Redis queue connect failed, disabling background jobs', err);
  });
} else {
  console.warn('REDIS_URL not set. Background queues disabled in this environment.');
}

type NoopQueue = Pick<Queue, 'add'>;

function createNoopQueue(name: string): NoopQueue {
  return {
    add: async (jobName: string, data: any) => {
      console.warn(`[queues] Skipping job ${name}:${jobName} because Redis is not configured.`, data);
      return {} as Job;
    },
  };
}

export const receiptQueue: Queue | NoopQueue = connection ? new Queue('receipts', { connection }) : createNoopQueue('receipts');
export const receiptDLQ: Queue | NoopQueue = connection ? new Queue('receipts:dlq', { connection }) : createNoopQueue('receipts:dlq');

if (connection) {
  new QueueScheduler('receipts', { connection });
  new QueueScheduler('receipts:dlq', { connection });

  new Worker('receipts', async (job: any) => {
    const { to, message, paymentId } = job.data;
    const res = await africasTalking.sendSms(to, message);
    try {
      await prisma.receipt.create({ data: { paymentId, message, channel: 'sms', deliveredAt: new Date() } as any });
    } catch (err) {
      console.error('Failed to persist receipt', err);
    }
    return { ok: true, res };
  }, { connection, concurrency: 5, lockDuration: 60000 });

  // Dead-letter and failure handling
  new Worker('receipts:dlq', async (job: any) => {
    console.error('DLQ job processed', job.id, job.data);
  }, { connection });
} else {
  console.warn('Background workers not started because Redis connection is unavailable.');
}

export default { receiptQueue };
