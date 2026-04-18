import { Router, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { portfolioRepository } from '../repositories/portfolio';
import { insertPortfolioHoldingSchema, updatePortfolioHoldingSchema } from '../db/schema';
import { getAuthenticatedUserId, getErrorMessage } from '../utils/route';

const router = Router();

// Get all holdings
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const holdings = await portfolioRepository.getByUser(userId);
    res.json({ success: true, data: holdings });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch holdings' });
  }
});

// Create holding
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const validated = insertPortfolioHoldingSchema.parse({ ...req.body, userId });
    const holding = await portfolioRepository.create(validated);
    res.status(201).json({ success: true, data: holding });
  } catch (error: unknown) {
    const msg = getErrorMessage(error, 'Failed to create holding');
    res.status(400).json({ success: false, message: msg });
  }
});

// Update holding
router.put('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const id = req.params.id as string;
    const validated = updatePortfolioHoldingSchema.parse(req.body);
    const holding = await portfolioRepository.update(id, userId, validated);
    if (!holding) return res.status(404).json({ success: false, message: 'Holding not found' });
    res.json({ success: true, data: holding });
  } catch (error: unknown) {
    const msg = getErrorMessage(error, 'Failed to update holding');
    res.status(400).json({ success: false, message: msg });
  }
});

// Delete holding
router.delete('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const id = req.params.id as string;
    const deleted = await portfolioRepository.delete(id, userId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Holding not found' });
    res.json({ success: true, data: null });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete holding' });
  }
});

export default router;
