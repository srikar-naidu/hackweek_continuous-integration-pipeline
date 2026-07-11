import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../hooks/useTasks';
import { api } from '../utils/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Task } from '../types';

vi.mock('../utils/api', () => ({
  api: {
    getTasks: vi.fn(),
    getActivities: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    bulkUpdateStatus: vi.fn(),
    bulkDelete: vi.fn(),
  },
}));

describe('useTasks Custom Hook', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-a',
      title: 'Task A',
      description: 'Desc A',
      priority: 'high',
      status: 'todo',
      createdAt: '2026-07-10T12:00:00Z',
      updatedAt: '2026-07-10T12:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getTasks).mockResolvedValue(mockTasks);
    vi.mocked(api.getActivities).mockResolvedValue([]);
  });

  it('should fetch tasks on mount', async () => {
    const { result } = renderHook(() => useTasks());

    // Wait for the asynchronous fetch to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(api.getTasks).toHaveBeenCalled();
    expect(result.current.tasks).toEqual(mockTasks);
  });

  it('should optimistically update task status and rollback on error', async () => {
    vi.mocked(api.updateTask).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTasks());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.tasks[0].status).toBe('todo');

    // Attempt status update which will reject
    await act(async () => {
      try {
        await result.current.updateTask('task-a', { status: 'done' });
      } catch (_err) {
        // expected error
      }
    });

    // Should rollback to original state
    expect(result.current.tasks[0].status).toBe('todo');
    expect(result.current.error).toBe('Network error');
  });
});
