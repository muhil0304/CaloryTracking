export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface Food {
  id: string;
  name: string;
  category: 'Breakfast' | 'Main Course' | 'Snacks' | 'Desserts' | 'Custom';
  calories: number; // per serving
  protein: number; // grams per serving
  carbs: number; // grams per serving
  fat: number; // grams per serving
  servingSize: string; // e.g., "1 plate", "1 piece", "1 bowl (150g)"
  isCustom?: boolean;
}

export interface LogEntry {
  id: string;
  food: Food;
  mealType: MealType;
  servings: number; // multiplier, e.g., 1.5
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
}

export interface DailyGoal {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}