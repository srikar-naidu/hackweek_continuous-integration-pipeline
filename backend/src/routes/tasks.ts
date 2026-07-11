import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../models/db';
import { Status, Priority } from '../models/types';
import {
  createTaskSchema,
  updateTaskSchema,
  bulkUpdateStatusSchema,
  bulkDeleteSchema,
  validateRequest,
} from '../middleware/validation';

const router = Router();

// GET /api/tasks/export (Export CSV or JSON)
router.get('/export', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    const tasks = db.getTasks();

    if (format === 'csv') {
      const headers = [
        'ID',
        'Title',
        'Description',
        'Priority',
        'Status',
        'CreatedAt',
        'UpdatedAt',
      ];
      const rows = tasks.map((t) => [
        t.id,
        t.title.replace(/"/g, "''"),
        t.description.replace(/"/g, "''"),
        t.priority,
        t.status,
        t.createdAt,
        t.updatedAt,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((val) => `'${val}'`).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
      res.status(200).send(csvContent);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=tasks.json');
      res.status(200).json(tasks);
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks (List with filters)
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as Status | undefined;
    const priority = req.query.priority as Priority | undefined;

    const tasks = db.getTasks({ search, status, priority });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id (Single task)
router.get('/:id', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const task = db.getTaskById(req.params.id);
    if (!task) {
      res.status(404).json({ status: 'error', message: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks (Create)
router.post(
  '/',
  validateRequest(createTaskSchema),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const task = db.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/tasks/:id (Update)
router.put(
  '/:id',
  validateRequest(updateTaskSchema),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const task = db.updateTask(req.params.id, req.body);
      if (!task) {
        res.status(404).json({ status: 'error', message: 'Task not found' });
        return;
      }
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/tasks/:id (Delete)
router.delete('/:id', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const deleted = db.deleteTask(req.params.id);
    if (!deleted) {
      res.status(404).json({ status: 'error', message: 'Task not found' });
      return;
    }
    res.status(200).json({ status: 'success', message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks/bulk-update (Bulk update status)
router.post(
  '/bulk-update',
  validateRequest(bulkUpdateStatusSchema),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { ids, status } = req.body;
      const updated = db.bulkUpdateStatus(ids, status);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/tasks/bulk-delete (Bulk delete tasks)
router.post(
  '/bulk-delete',
  validateRequest(bulkDeleteSchema),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { ids } = req.body;
      const success = db.bulkDelete(ids);
      if (!success) {
        res.status(400).json({ status: 'error', message: 'No tasks were deleted' });
        return;
      }
      res.status(200).json({ status: 'success', message: 'Tasks deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
