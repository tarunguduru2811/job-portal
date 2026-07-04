import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { ApplicationStatus } from '@prisma/client';
import { resumeQueue } from '../workers/resumeQueue';

export const getApplicationsForJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const applications = await prisma.application.findMany({
      where: { jobPostId: jobId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const getMyApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        jobPost: {
          include: {
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('[getMyApplications Error]:', error);
    res.status(500).json({ error: 'Failed to fetch your applications' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!Object.values(ApplicationStatus).includes(status)) {
       res.status(400).json({ error: 'Invalid status' });
       return;
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status }
    });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobPostId } = req.body;
    
    // Extracted from our JWT middleware
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    
    if (!userId) {
       res.status(401).json({ error: 'Unauthorized' });
       return;
    }
    
    if (userRole === 'EMPLOYER') {
       res.status(403).json({ error: 'Employers cannot apply to jobs' });
       return;
    }

    // Check if user already applied
    const existing = await prisma.application.findFirst({
      where: { jobPostId, userId }
    });

    if (existing) {
       res.status(400).json({ error: 'You have already applied to this job' });
       return;
    }

    const application = await prisma.application.create({
      data: {
        jobPostId,
        userId,
        status: ApplicationStatus.APPLIED
      }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.resumeUrl) {
      await resumeQueue.add('parse-resume', { 
        applicationId: application.id, 
        resumeUrl: user.resumeUrl 
      });
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
};
