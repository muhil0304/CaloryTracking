const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Helper functions for DB operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const defaultFoods = [
  { name: 'Roti', calories: 85, protein: 3, carbs: 18, fat: 0.5, serving_size: '1 piece' },
  { name: 'Butter Naan', calories: 310, protein: 8, carbs: 48, fat: 10, serving_size: '1 piece' },
  { name: 'Basmati Rice', calories: 205, protein: 4.2, carbs: 44.5, fat: 0.4, serving_size: '1 cup cooked' },
  { name: 'Dal Tadka', calories: 150, protein: 7, carbs: 22, fat: 4, serving_size: '1 bowl' },
  { name: 'Paneer Butter Masala', calories: 320, protein: 12, carbs: 10, fat: 26, serving_size: '1 cup' },
  { name: 'Chicken Biryani', calories: 480, protein: 22, carbs: 54, fat: 18, serving_size: '1 plate' },
  { name: 'Idli', calories: 120, protein: 4, carbs: 24, fat: 0.5, serving_size: '2 pieces' },
  { name: 'Masala Dosa', calories: 250, protein: 5, carbs: 38, fat: 8, serving_size: '1 piece' },
  { name: 'Samosa', calories: 260, protein: 4, carbs: 32, fat: 12, serving_size: '1 piece' },
  { name: 'Gulab Jamun', calories: 300, protein: 4, carbs: 50, fat: 10, serving_size: '2 pieces' },
  { name: 'Chole Bhature', calories: 450, protein: 12, carbs: 58, fat: 19, serving_size: '1 plate' },
  { name: 'Palak Paneer', calories: 240, protein: 10, carbs: 8, fat: 18, serving_size: '1 cup' },
  { name: 'Aloo Gobhi', calories: 120, protein: 3, carbs: 15, fat: 5, serving_size: '1 cup' },
  { name: 'Chicken Tikka Masala', calories: 350, protein: 28, carbs: 12, fat: 20, serving_size: '1 cup' },
  { name: 'Medu Vada', calories: 190, protein: 5, carbs: 22, fat: 9, serving_size: '2 pieces' },
  { name: 'Sambhar', calories: 90, protein: 3, carbs: 14, fat: 2, serving_size: '1 bowl' },
  { name: 'Upma', calories: 180, protein: 4, carbs: 30, fat: 4, serving_size: '1 cup' },
  { name: 'Poha', calories: 180, protein: 3, carbs: 35, fat: 3, serving_size: '1 cup' },
  { name: 'Dhokla', calories: 120, protein: 4, carbs: 20, fat: 3, serving_size: '2 pieces' },
  { name: 'Tandoori Chicken', calories: 220, protein: 30, carbs: 3, fat: 9, serving_size: '1 piece' },
  { name: 'Rajma Chawal', calories: 420, protein: 14, carbs: 68, fat: 10, serving_size: '1 plate' },
  { name: 'Butter Chicken', calories: 380, protein: 24, carbs: 10, fat: 28, serving_size: '1 cup' },
  { name: 'Fish Curry', calories: 220, protein: 20, carbs: 8, fat: 12, serving_size: '1 cup' },
  { name: 'Gajar Ka Halwa', calories: 280, protein: 5, carbs: 42, fat: 11, serving_size: '1 bowl' },
  { name: 'Rasgulla', calories: 180, protein: 4, carbs: 38, fat: 2, serving_size: '2 pieces' },
  { name: 'Pav Bhaji', calories: 400, protein: 9, carbs: 56, fat: 16, serving_size: '1 plate' },
  { name: 'Vegetable Pulao', calories: 220, protein: 4, carbs: 42, fat: 4, serving_size: '1 cup' },
  { name: 'Moong Dal Halwa', calories: 350, protein: 6, carbs: 45, fat: 16, serving_size: '1 bowl' },
  { name: 'Egg Curry', calories: 210, protein: 12, carbs: 6, fat: 15, serving_size: '1 cup' },
  { name: 'Masala Chai', calories: 90, protein: 2, carbs: 12, fat: 3, serving_size: '1 cup' }
];

async function initializeDatabase() {
  try {
    // Create foods table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL,
        serving_size TEXT
      )
    `);

    // Create logs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_name TEXT,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL,
        meal_type TEXT,
        quantity REAL,
        date TEXT
      )
    `);

    // Create goals table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL
      )
    `);

    // Check if foods table is empty, if so, populate it
    const foodCount = await dbGet('SELECT COUNT(*) as count FROM foods');
    if (foodCount.count === 0) {
      console.log('Populating default Indian foods...');
      const insertStmt = db.prepare('INSERT INTO foods (name, calories, protein, carbs, fat, serving_size) VALUES (?, ?, ?, ?, ?, ?)');
      for (const food of defaultFoods) {
        insertStmt.run(food.name, food.calories, food.protein, food.carbs, food.fat, food.serving_size);
      }
      insertStmt.finalize();
      console.log('Default Indian foods populated successfully.');
    }

    // Check if goals table is empty, if so, populate default goals
    const goalCount = await dbGet('SELECT COUNT(*) as count FROM goals');
    if (goalCount.count === 0) {
      await dbRun('INSERT INTO goals (calories, protein, carbs, fat) VALUES (?, ?, ?, ?)', [2000, 120, 230, 65]);
      console.log('Default goals populated.');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// API Endpoints

// GET /api/foods: Search and list available Indian foods
app.get('/api/foods', async (req, res) => {
  try {
    const search = req.query.q || '';
    let foods;
    if (search) {
      foods = await dbAll('SELECT * FROM foods WHERE name LIKE ? ORDER BY name ASC', [`%${search}%`]);
    } else {
      foods = await dbAll('SELECT * FROM foods ORDER BY name ASC');
    }
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/foods: Add a new custom food item to the database
app.post('/api/foods', async (req, res) => {
  const { name, calories, protein, carbs, fat, serving_size } = req.body;
  if (!name || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await dbRun(
      'INSERT INTO foods (name, calories, protein, carbs, fat, serving_size) VALUES (?, ?, ?, ?, ?, ?)',
      [name, calories, protein, carbs, fat, serving_size || '1 serving']
    );
    res.status(201).json({
      id: result.lastID,
      name,
      calories,
      protein,
      carbs,
      fat,
      serving_size: serving_size || '1 serving'
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Food item with this name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs?date=YYYY-MM-DD: Get all food logs for a specific date
app.get('/api/logs', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD)' });
  }
  try {
    const logs = await dbAll('SELECT * FROM logs WHERE date = ?', [date]);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs: Log a food item (with quantity/servings)
app.post('/api/logs', async (req, res) => {
  const { food_name, calories, protein, carbs, fat, meal_type, quantity, date } = req.body;
  if (!food_name || calories === undefined || meal_type === undefined || quantity === undefined || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await dbRun(
      'INSERT INTO logs (food_name, calories, protein, carbs, fat, meal_type, quantity, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [food_name, calories, protein || 0, carbs || 0, fat || 0, meal_type, quantity, date]
    );
    res.status(201).json({
      id: result.lastID,
      food_name,
      calories,
      protein,
      carbs,
      fat,
      meal_type,
      quantity,
      date
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/logs/:id: Delete a logged food item
app.delete('/api/logs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await dbRun('DELETE FROM logs WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Log entry not found' });
    }
    res.json({ message: 'Log entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/goals: Get current daily goals
app.get('/api/goals', async (req, res) => {
  try {
    const goal = await dbGet('SELECT * FROM goals ORDER BY id DESC LIMIT 1');
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals: Update daily goals
app.post('/api/goals', async (req, res) => {
  const { calories, protein, carbs, fat } = req.body;
  if (calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const goalCount = await dbGet('SELECT COUNT(*) as count FROM goals');
    if (goalCount.count === 0) {
      await dbRun('INSERT INTO goals (calories, protein, carbs, fat) VALUES (?, ?, ?, ?)', [calories, protein, carbs, fat]);
    } else {
      await dbRun('UPDATE goals SET calories = ?, protein = ?, carbs = ?, fat = ? WHERE id = (SELECT id FROM goals ORDER BY id DESC LIMIT 1)', [calories, protein, carbs, fat]);
    }
    const updatedGoal = await dbGet('SELECT * FROM goals ORDER BY id DESC LIMIT 1');
    res.json(updatedGoal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/weekly: Get daily calorie totals for the last 7 days for charting
app.get('/api/stats/weekly', async (req, res) => {
  try {
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      // Format as YYYY-MM-DD in local time
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const result = await dbGet('SELECT SUM(calories * quantity) as total_calories FROM logs WHERE date = ?', [dateStr]);
      stats.push({
        date: dateStr,
        calories: Math.round(result.total_calories || 0)
      });
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});