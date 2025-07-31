import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest } from 'next';
import { prisma } from './db';

export interface JWTPayload {
  id: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyTokenString(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyToken(req: NextApiRequest) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  const payload = verifyTokenString(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id }
  });

  return user;
}
