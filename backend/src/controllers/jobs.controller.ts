import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId, keyword, location, locationType } = req.query;
    
    // Build dynamic where clause
    const whereClause: any = { status: 'PUBLISHED' };
    
    if (companyId) {
      whereClause.companyId = String(companyId);
    }
    
    if (locationType) {
      whereClause.locationType = String(locationType);
    }
    
    if (location) {
      whereClause.location = {
        contains: String(location),
        mode: 'insensitive'
      };
    }
    
    if (keyword) {
      const kw = String(keyword);
      whereClause.OR = [
        { title: { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } },
        { requirements: { contains: kw, mode: 'insensitive' } }
      ];
    }
    
    const { datePosted } = req.query;
    if (datePosted) {
      const now = new Date();
      if (datePosted === 'past_24h') {
        whereClause.createdAt = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      } else if (datePosted === 'past_week') {
        whereClause.createdAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      } else if (datePosted === 'past_month') {
        whereClause.createdAt = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      }
    }

    const jobs = await prisma.jobPost.findMany({
      where: whereClause,
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(jobs);
  } catch (error) {
    console.error('[getJobs Error]:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, requirements, salaryRange, locationType, companyId, status, goLiveAt, expiresAt } = req.body;
    
    // In a complete implementation, companyId should come from the authenticated req.user
    
    const newJob = await prisma.jobPost.create({
      data: {
        title,
        description,
        requirements,
        salaryRange,
        locationType,
        companyId,
        status: status || 'PUBLISHED',
        goLiveAt: goLiveAt ? new Date(goLiveAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: { company: true }
    });
    
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    
    res.json(job);
  } catch (error) {
    console.error('[getJobById Error]:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, requirements, benefits, salaryRange, locationType, status, goLiveAt, expiresAt } = req.body;
    
    // Auth user check
    const userId = (req as any).user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const existingJob = await prisma.jobPost.findUnique({ where: { id } });
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    
    if (user?.role !== 'EMPLOYER' || user?.companyId !== existingJob.companyId) {
      res.status(403).json({ error: 'Unauthorized to edit this job' });
      return;
    }

    const updatedJob = await prisma.jobPost.update({
      where: { id },
      data: {
        title,
        description,
        requirements,
        benefits,
        salaryRange,
        locationType,
        status,
        goLiveAt: goLiveAt ? new Date(goLiveAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });
    
    res.json(updatedJob);
  } catch (error) {
    console.error('[updateJob Error]:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const userId = (req as any).user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const existingJob = await prisma.jobPost.findUnique({ where: { id } });
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    
    if (user?.role !== 'EMPLOYER' || user?.companyId !== existingJob.companyId) {
      res.status(403).json({ error: 'Unauthorized to delete this job' });
      return;
    }

    // Delete associated applications first or use cascading if set. Since schema usually blocks deletion if relations exist, 
    // let's explicitly delete applications if we want to allow job deletion, or just fail safely.
    await prisma.application.deleteMany({ where: { jobPostId: id } });
    await prisma.jobPost.delete({ where: { id } });
    
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('[deleteJob Error]:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};
