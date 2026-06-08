import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// SQLite Database Setup
const db = new sqlite3.Database('calories.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      calories REAL NOT NULL,
      carbs REAL DEFAULT 0,
      protein REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      serving_size TEXT DEFAULT '1 serving'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (food_id) REFERENCES foods(id)
    )
  `);

  // Pre-populate with 20+ common Indian foods if empty
  db.get("SELECT COUNT(*) as count FROM foods", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO foods (name, calories, carbs, protein, fat, serving_size)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const indianFoods = [
        { name: 'Roti', calories: 85, carbs: 18, protein: 3, fat: 0.5, serving_size: '1 medium' },
        { name: 'White Rice', calories: 205, carbs: 45, protein: 4.2, fat: 0.4, serving_size: '1 cup cooked' },
        { name: 'Dal Tadka', calories: 150, carbs: 20, protein: 8, fat: 4, serving_size: '1 cup' },
        { name: 'Paneer Butter Masala', calories: 320, carbs: 12, protein: 14, fat: 24, serving_size: '1 cup' },
        { name: 'Chicken Tikka Masala', calories: 360, carbs: 14, protein: 28, fat: 20, serving_size: '1 cup' },
        { name: 'Idli', calories: 120, carbs: 25, protein: 4, fat: 0.5, serving_size: '2 pieces' },
        { name: 'Sambar', calories: 90, carbs: 12, protein: 4, fat: 3, serving_size: '1 cup' },
        { name: 'Masala Dosa', calories: 250, carbs: 40, protein: 5, fat: 8, serving_size: '1 piece' },
        { name: 'Chole Bhature', calories: 450, carbs: 55, protein: 12, fat: 20, serving_size: '1 plate' },
        { name: 'Aloo Paratha', calories: 210, carbs: 32, protein: 4, fat: 7, serving_size: '1 piece' },
        { name: 'Vegetable Biryani', calories: 220, carbs: 38, protein: 5, fat: 5, serving_size: '1 cup' },
        { name: 'Samosa', calories: 150, carbs: 18, protein: 3, fat: 7.5, serving_size: '1 piece' },
        { name: 'Chai with Milk & Sugar', calories: 75, carbs: 12, protein: 2, fat: 2, serving_size: '1 cup' },
        { name: 'Filter Coffee', calories: 60, carbs: 8, protein: 2, fat: 2, serving_size: '1 cup' },
        { name: 'Gulab Jamun', calories: 150, carbs: 24, protein: 2, fat: 5, serving_size: '1 piece' },
        { name: 'Poha', calories: 180, carbs: 35, protein: 3, fat: 3, serving_size: '1 cup' },
        { name: 'Upma', calories: 190, carbs: 32, protein: 4, fat: 5, serving_size: '1 cup' },
        { name: 'Tandoori Chicken', calories: 150, carbs: 1, protein: 22, fat: 6, serving_size: '100g' },
        { name: 'Palak Paneer', calories: 220, carbs: 10, protein: 12, fat: 16, serving_size: '1 cup' },
        { name: 'Mixed Vegetable Sabzi', calories: 110, carbs: 14, protein: 3, fat: 5, serving_size: '1 cup' },
        { name: 'Curd (Yogurt)', calories: 100, carbs: 6, protein: 5, fat: 4, serving_size: '1 cup' }
      ];
      for (const food of indianFoods) {
        stmt.run(food.name, food.calories, food.carbs, food.protein, food.fat, food.serving_size);
      }
      stmt.finalize();

      // Seed some logs for today
      const today = new Date().toISOString().split('T')[0];
      db.run(`
        INSERT INTO logs (food_id, quantity, date)
        VALUES (1, 2, ?), (3, 1, ?)
      `, [today, today]);
    }
  });
});

// API Routes
app.get('/api/foods', (req, res) => {
  db.all("SELECT * FROM foods ORDER BY name ASC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/foods', (req, res) => {
  const { name, calories, carbs, protein, fat, serving_size } = req.body;
  if (!name || calories === undefined) {
    return res.status(400).json({ error: 'Name and calories are required' });
  }
  const stmt = db.prepare(`
    INSERT INTO foods (name, calories, carbs, protein, fat, serving_size)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    name,
    Number(calories),
    Number(carbs) || 0,
    Number(protein) || 0,
    Number(fat) || 0,
    serving_size || '1 serving',
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        calories: Number(calories),
        carbs: Number(carbs) || 0,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
        serving_size: serving_size || '1 serving'
      });
    }
  );
  stmt.finalize();
});

app.get('/api/logs', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required' });
  }
  const query = `
    SELECT l.id, l.food_id, l.quantity, l.date,
           f.name, f.calories, f.carbs, f.protein, f.fat, f.serving_size
    FROM logs l
    JOIN foods f ON l.food_id = f.id
    WHERE l.date = ?
  `;
  db.all(query, [date], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedLogs = rows.map(row => ({
      id: row.id,
      food_id: row.food_id,
      quantity: row.quantity,
      date: row.date,
      food: {
        id: row.food_id,
        name: row.name,
        calories: row.calories,
        carbs: row.carbs,
        protein: row.protein,
        fat: row.fat,
        serving_size: row.serving_size
      }
    }));
    res.json(formattedLogs);
  });
});

app.post('/api/logs', (req, res) => {
  const { food_id, quantity, date } = req.body;
  if (!food_id || !quantity || !date) {
    return res.status(400).json({ error: 'food_id, quantity, and date are required' });
  }
  db.get("SELECT * FROM foods WHERE id = ?", [Number(food_id)], (err, food) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    const stmt = db.prepare(`
      INSERT INTO logs (food_id, quantity, date)
      VALUES (?, ?, ?)
    `);
    stmt.run(Number(food_id), Number(quantity), date, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        food_id: Number(food_id),
        quantity: Number(quantity),
        date,
        food
      });
    });
    stmt.finalize();
  });
});

app.delete('/api/logs/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run("DELETE FROM logs WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.status(204).end();
  });
});

// Serve static files in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});