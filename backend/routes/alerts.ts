import { Router, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { alertRepository } from '../repositories/alerts';
import { insertAlertSchema, updateAlertSchema } from '../db/schema';
import { getAuthenticatedUserId, getErrorMessage } from '../utils/route';

const router = Router();

// Get all alerts
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const alertList = await alertRepository.getByUser(userId);
    res.json({ success: true, data: alertList });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
});

// Create alert
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const validated = insertAlertSchema.parse({ ...req.body, userId });
    const alert = await alertRepository.create(validated);
    res.status(201).json({ success: true, data: alert });
  } catch (error: unknown) {
    const msg = getErrorMessage(error, 'Failed to create alert');
    res.status(400).json({ success: false, message: msg });
  }
});

// Update alert (status, conditions)
router.put('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const id = req.params.id as string;
    const validated = updateAlertSchema.parse(req.body);
    const alert = await alertRepository.update(id, userId, validated);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (error: unknown) {
    const msg = getErrorMessage(error, 'Failed to update alert');
    res.status(400).json({ success: false, message: msg });
  }
});

// Delete alert
router.delete('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const id = req.params.id as string;
    const deleted = await alertRepository.delete(id, userId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: null });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete alert' });
  }
});

// Get alert history
router.get('/history', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const history = await alertRepository.getHistory(userId);
    res.json({ success: true, data: history });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch alert history' });
  }
});

export default router;
