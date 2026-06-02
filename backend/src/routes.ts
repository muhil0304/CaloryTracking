import { Router, Request, Response } from 'express';
import { getDb } from './db';

const router = Router();

// GET /api/foods - Get all foods with optional search and category filter
router.get('/foods', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const search = req.query.search ? `%${req.query.search}%` : null;
    const category = req.query.category as string | undefined;

    let query = 'SELECT * FROM foods';
    const params: any[] = [];

    const conditions: string[] = [];
    if (search) {
      conditions.push('name LIKE ?');
      params.push(search);
    }
    if (category && category !== 'All') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY is_custom DESC, name ASC';

    const foods = await db.all(query, params);
    res.json(foods);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/foods - Add a custom food
router.post('/foods', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { name, calories, protein, carbs, fat, serving_size, serving_unit, category } = req.body;

    if (!name || calories === undefined || protein === undefined || carbs === undefined || fat === undefined || !serving_size || !serving_unit || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.run(
      `INSERT INTO foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, calories, protein, carbs, fat, serving_size, serving_unit, category]
    );

    const newFood = await db.get('SELECT * FROM foods WHERE id = ?', result.lastID);
    res.status(201).json(newFood);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/logs - Get logs for a specific date
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const date = req.query.date as string;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD)' });
    }

    const logs = await db.all(
      `SELECT ml.id, ml.food_id, ml.meal_type, ml.servings, ml.log_date,
              f.name, f.calories, f.protein, f.carbs, f.fat, f.serving_size, f.serving_unit, f.category
       FROM meal_logs ml
       JOIN foods f ON ml.food_id = f.id
       WHERE ml.log_date = ?
       ORDER BY ml.id ASC`,
      [date]
    );

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/logs - Log a food item
router.post('/logs', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { food_id, meal_type, servings, log_date } = req.body;

    if (!food_id || !meal_type || servings === undefined || !log_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.run(
      `INSERT INTO meal_logs (food_id, meal_type, servings, log_date)
       VALUES (?, ?, ?, ?)`,
      [food_id, meal_type, servings, log_date]
    );

    const newLog = await db.get(
      `SELECT ml.id, ml.food_id, ml.meal_type, ml.servings, ml.log_date,
              f.name, f.calories, f.protein, f.carbs, f.fat, f.serving_size, f.serving_unit, f.category
       FROM meal_logs ml
       JOIN foods f ON ml.food_id = f.id
       WHERE ml.id = ?`,
      result.lastID
    );

    res.status(201).json(newLog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/logs/:id - Update a log's servings
router.put('/logs/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { servings } = req.body;

    if (servings === undefined || servings <= 0) {
      return res.status(400).json({ error: 'Valid servings value is required' });
    }

    await db.run(
      'UPDATE meal_logs SET servings = ? WHERE id = ?',
      [servings, id]
    );

    const updatedLog = await db.get(
      `SELECT ml.id, ml.food_id, ml.meal_type, ml.servings, ml.log_date,
              f.name, f.calories, f.protein, f.carbs, f.fat, f.serving_size, f.serving_unit, f.category
       FROM meal_logs ml
       JOIN foods f ON ml.food_id = f.id
       WHERE ml.id = ?`,
      id
    );

    if (!updatedLog) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json(updatedLog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/logs/:id - Delete a log
router.delete('/logs/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const result = await db.run('DELETE FROM meal_logs WHERE id = ?', id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json({ success: true, message: 'Log deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/goals - Get current goals
router.get('/goals', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const goals = await db.get('SELECT calories, protein, carbs, fat FROM goals WHERE id = 1');
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/goals - Update goals
router.put('/goals', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { calories, protein, carbs, fat } = req.body;

    if (calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.run(
      `UPDATE goals
       SET calories = ?, protein = ?, carbs = ?, fat = ?
       WHERE id = 1`,
      [calories, protein, carbs, fat]
    );

    const updatedGoals = await db.get('SELECT calories, protein, carbs, fat FROM goals WHERE id = 1');
    res.json(updatedGoals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;