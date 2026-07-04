import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, family: 0 })
  : new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

export const resumeQueue = new Queue('resume-parsing', { connection: connection as any });
