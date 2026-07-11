import { Task, Activity, Status, Priority } from '../types';

const API_BASE = '/api';

interface FetchError extends Error {
  status?: number;
  errors?: { field: string; message: string }[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorData: { message?: string; errors?: { field: string; message: string }[] };
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'An unexpected error occurred' };
    }

    const error: FetchError = new Error(errorData.message || 'API request failed');
    error.status = response.status;
    error.errors = errorData.errors;
    throw error;
  }

  return response.json() as Promise<T>;
}

export const api = {
  async getTasks(filters?: {
    search?: string;
    status?: Status;
    priority?: Priority;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
    }
    const query = params.toString();
    return request<Task[]>(`/tasks${query ? `?${query}` : ''}`);
  },

  async createTask(data: {
    title: string;
    description: string;
    priority: Priority;
    status: Status;
  }): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(
    id: string,
    data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete task' }));
      throw new Error(errorData.message);
    }
  },

  async bulkUpdateStatus(ids: string[], status: Status): Promise<Task[]> {
    return request<Task[]>('/tasks/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    });
  },

  async bulkDelete(ids: string[]): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed bulk delete' }));
      throw new Error(errorData.message);
    }
  },

  async getActivities(): Promise<Activity[]> {
    return request<Activity[]>('/activity');
  },

  exportUrl(format: 'json' | 'csv'): string {
    return `${API_BASE}/tasks/export?format=${format}`;
  },
};
