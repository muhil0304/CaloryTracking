const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const dbPath = path.join(__dirname, 'database.db');
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
    // Create foods table
    db.run(`
      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        servingSize TEXT NOT NULL,
        category TEXT DEFAULT 'General'
      )
    `);

    // Create logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        foodId INTEGER NOT NULL,
        quantity REAL NOT NULL,
        mealType TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (foodId) REFERENCES foods(id)
      )
    `);

    // Seed foods if empty
    db.get("SELECT COUNT(*) as count FROM foods", [], (err, row) => {
      if (err) {
        console.error(err);
        return;
      }
      if (row.count === 0) {
        const seedFoods = [
          { name: 'Butter Chicken', calories: 350, protein: 22, carbs: 8, fat: 25, servingSize: '1 bowl (250g)', category: 'Curry' },
          { name: 'Paneer Tikka', calories: 280, protein: 15, carbs: 6, fat: 22, servingSize: '1 plate (6 pieces)', category: 'Starter' },
          { name: 'Masala Dosa', calories: 320, protein: 6, carbs: 55, fat: 8, servingSize: '1 piece', category: 'Breakfast' },
          { name: 'Idli', calories: 120, protein: 4, carbs: 25, fat: 0.5, servingSize: '2 pieces', category: 'Breakfast' },
          { name: 'Roti / Chapati', calories: 85, protein: 3, carbs: 18, fat: 0.5, servingSize: '1 piece', category: 'Bread' },
          { name: 'Dal Tadka', calories: 150, protein: 7, carbs: 20, fat: 4, servingSize: '1 bowl (150g)', category: 'Curry' },
          { name: 'Chicken Biryani', calories: 450, protein: 25, carbs: 55, fat: 12, servingSize: '1 plate (300g)', category: 'Rice' },
          { name: 'Samosa', calories: 250, protein: 4, carbs: 32, fat: 12, servingSize: '1 piece', category: 'Snack' },
          { name: 'Gulab Jamun', calories: 300, protein: 4, carbs: 50, fat: 10, servingSize: '2 pieces', category: 'Dessert' },
          { name: 'Chole Bhature', calories: 450, protein: 12, carbs: 65, fat: 18, servingSize: '1 plate (2 bhature + chole)', category: 'Main Course' },
          { name: 'Palak Paneer', calories: 250, protein: 12, carbs: 8, fat: 18, servingSize: '1 bowl (200g)', category: 'Curry' },
          { name: 'Aloo Paratha', calories: 290, protein: 6, carbs: 45, fat: 10, servingSize: '1 piece', category: 'Breakfast' },
          { name: 'Vegetable Pulao', calories: 200, protein: 4, carbs: 40, fat: 3, servingSize: '1 plate (200g)', category: 'Rice' },
          { name: 'Medu Vada', calories: 190, protein: 5, carbs: 22, fat: 9, servingSize: '2 pieces', category: 'Breakfast' },
          { name: 'Tandoori Chicken', calories: 220, protein: 30, carbs: 3, fat: 9, servingSize: '1 plate (2 pieces)', category: 'Starter' },
          { name: 'Rajma Chawal', calories: 380, protein: 12, carbs: 65, fat: 6, servingSize: '1 plate', category: 'Main Course' },
          { name: 'Dhokla', calories: 160, protein: 6, carbs: 28, fat: 3, servingSize: '3 pieces', category: 'Snack' },
          { name: 'Mango Lassi', calories: 200, protein: 5, carbs: 35, fat: 4, servingSize: '1 glass (250ml)', category: 'Beverage' }
        ];

        const stmt = db.prepare("INSERT INTO foods (name, calories, protein, carbs, fat, servingSize, category) VALUES (?, ?, ?, ?, ?, ?, ?)");
        seedFoods.forEach(food => {
          stmt.run(food.name, food.calories, food.protein, food.carbs, food.fat, food.servingSize, food.category);
        });
        stmt.finalize();
        console.log('Database seeded with Indian foods.');
      }
    });
  });
}

// API Endpoints

// GET /api/foods - Get all foods (with search/filter)
app.get('/api/foods', (req, res) => {
  const search = req.query.q || '';
  const category = req.query.category || '';
  
  let query = "SELECT * FROM foods WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND name LIKE ?";
    params.push(`%${search}%`);
  }
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  query += " ORDER BY name ASC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/foods - Add a new custom food item
app.post('/api/foods', (req, res) => {
  const { name, calories, protein, carbs, fat, servingSize, category } = req.body;
  if (!name || calories === undefined || protein === undefined || carbs === undefined || fat === undefined || !servingSize) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO foods (name, calories, protein, carbs, fat, servingSize, category) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(query, [name, Number(calories), Number(protein), Number(carbs), Number(fat), servingSize, category || 'General'], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      name,
      calories,
      protein,
      carbs,
      fat,
      servingSize,
      category: category || 'General'
    });
  });
});

// GET /api/logs - Get food logs for a specific date
app.get('/api/logs', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  
  const query = `
    SELECT logs.id, logs.foodId, logs.quantity, logs.mealType, logs.date,
           foods.name, foods.calories, foods.protein, foods.carbs, foods.fat, foods.servingSize
    FROM logs
    JOIN foods ON logs.foodId = foods.id
    WHERE logs.date = ?
    ORDER BY logs.id DESC
  `;

  db.all(query, [date], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/logs - Log a food item consumption
app.post('/api/logs', (req, res) => {
  const { foodId, quantity, mealType, date } = req.body;
  if (!foodId || !quantity || !mealType || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO logs (foodId, quantity, mealType, date) VALUES (?, ?, ?, ?)`;
  db.run(query, [foodId, Number(quantity), mealType, date], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Fetch the newly created log with food details
    const selectQuery = `
      SELECT logs.id, logs.foodId, logs.quantity, logs.mealType, logs.date,
             foods.name, foods.calories, foods.protein, foods.carbs, foods.fat, foods.servingSize
      FROM logs
      JOIN foods ON logs.foodId = foods.id
      WHERE logs.id = ?
    `;
    db.get(selectQuery, [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// DELETE /api/logs/:id - Delete a log entry
app.delete('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM logs WHERE id = ?`;
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Log entry not found' });
    }
    res.json({ message: 'Log entry deleted successfully', id });
  });
});

// GET /api/stats - Get daily summary stats vs targets
app.get('/api/stats', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  
  const query = `
    SELECT logs.quantity, foods.calories, foods.protein, foods.carbs, foods.fat
    FROM logs
    JOIN foods ON logs.foodId = foods.id
    WHERE logs.date = ?
  `;

  db.all(query, [date], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    rows.forEach(row => {
      const qty = row.quantity;
      totalCalories += row.calories * qty;
      totalProtein += row.protein * qty;
      totalCarbs += row.carbs * qty;
      totalFat += row.fat * qty;
    });

    // Daily targets (standard values)
    const targets = {
      calories: 2000,
      protein: 60,
      carbs: 250,
      fat: 70
    };

    res.json({
      date,
      consumed: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10
      },
      targets
    });
  });
});

// Serve static files from the React app in production
app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'), (err) => {
    if (err) {
      res.status(200).send('Backend is running. Please build the frontend or run in development mode.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});