import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import { UserRole } from '../types/index.js';

export function authorize(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
      return;
    }

    if (req.user.role === 'ngo' && req.user.ngo_verification_status === 'rejected') {
      res.status(403).json({
        success: false,
        message: 'Your NGO verification was rejected. Please contact support.'
      });
      return;
    }

    next();
  };
}
