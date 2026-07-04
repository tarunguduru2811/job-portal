import { Router } from 'express';
import { getJobs, createJob, getJobById, updateJob, deleteJob } from '../controllers/jobs.controller';
import { authenticate } from '../middleware/auth';

export const jobsRouter = Router();

jobsRouter.get('/', getJobs);
jobsRouter.get('/:id', getJobById);
jobsRouter.post('/', authenticate, createJob);
jobsRouter.put('/:id', authenticate, updateJob);
jobsRouter.delete('/:id', authenticate, deleteJob);
