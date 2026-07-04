import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, companyName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
       res.status(400).json({ error: 'Email already exists' });
       return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If role is employer, create a company for them too
    let companyId = null;
    if (role === 'EMPLOYER' && companyName) {
      const company = await prisma.company.create({
        data: { name: companyName, isVerified: false }
      });
      companyId = company.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'JOB_SEEKER',
        companyId
      }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, companyId } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
       res.status(401).json({ error: 'Invalid credentials' });
       return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && password !== user.password) {
       res.status(401).json({ error: 'Invalid credentials' });
       return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, companyId: user.companyId } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};
