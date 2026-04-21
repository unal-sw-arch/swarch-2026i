import type { RequestHandler } from 'express';
import { AppError } from '../core/errors/AppError';
import { GatewayErrorCode } from '../core/errors/error-codes';
import type { UserRole } from '../shared/constants/roles';

export const roleMiddleware = (...allowedRoles: readonly UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (allowedRoles.length === 0) {
      next();
      return;
    }

    const role = req.context?.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      throw new AppError(GatewayErrorCode.FORBIDDEN, 'Forbidden: insufficient role', 403);
    }

    next();
  };
};
