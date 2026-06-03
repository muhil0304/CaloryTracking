import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { db, initDatabase } from './db';
import { Food, MealLog, DailyGoal } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Zod Validation Schemas
const FoodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  calories: z.number().nonnegative('Calories must be positive'),
  protein: z.number().nonnegative('Protein must be positive'),
  carbs: z.number().nonnegative('Carbs must be positive'),
  fat: z.number().nonnegative('Fat must be positive'),
  serving_size: z.string().min(1, 'Serving size is required'),
});

const LogSchema = z.object({
  food_id: z.number().nullable().optional(),
  food_name: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  serving_size: z.string().min(1),
  servings: z.number().positive('Servings must be greater than 0'),
  meal_type: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snacks']),
  logged_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const GoalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  calories: z.number().positive('Goal must be greater than 0'),
});

// --- API ROUTES ---

// 1. Foods Endpoints
app.get('/api/foods', (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const stmt = db.prepare('SELECT * FROM foods WHERE name LIKE ? ORDER BY is_custom ASC, name ASC');
    const foods = stmt.all(search) as Food[];
    res.json(foods);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/foods', (req, res) => {
  try {
    const parsed = FoodSchema.parse(req.body);
    const stmt = db.prepare(`
      INSERT INTO foods (name, calories, protein, carbs, fat, serving_size, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    const result = stmt.run(
      parsed.name,
      parsed.calories,
      parsed.protein,
      parsed.carbs,
      parsed.fat,
      parsed.serving_size
    );
    res.status(201).json({ id: result.lastInsertRowid, ...parsed, is_custom: 1 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'A food item with this name already exists.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// 2. Logs Endpoints
app.get('/api/logs', (req, res) => {
  try {
    const date = req.query.date as string;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Valid date parameter (YYYY-MM-DD) is required' });
    }
    const stmt = db.prepare('SELECT * FROM logs WHERE logged_date = ? ORDER BY created_at ASC');
    const logs = stmt.all(date) as MealLog[];
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logs', (req, res) => {
  try {
    const parsed = LogSchema.parse(req.body);
    const stmt = db.prepare(`
      INSERT INTO logs (food_id, food_name, calories, protein, carbs, fat, serving_size, servings, meal_type, logged_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      parsed.food_id || null,
      parsed.food_name,
      parsed.calories,
      parsed.protein,
      parsed.carbs,
      parsed.fat,
      parsed.serving_size,
      parsed.servings,
      parsed.meal_type,
      parsed.logged_date
    );
    res.status(201).json({ id: result.lastInsertRowid, ...parsed });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/api/logs/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const stmt = db.prepare('DELETE FROM logs WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Log entry not found' });
    }
    res.json({ success: true, message: 'Log entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Goals Endpoints
app.get('/api/goals', (req, res) => {
  try {
    const date = req.query.date as string;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Valid date parameter (YYYY-MM-DD) is required' });
    }
    const stmt = db.prepare('SELECT * FROM goals WHERE date = ?');
    let goal = stmt.get(date) as DailyGoal | undefined;
    
    // If no goal is set for this date, default to 2000 and save it
    if (!goal) {
      const insertStmt = db.prepare('INSERT INTO goals (date, calories) VALUES (?, ?)');
      insertStmt.run(date, 2000);
      goal = { date, calories: 2000 };
    }
    res.json(goal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/goals', (req, res) => {
  try {
    const parsed = GoalSchema.parse(req.body);
    const stmt = db.prepare(`
      INSERT INTO goals (date, calories)
      VALUES (?, ?)
      ON CONFLICT(date) DO UPDATE SET calories = excluded.calories
    `);
    stmt.run(parsed.date, parsed.calories);
    res.json(parsed);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});