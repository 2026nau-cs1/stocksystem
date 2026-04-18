import { AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

export function getAuthenticatedUserId(req: AuthRequest): string {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized - please log in', 401);
  }
  return userId;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
