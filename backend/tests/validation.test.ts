import { createTaskSchema, updateTaskSchema } from '../src/middleware/validation';

describe('Validation Schemas', () => {
  describe('createTaskSchema', () => {
    it('should validate correct task inputs', () => {
      const valid = {
        title: 'Valid Task Title',
        description: 'Valid description text.',
        priority: 'high' as const,
        status: 'todo' as const,
      };
      const result = createTaskSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const invalid = {
        title: 'ab',
        priority: 'medium' as const,
        status: 'todo' as const,
      };
      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 3 characters');
      }
    });

    it('should reject invalid priority/status', () => {
      const invalid = {
        title: 'Some valid title',
        priority: 'critical' as any,
        status: 'unknown' as any,
      };
      const result = createTaskSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('should validate partial updates', () => {
      const valid = {
        priority: 'low' as const,
      };
      const result = updateTaskSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
