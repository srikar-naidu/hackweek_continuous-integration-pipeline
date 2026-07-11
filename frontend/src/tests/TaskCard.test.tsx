import { render, screen } from '@testing-library/react';
import { TaskCard } from '../components/TaskCard';
import { Task } from '../types';
import { vi, describe, it, expect } from 'vitest';

describe('TaskCard Component', () => {
  const task: Task = {
    id: 'task-123',
    title: 'Test Component Task',
    description: 'Component testing description',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-07-10T12:00:00Z',
    updatedAt: '2026-07-10T12:00:00Z',
  };

  it('renders task details correctly', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();
    const onSelectToggle = vi.fn();

    render(
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        isSelected={false}
        onSelectToggle={onSelectToggle}
      />
    );

    expect(screen.getByText('Test Component Task')).toBeInTheDocument();
    expect(screen.getByText('Component testing description')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });
});
