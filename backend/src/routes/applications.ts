import { Router } from 'express';
import { getApplicationsForJob, updateApplicationStatus, createApplication, getMyApplications } from '../controllers/applications.controller';
import { authenticate } from '../middleware/auth';

export const applicationsRouter = Router();

applicationsRouter.get('/me', authenticate, getMyApplications);
applicationsRouter.get('/job/:jobId', getApplicationsForJob);
applicationsRouter.patch('/:id/status', updateApplicationStatus);
applicationsRouter.post('/', authenticate, createApplication);
