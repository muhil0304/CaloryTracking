const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'dist')));

// Connect to SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // Create Foods table
    db.run(`
      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        serving_size TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL
      )
    `);

    // Create Logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_id INTEGER,
        food_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        date TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create Goals table
    db.run(`
      CREATE TABLE IF NOT EXISTS goals (
        user_id INTEGER PRIMARY KEY,
        calories REAL NOT NULL DEFAULT 2000,
        protein REAL NOT NULL DEFAULT 120,
        carbs REAL NOT NULL DEFAULT 250,
        fat REAL NOT NULL DEFAULT 65,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Seed Indian Foods if empty
    db.get("SELECT COUNT(*) as count FROM foods", (err, row) => {
      if (err) {
        console.error("Error checking foods count:", err.message);
        return;
      }
      if (row.count === 0) {
        const stmt = db.prepare(`
          INSERT INTO foods (name, serving_size, calories, protein, carbs, fat)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const defaultFoods = [
          ["Roti", "1 piece", 85, 3, 18, 0.5],
          ["Rice (Cooked)", "1 cup", 205, 4, 44, 0.4],
          ["Dal Tadka", "1 bowl", 150, 8, 20, 4],
          ["Paneer Butter Masala", "1 plate", 350, 12, 10, 28],
          ["Chicken Tikka Masala", "1 plate", 400, 30, 12, 25],
          ["Samosa", "1 piece", 250, 4, 32, 12],
          ["Idli", "2 pieces", 120, 4, 25, 0.5],
          ["Dosa (Plain)", "1 piece", 165, 4, 29, 3.5],
          ["Chole Bhature", "1 plate", 450, 12, 55, 20],
          ["Mixed Veg Curry", "1 bowl", 120, 3, 15, 6],
          ["Alu Paratha", "1 piece", 290, 6, 45, 10],
          ["Gulab Jamun", "2 pieces", 300, 4, 50, 10],
          ["Greek Yogurt", "1 cup", 130, 15, 6, 4],
          ["Boiled Egg", "1 large", 78, 6, 0.6, 5],
          ["Apple", "1 medium", 95, 0.5, 25, 0.3],
          ["Banana", "1 medium", 105, 1.3, 27, 0.3]
        ];
        for (const food of defaultFoods) {
          stmt.run(food);
        }
        stmt.finalize();
        console.log("Seeded default Indian foods.");
      }
    });
  });
}

// Auth APIs
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists.' });
        }
        return res.status(500).json({ error: err.message });
      }
      const userId = this.lastID;
      // Create default goals for the user
      db.run(
        'INSERT INTO goals (user_id, calories, protein, carbs, fat) VALUES (?, 2000, 120, 250, 65)',
        [userId],
        (goalErr) => {
          if (goalErr) {
            console.error('Error creating default goals:', goalErr.message);
          }
          res.status(201).json({ message: 'User registered successfully.', userId });
        }
      );
    }
  );
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.get(
    'SELECT id, username, password FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }
      res.json({
        user: {
          id: user.id,
          username: user.username
        }
      });
    }
  );
});

// Foods APIs
app.get('/api/foods', (req, res) => {
  db.all('SELECT * FROM foods ORDER BY name ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/foods', (req, res) => {
  const { name, serving_size, calories, protein, carbs, fat } = req.body;
  if (!name || !serving_size) {
    return res.status(400).json({ error: 'Name and serving size are required.' });
  }

  db.run(
    `INSERT INTO foods (name, serving_size, calories, protein, carbs, fat)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      name,
      serving_size,
      parseFloat(calories) || 0,
      parseFloat(protein) || 0,
      parseFloat(carbs) || 0,
      parseFloat(fat) || 0
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        serving_size,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0
      });
    }
  );
});

// Logs APIs
app.get('/api/logs', (req, res) => {
  const { date, userId } = req.query;
  if (!date || !userId) {
    return res.status(400).json({ error: 'Date and userId are required.' });
  }

  db.all(
    'SELECT * FROM logs WHERE date = ? AND user_id = ? ORDER BY id DESC',
    [date, userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.post('/api/logs', (req, res) => {
  const {
    user_id,
    food_id,
    food_name,
    quantity,
    date,
    calories,
    protein,
    carbs,
    fat
  } = req.body;

  if (!user_id || !food_name || !quantity || !date) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  db.run(
    `INSERT INTO logs (user_id, food_id, food_name, quantity, date, calories, protein, carbs, fat)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      food_id || null,
      food_name,
      parseFloat(quantity),
      date,
      parseFloat(calories) || 0,
      parseFloat(protein) || 0,
      parseFloat(carbs) || 0,
      parseFloat(fat) || 0
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        user_id,
        food_id,
        food_name,
        quantity,
        date,
        calories,
        protein,
        carbs,
        fat
      });
    }
  );
});

app.delete('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM logs WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Log deleted successfully.', deletedCount: this.changes });
  });
});

// Stats & Goals APIs
app.get('/api/stats', (req, res) => {
  const { date, userId } = req.query;
  if (!date || !userId) {
    return res.status(400).json({ error: 'Date and userId are required.' });
  }

  // Get daily totals
  db.get(
    `SELECT 
      SUM(calories * quantity) as total_calories,
      SUM(protein * quantity) as total_protein,
      SUM(carbs * quantity) as total_carbs,
      SUM(fat * quantity) as total_fat
     FROM logs 
     WHERE date = ? AND user_id = ?`,
    [date, userId],
    (err, totals) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get user goals
      db.get(
        'SELECT calories, protein, carbs, fat FROM goals WHERE user_id = ?',
        [userId],
        (goalErr, goals) => {
          if (goalErr) {
            return res.status(500).json({ error: goalErr.message });
          }

          const defaultGoals = { calories: 2000, protein: 120, carbs: 250, fat: 65 };
          const userGoals = goals || defaultGoals;

          res.json({
            total_calories: Math.round(totals?.total_calories || 0),
            total_protein: Math.round(totals?.total_protein || 0),
            total_carbs: Math.round(totals?.total_carbs || 0),
            total_fat: Math.round(totals?.total_fat || 0),
            goals: {
              calories: userGoals.calories,
              protein: userGoals.protein,
              carbs: userGoals.carbs,
              fat: userGoals.fat
            }
          });
        }
      );
    }
  );
});

// Support multiple endpoints for updating goals to be safe
const updateGoalsHandler = (req, res) => {
  const { userId, calories, protein, carbs, fat } = req.body;
  const uId = userId || req.params.userId || req.query.userId;

  if (!uId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  db.run(
    `INSERT INTO goals (user_id, calories, protein, carbs, fat)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
      calories = excluded.calories,
      protein = excluded.protein,
      carbs = excluded.carbs,
      fat = excluded.fat`,
    [
      uId,
      parseFloat(calories) || 2000,
      parseFloat(protein) || 120,
      parseFloat(carbs) || 250,
      parseFloat(fat) || 65
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        message: 'Goals updated successfully.',
        goals: {
          calories: parseFloat(calories) || 2000,
          protein: parseFloat(protein) || 120,
          carbs: parseFloat(carbs) || 250,
          fat: parseFloat(fat) || 65
        }
      });
    }
  );
};

app.post('/api/goals', updateGoalsHandler);
app.put('/api/goals', updateGoalsHandler);
app.post('/api/goals/:userId', updateGoalsHandler);
app.put('/api/goals/:userId', updateGoalsHandler);

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});