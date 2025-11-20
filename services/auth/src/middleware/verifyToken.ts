import { Request, Response, NextFunction } from 'express';
import { auth } from '../firebaseAdmin';

/**
 * Middleware para verificar tokens de Firebase
 * @param req - Express request
 * @param res - Express response
 * @param next - Next function
 */
export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}