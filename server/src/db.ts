import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(__dirname, '../calories.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Create Foods Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      serving_size TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0
    )
  `);

  // Create Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id INTEGER,
      food_name TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      serving_size TEXT NOT NULL,
      servings REAL NOT NULL,
      meal_type TEXT CHECK(meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks')) NOT NULL,
      logged_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(food_id) REFERENCES foods(id) ON DELETE SET NULL
    )
  `);

  // Create Goals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      date TEXT PRIMARY KEY,
      calories REAL NOT NULL
    )
  `);

  // Seed popular Indian foods if table is empty
  const foodCount = db.prepare('SELECT COUNT(*) as count FROM foods').get() as { count: number };
  
  if (foodCount.count === 0) {
    const insertFood = db.prepare(`
      INSERT INTO foods (name, calories, protein, carbs, fat, serving_size, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    const popularIndianFoods = [
      { name: 'Chicken Biryani', calories: 548, protein: 22, carbs: 72, fat: 18, serving_size: '1 plate (450g)' },
      { name: 'Paneer Butter Masala', calories: 355, protein: 12, carbs: 14, fat: 28, serving_size: '1 cup (200g)' },
      { name: 'Roti (Whole Wheat)', calories: 104, protein: 3.5, carbs: 22, fat: 0.4, serving_size: '1 piece (40g)' },
      { name: 'Dal Tadka', calories: 150, protein: 7, carbs: 20, fat: 4.5, serving_size: '1 cup (150g)' },
      { name: 'Idli', calories: 58, protein: 1.5, carbs: 12.5, fat: 0.2, serving_size: '1 piece (40g)' },
      { name: 'Masala Dosa', calories: 287, protein: 5.3, carbs: 43, fat: 10.2, serving_size: '1 piece (150g)' },
      { name: 'Samosa', calories: 150, protein: 2.5, carbs: 18, fat: 7.5, serving_size: '1 piece (50g)' },
      { name: 'Chole Bhature', calories: 550, protein: 12, carbs: 65, fat: 26, serving_size: '1 plate (2 bhature + chole)' },
      { name: 'Gulab Jamun', calories: 150, protein: 2, carbs: 25, fat: 5, serving_size: '1 piece (40g)' },
      { name: 'Butter Naan', calories: 262, protein: 6.5, carbs: 45, fat: 7.2, serving_size: '1 piece (90g)' },
      { name: 'Tandoori Chicken', calories: 220, protein: 24, carbs: 3, fat: 12, serving_size: '1 piece (150g)' },
      { name: 'Palak Paneer', calories: 250, protein: 10, carbs: 10, fat: 18, serving_size: '1 cup (200g)' },
      { name: 'Aloo Paratha', calories: 290, protein: 5, carbs: 42, fat: 11, serving_size: '1 piece (100g)' },
      { name: 'Poha', calories: 250, protein: 4, carbs: 45, fat: 6, serving_size: '1 cup (150g)' },
      { name: 'Upma', calories: 210, protein: 4.5, carbs: 34, fat: 6, serving_size: '1 cup (150g)' },
      { name: 'Medu Vada', calories: 97, protein: 2.2, carbs: 9, fat: 6, serving_size: '1 piece (40g)' },
      { name: 'Chicken Tikka Masala', calories: 320, protein: 22, carbs: 10, fat: 20, serving_size: '1 cup (200g)' },
      { name: 'Fish Curry', calories: 240, protein: 18, carbs: 8, fat: 15, serving_size: '1 cup (200g)' },
      { name: 'Mixed Vegetable Sabzi', calories: 110, protein: 2.5, carbs: 14, fat: 5, serving_size: '1 cup (150g)' },
      { name: 'Jeera Rice', calories: 180, protein: 3.5, carbs: 38, fat: 1.5, serving_size: '1 cup (150g)' },
      { name: 'Moong Dal Khichdi', calories: 215, protein: 8, carbs: 38, fat: 3.5, serving_size: '1 cup (200g)' },
      { name: 'Gajar Ka Halwa', calories: 192, protein: 3, carbs: 24, fat: 9.5, serving_size: '1 small bowl (75g)' }
    ];

    const insertMany = db.transaction((foods) => {
      for (const food of foods) {
        insertFood.run(food.name, food.calories, food.protein, food.carbs, food.fat, food.serving_size);
      }
    });

    insertMany(popularIndianFoods);
    console.log('Database pre-seeded with popular Indian foods.');
  }
}