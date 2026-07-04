import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false, tls: { rejectUnauthorized: false } })
  : new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

export const resumeQueue = new Queue('resume-parsing', { 
  connection: connection as any,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 1
  }
});
