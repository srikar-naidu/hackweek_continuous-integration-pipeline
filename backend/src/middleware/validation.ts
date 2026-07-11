import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required',
    })
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .default(''),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' }),
  }),
  status: z.enum(['backlog', 'todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: 'Status must be backlog, todo, in_progress, or done' }),
  }),
});

export const updateTaskSchema = createTaskSchema.partial();

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one task ID must be provided'),
  status: z.enum(['backlog', 'todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: 'Status must be backlog, todo, in_progress, or done' }),
  }),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one task ID must be provided'),
});

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
};
