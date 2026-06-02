import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const dbPath = path.resolve(__dirname, '../../calorie_tracker.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      serving_size REAL NOT NULL,
      serving_unit TEXT NOT NULL,
      category TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS meal_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id INTEGER NOT NULL,
      meal_type TEXT NOT NULL,
      servings REAL NOT NULL,
      log_date TEXT NOT NULL,
      FOREIGN KEY(food_id) REFERENCES foods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL
    );
  `);

  // Seed default goal if not exists
  const goalCount = await db.get('SELECT COUNT(*) as count FROM goals');
  if (goalCount.count === 0) {
    await db.run(
      'INSERT INTO goals (id, calories, protein, carbs, fat) VALUES (1, 2000, 120, 230, 65)'
    );
  }

  // Seed default Indian foods if empty
  const foodCount = await db.get('SELECT COUNT(*) as count FROM foods');
  if (foodCount.count === 0) {
    const defaultFoods = [
      { name: 'Roti (Whole Wheat)', calories: 120, protein: 3.5, carbs: 24, fat: 1.5, serving_size: 1, serving_unit: 'piece', category: 'Grains' },
      { name: 'White Basmati Rice', calories: 205, protein: 4.2, carbs: 44.5, fat: 0.4, serving_size: 150, serving_unit: 'g', category: 'Grains' },
      { name: 'Brown Rice', calories: 160, protein: 3.8, carbs: 33, fat: 1.2, serving_size: 150, serving_unit: 'g', category: 'Grains' },
      { name: 'Dal Tadka (Yellow Lentils)', calories: 150, protein: 7.2, carbs: 19.5, fat: 4.5, serving_size: 150, serving_unit: 'g', category: 'Curry' },
      { name: 'Paneer Butter Masala', calories: 320, protein: 11.5, carbs: 9.8, fat: 26.2, serving_size: 150, serving_unit: 'g', category: 'Curry' },
      { name: 'Chicken Tikka Masala', calories: 290, protein: 21.8, carbs: 8.2, fat: 18.5, serving_size: 150, serving_unit: 'g', category: 'Curry' },
      { name: 'Samosa', calories: 150, protein: 3.0, carbs: 18.0, fat: 7.5, serving_size: 1, serving_unit: 'piece', category: 'Snacks' },
      { name: 'Idli', calories: 60, protein: 1.5, carbs: 12.5, fat: 0.2, serving_size: 1, serving_unit: 'piece', category: 'Breakfast' },
      { name: 'Masala Dosa', calories: 250, protein: 5.2, carbs: 38.0, fat: 8.2, serving_size: 1, serving_unit: 'piece', category: 'Breakfast' },
      { name: 'Chicken Biryani', calories: 480, protein: 24.5, carbs: 58.0, fat: 16.2, serving_size: 300, serving_unit: 'g', category: 'Grains' },
      { name: 'Chole Bhature', calories: 550, protein: 12.5, carbs: 65.0, fat: 24.0, serving_size: 1, serving_unit: 'plate', category: 'Snacks' },
      { name: 'Aloo Paratha', calories: 210, protein: 4.5, carbs: 32.0, fat: 7.2, serving_size: 1, serving_unit: 'piece', category: 'Breakfast' },
      { name: 'Gulab Jamun', calories: 150, protein: 2.0, carbs: 25.0, fat: 5.0, serving_size: 1, serving_unit: 'piece', category: 'Dessert' },
      { name: 'Tandoori Chicken', calories: 220, protein: 25.5, carbs: 3.2, fat: 12.0, serving_size: 120, serving_unit: 'g', category: 'Curry' },
      { name: 'Palak Paneer', calories: 190, protein: 9.8, carbs: 7.5, fat: 13.5, serving_size: 150, serving_unit: 'g', category: 'Curry' },
      { name: 'Mixed Vegetable Sabzi', calories: 110, protein: 2.5, carbs: 14.2, fat: 5.1, serving_size: 150, serving_unit: 'g', category: 'Curry' },
      { name: 'Masala Chai (with Milk & Sugar)', calories: 90, protein: 2.1, carbs: 12.5, fat: 3.2, serving_size: 150, serving_unit: 'ml', category: 'Beverages' },
      { name: 'Mango Lassi', calories: 220, protein: 5.8, carbs: 35.0, fat: 5.2, serving_size: 250, serving_unit: 'ml', category: 'Beverages' },
      { name: 'Cucumber Raita', calories: 60, protein: 3.2, carbs: 4.8, fat: 2.1, serving_size: 100, serving_unit: 'g', category: 'Snacks' },
      { name: 'Papad (Roasted)', calories: 45, protein: 1.5, carbs: 8.2, fat: 0.1, serving_size: 1, serving_unit: 'piece', category: 'Snacks' },
      { name: 'Upma', calories: 180, protein: 4.2, carbs: 30.5, fat: 4.2, serving_size: 150, serving_unit: 'g', category: 'Breakfast' },
      { name: 'Medhu Vada', calories: 95, protein: 2.5, carbs: 11.0, fat: 4.5, serving_size: 1, serving_unit: 'piece', category: 'Breakfast' },
      { name: 'Butter Naan', calories: 260, protein: 6.5, carbs: 42.0, fat: 7.5, serving_size: 1, serving_unit: 'piece', category: 'Grains' },
      { name: 'Moong Dal Halwa', calories: 350, protein: 6.0, carbs: 45.0, fat: 16.0, serving_size: 100, serving_unit: 'g', category: 'Dessert' },
      { name: 'Fish Curry (Bengali Style)', calories: 240, protein: 18.5, carbs: 6.0, fat: 15.5, serving_size: 150, serving_unit: 'g', category: 'Curry' }
    ];

    const stmt = await db.prepare(
      'INSERT INTO foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)'
    );

    for (const food of defaultFoods) {
      await stmt.run(
        food.name,
        food.calories,
        food.protein,
        food.carbs,
        food.fat,
        food.serving_size,
        food.serving_unit,
        food.category
      );
    }
    await stmt.finalize();
  }

  return db;
}