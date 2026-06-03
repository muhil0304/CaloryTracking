const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Password hashing helper
function hashPassword(password) {
  const salt = 'aaharcal_salt_123!';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Helper to get user ID from request headers
const getUserId = (req) => {
  return req.headers['x-user-id'] || req.query.user_id;
};

function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);

    // Create foods table
    db.run(`
      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        serving_size TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        is_custom INTEGER DEFAULT 0
      )
    `);

    // Create logs table with user_id
    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        food_id INTEGER,
        food_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        date TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(food_id) REFERENCES foods(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (!err) {
        // Try to add user_id column if it doesn't exist (in case table was created previously without it)
        db.run("ALTER TABLE logs ADD COLUMN user_id INTEGER", (alterErr) => {
          // Ignore error if column already exists
        });
      }
    });

    // Check if foods table is empty, if so, pre-populate
    db.get("SELECT COUNT(*) as count FROM foods", (err, row) => {
      if (err) {
        console.error('Error checking foods count:', err.message);
        return;
      }

      if (row.count === 0) {
        const initialFoods = [
          ["Roti", "1 medium", 85, 3, 18, 0.5, 0],
          ["Rice", "1 cup cooked (150g)", 205, 4.2, 44.5, 0.4, 0],
          ["Dal Tadka", "1 bowl (150g)", 150, 7, 20, 4.5, 0],
          ["Paneer Butter Masala", "1 plate (200g)", 350, 12, 14, 28, 0],
          ["Chicken Biryani", "1 plate (300g)", 548, 22, 65, 18, 0],
          ["Masala Dosa", "1 medium", 287, 5.3, 48, 8.4, 0],
          ["Idli", "2 pieces", 116, 3.2, 24, 0.4, 0],
          ["Samosa", "1 piece", 262, 3.5, 32, 13, 0],
          ["Gulab Jamun", "2 pieces", 300, 4, 50, 10, 0],
          ["Chole Bhature", "1 plate (2 bhature + chole)", 550, 12, 75, 22, 0],
          ["Aloo Paratha", "1 medium", 290, 5, 42, 11, 0],
          ["Butter Naan", "1 piece", 310, 8, 48, 10, 0],
          ["Palak Paneer", "1 bowl (200g)", 220, 10, 8, 16, 0],
          ["Tandoori Chicken", "1 piece (150g)", 260, 30, 3, 12, 0],
          ["Medu Vada", "2 pieces", 195, 4.5, 22, 10, 0],
          ["Poha", "1 plate (150g)", 250, 4, 45, 6, 0],
          ["Upma", "1 plate (150g)", 210, 4, 34, 6, 0],
          ["Dhokla", "3 pieces", 160, 6, 28, 3, 0],
          ["Mango Lassi", "1 glass (250ml)", 240, 5, 40, 6, 0],
          ["Masala Chai", "1 cup (150ml)", 90, 2, 14, 3, 0]
        ];

        const stmt = db.prepare("INSERT INTO foods (name, serving_size, calories, protein, carbs, fat, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?)");
        initialFoods.forEach((food) => {
          stmt.run(food, (err) => {
            if (err) console.error(`Error inserting ${food[0]}:`, err.message);
          });
        });
        stmt.finalize(() => {
          console.log('Pre-populated foods table with Indian foods.');
        });
      }
    });
  });
}

// API Endpoints

// POST /api/auth/signup - Register a new user
app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters long." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const hashedPassword = hashPassword(password);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username.trim(), hashedPassword],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "Username is already taken." });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        username: username.trim()
      });
    }
  );
});

// POST /api/auth/login - Authenticate a user
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const hashedPassword = hashPassword(password);

  db.get(
    "SELECT id, username FROM users WHERE username = ? AND password = ?",
    [username.trim(), hashedPassword],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(401).json({ error: "Invalid username or password." });
      }
      res.json(row);
    }
  );
});

// GET /api/foods - Fetch all foods
app.get('/api/foods', (req, res) => {
  db.all("SELECT * FROM foods ORDER BY name ASC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/foods - Add a new custom food
app.post('/api/foods', (req, res) => {
  const { name, serving_size, calories, protein, carbs, fat } = req.body;
  if (!name || !serving_size || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
    return res.status(400).json({ error: "All fields are required." });
  }

  db.run(
    "INSERT INTO foods (name, serving_size, calories, protein, carbs, fat, is_custom) VALUES (?, ?, ?, ?, ?, ?, 1)",
    [name, serving_size, Number(calories), Number(protein), Number(carbs), Number(fat)],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "A food with this name already exists." });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        serving_size,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        is_custom: 1
      });
    }
  );
});

// GET /api/logs - Fetch logs for a specific date
app.get('/api/logs', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  db.all("SELECT * FROM logs WHERE date = ? AND user_id = ? ORDER BY logged_at DESC", [date, userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/logs - Log a food consumption entry
app.post('/api/logs', (req, res) => {
  const { food_id, food_name, quantity, date, calories, protein, carbs, fat } = req.body;
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  if (!food_name || quantity === undefined || !date || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  db.run(
    "INSERT INTO logs (user_id, food_id, food_name, quantity, date, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [userId, food_id || null, food_name, Number(quantity), date, Number(calories), Number(protein), Number(carbs), Number(fat)],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        user_id: userId,
        food_id: food_id || null,
        food_name,
        quantity: Number(quantity),
        date,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat)
      });
    }
  );
});

// DELETE /api/logs/:id - Delete a log entry
app.delete('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  db.run("DELETE FROM logs WHERE id = ? AND user_id = ?", [id, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Log entry not found or unauthorized." });
    }
    res.json({ message: "Log entry deleted successfully." });
  });
});

// GET /api/stats - Get summary stats
app.get('/api/stats', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  db.all(
    "SELECT SUM(calories) as total_calories, SUM(protein) as total_protein, SUM(carbs) as total_carbs, SUM(fat) as total_fat FROM logs WHERE date = ? AND user_id = ?",
    [date, userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const row = rows[0] || {};
      res.json({
        total_calories: row.total_calories || 0,
        total_protein: row.total_protein || 0,
        total_carbs: row.total_carbs || 0,
        total_fat: row.total_fat || 0,
        goals: { calories: 2000, protein: 120, carbs: 250, fat: 65 }
      });
    }
  );
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});