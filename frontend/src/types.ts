export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  servingSize: number; // e.g., 100, 1
  servingUnit: string; // e.g., "g", "piece", "bowl"
  category: string;    // e.g., "Breads", "Rice", "Curries", "Snacks", "Desserts", "Custom"
  isCustom?: boolean;
}

export interface MealLog {
  id: number;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodId: number;
  foodName: string;
  calories: number; // calculated based on servings
  protein: number;  // calculated based on servings
  carbs: number;    // calculated based on servings
  fat: number;      // calculated based on servings
  servings: number; // multiplier (e.g., 1.5 servings)
  servingSize: number;
  servingUnit: string;
}

export interface DailyGoal {
  id?: number;
  date: string; // YYYY-MM-DD or "default"
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
}