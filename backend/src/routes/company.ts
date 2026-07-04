import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getCompanyProfile, updateCompanyProfile, uploadCompanyImage } from '../controllers/company.controller';
import { authenticate } from '../middleware/auth';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'company-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

export const companyRouter = Router();

companyRouter.get('/:id', getCompanyProfile);
companyRouter.put('/:id', authenticate, updateCompanyProfile);
companyRouter.post('/:id/image', authenticate, upload.single('image'), uploadCompanyImage);
