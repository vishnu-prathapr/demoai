import express from 'express';
import cors from 'cors';
import Todo from './models/Todo.js';
import { connectDB } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

// Make sure the database is connected before any route runs.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Express 5 forwards errors from async handlers to this middleware automatically.
app.get('/api/todos', async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const todo = await Todo.create({ title });
  res.status(201).json(todo);
});

app.patch('/api/todos/:id', async (req, res) => {
  const update = {};
  if (typeof req.body.title === 'string') update.title = req.body.title.trim();
  if (typeof req.body.completed === 'boolean') update.completed = req.body.completed;

  const todo = await Todo.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!todo) return res.status(404).json({ error: 'todo not found' });
  res.json(todo);
});

app.delete('/api/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).json({ error: 'todo not found' });
  res.status(204).end();
});

// Last-resort error handler: bad ids become 400, everything else 500.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.name === 'CastError' ? 400 : 500;
  res.status(status).json({ error: err.message });
});

export default app;
