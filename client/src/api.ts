export interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  isCustom: number; // 0 or 1
}

export interface MealLog {
  id: number;
  foodId: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  servings: number;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  loggedAt: string;
}

export interface DailyGoal {
  date: string;
  calories: number;
}

const API_BASE = '/api';

export async function searchFoods(query: string): Promise<Food[]> {
  const res = await fetch(`${API_BASE}/foods?search=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search foods');
  return res.json();
}

export async function createCustomFood(food: Omit<Food, 'id' | 'isCustom'>): Promise<Food> {
  const res = await fetch(`${API_BASE}/foods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(food),
  });
  if (!res.ok) throw new Error('Failed to create custom food');
  return res.json();
}

export async function getLogs(date: string): Promise<MealLog[]> {
  const res = await fetch(`${API_BASE}/logs?date=${date}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function addLog(log: Omit<MealLog, 'id'>): Promise<MealLog> {
  const res = await fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  if (!res.ok) throw new Error('Failed to add log');
  return res.json();
}

export async function deleteLog(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/logs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete log');
  return res.json();
}

export async function getGoal(date: string): Promise<DailyGoal> {
  const res = await fetch(`${API_BASE}/goals?date=${date}`);
  if (!res.ok) throw new Error('Failed to fetch goal');
  return res.json();
}

export async function updateGoal(date: string, calories: number): Promise<DailyGoal> {
  const res = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, calories }),
  });
  if (!res.ok) throw new Error('Failed to update goal');
  return res.json();
}