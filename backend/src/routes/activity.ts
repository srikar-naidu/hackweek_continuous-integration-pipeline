import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../models/db';

const router = Router();

// GET /api/activity
router.get('/', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const activities = db.getActivities();
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
});

export default router;
