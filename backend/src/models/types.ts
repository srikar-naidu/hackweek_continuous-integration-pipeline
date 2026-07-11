export type Priority = 'low' | 'medium' | 'high';
export type Status = 'backlog' | 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  taskId?: string;
  taskTitle?: string;
  action: 'create' | 'update' | 'delete' | 'bulk_update' | 'bulk_delete';
  details: string;
  timestamp: string;
}
