import request from 'supertest';
import app from '../src/server';
import { db } from '../src/models/db';

describe('Tasks API Endpoints', () => {
  beforeEach(() => {
    // Reset database to a clean seed state before each test
    db.reset();
    db.createTask({
      title: 'Initial Seed Task 1',
      description: 'First description',
      priority: 'high',
      status: 'todo',
    });
    db.createTask({
      title: 'Initial Seed Task 2',
      description: 'Second description',
      priority: 'low',
      status: 'in_progress',
    });
  });

  describe('GET /health', () => {
    it('should return 200 ok status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /api/tasks', () => {
    it('should fetch all tasks, sorted by date', async () => {
      const response = await request(app).get('/api/tasks');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Initial Seed Task 2'); // Created second, sorted first
    });

    it('should search and filter tasks', async () => {
      const response = await request(app).get('/api/tasks?search=Seed&priority=high&status=todo');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Initial Seed Task 1');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by id', async () => {
      const tasks = db.getTasks();
      const targetId = tasks[0].id;

      const response = await request(app).get(`/api/tasks/${targetId}`);
      expect(response.status).toBe(200);
      expect(response.body.title).toBe(tasks[0].title);
    });

    it('should return 404 if task not found', async () => {
      const response = await request(app).get('/api/tasks/task-invalid');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Task not found');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a task when input is valid', async () => {
      const payload = {
        title: 'New API Task',
        description: 'Creating task via supertest',
        priority: 'medium',
        status: 'todo',
      };

      const response = await request(app).post('/api/tasks').send(payload);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New API Task');
    });

    it('should return 400 validation error if title is short', async () => {
      const payload = {
        title: 'ab',
        priority: 'medium',
        status: 'todo',
      };

      const response = await request(app).post('/api/tasks').send(payload);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0].field).toBe('title');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task when input is valid', async () => {
      const tasks = db.getTasks();
      const targetId = tasks[0].id;
      const payload = {
        status: 'done',
        priority: 'high',
      };

      const response = await request(app).put(`/api/tasks/${targetId}`).send(payload);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('done');
      expect(response.body.priority).toBe('high');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task by id', async () => {
      const tasks = db.getTasks();
      const targetId = tasks[0].id;

      const response = await request(app).delete(`/api/tasks/${targetId}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const checkResponse = await request(app).get(`/api/tasks/${targetId}`);
      expect(checkResponse.status).toBe(404);
    });
  });

  describe('POST /api/tasks/bulk-update', () => {
    it('should update status in bulk', async () => {
      const tasks = db.getTasks();
      const ids = tasks.map((t) => t.id);

      const response = await request(app)
        .post('/api/tasks/bulk-update')
        .send({ ids, status: 'done' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].status).toBe('done');
      expect(response.body[1].status).toBe('done');
    });
  });

  describe('POST /api/tasks/bulk-delete', () => {
    it('should delete tasks in bulk', async () => {
      const tasks = db.getTasks();
      const ids = tasks.map((t) => t.id);

      const response = await request(app).post('/api/tasks/bulk-delete').send({ ids });
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const checkResponse = await request(app).get('/api/tasks');
      expect(checkResponse.body.length).toBe(0);
    });
  });

  describe('GET /api/tasks/export', () => {
    it('should export tasks as JSON by default', async () => {
      const response = await request(app).get('/api/tasks/export');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should export tasks as CSV when requested', async () => {
      const response = await request(app).get('/api/tasks/export?format=csv');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('ID,Title,Description,Priority,Status,CreatedAt,UpdatedAt');
    });
  });
});
