import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { db } from '../config/database.js';
import { AuthUserContext } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthUserContext;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: number };
    
    const userRow = db.get<any>(`
      SELECT u.id, u.email, u.full_name, u.role, u.status,
             n.verification_status as ngo_verification_status
      FROM users u
      LEFT JOIN ngo_profiles n ON u.id = n.user_id
      WHERE u.id = ?
    `, decoded.id);

    if (!userRow) {
      res.status(401).json({ success: false, message: 'User account not found.' });
      return;
    }

    if (userRow.status === 'suspended') {
      res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
      return;
    }

    req.user = {
      id: userRow.id,
      email: userRow.email,
      full_name: userRow.full_name,
      role: userRow.role,
      status: userRow.status,
      ngo_verification_status: userRow.ngo_verification_status
    };

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
}
