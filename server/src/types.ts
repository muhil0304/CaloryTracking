export interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
  is_custom: number; // 0 for pre-seeded, 1 for custom
}

export interface MealLog {
  id: number;
  food_id: number | null;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
  servings: number;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  logged_date: string; // YYYY-MM-DD
  created_at?: string;
}

export interface DailyGoal {
  date: string; // YYYY-MM-DD
  calories: number;
}

export interface DashboardSummary {
  goal: number;
  consumed: number;
  remaining: number;
  protein: number;
  carbs: number;
  fat: number;
}