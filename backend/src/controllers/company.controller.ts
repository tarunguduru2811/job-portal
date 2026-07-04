import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getCompanyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id }
    });
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.json(company);
  } catch (error) {
    console.error('[getCompanyProfile Error]:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
};

export const updateCompanyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    
    // Verify user belongs to company
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.companyId !== id || user?.role !== 'EMPLOYER') {
      res.status(403).json({ error: 'Unauthorized to update this company' });
      return;
    }

    const { name, description, website, techStack, benefits, bannerUrl, logoUrl } = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        description,
        website,
        techStack,
        benefits,
        bannerUrl,
        logoUrl
      }
    });
    
    res.json(company);
  } catch (error) {
    console.error('[updateCompanyProfile Error]:', error);
    res.status(500).json({ error: 'Failed to update company profile' });
  }
};

import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if not already configured elsewhere
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
}

export const uploadCompanyImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      res.status(500).json({ error: 'Cloudinary not configured' });
      return;
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'company_images',
      resource_type: 'image'
    });

    // Delete local temp file
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('[uploadCompanyImage Error]:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
