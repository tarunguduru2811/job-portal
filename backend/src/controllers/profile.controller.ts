import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, skills: true, resumeUrl: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { name, skills } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, skills },
      select: { id: true, name: true, email: true, skills: true, resumeUrl: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
       console.warn("Cloudinary not configured. Defaulting to local storage.");
       const localUrl = `/uploads/${req.file.filename}`;
       const user = await prisma.user.update({
         where: { id: userId },
         data: { resumeUrl: localUrl },
         select: { id: true, name: true, email: true, skills: true, resumeUrl: true }
       });
       res.json(user);
       return;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'image', // Use 'image' for PDFs to avoid Cloudinary's default raw file delivery restrictions
      folder: 'resumes',
      public_id: req.file.filename.split('.')[0] // Strip extension so it doesn't result in .pdf.pdf
    });
    
    // Delete the local file after upload
    fs.unlinkSync(req.file.path);

    const resumeUrl = result.secure_url;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { resumeUrl },
      select: { id: true, name: true, email: true, skills: true, resumeUrl: true }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};
