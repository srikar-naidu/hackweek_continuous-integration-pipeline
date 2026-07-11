import express, { Express } from 'express';
import cors from 'cors';
import tasksRouter from './routes/tasks';
import activityRouter from './routes/activity';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/activity', activityRouter);

// Base health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;
