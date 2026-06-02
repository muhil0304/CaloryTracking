import { Food, MealLog, DailyGoal } from './types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Food Database APIs
  async getFoods(): Promise<Food[]> {
    const res = await fetch(`${API_BASE}/foods`);
    return handleResponse<Food[]>(res);
  },

  async createFood(food: Omit<Food, 'id'>): Promise<Food> {
    const res = await fetch(`${API_BASE}/foods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(food),
    });
    return handleResponse<Food>(res);
  },

  async deleteFood(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/foods/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(errorText || 'Failed to delete food');
    }
  },

  // Meal Log APIs
  async getLogs(date: string): Promise<MealLog[]> {
    const res = await fetch(`${API_BASE}/logs?date=${date}`);
    return handleResponse<MealLog[]>(res);
  },

  async createLog(log: {
    date: string;
    mealType: string;
    foodId: number;
    servings: number;
  }): Promise<MealLog> {
    const res = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    return handleResponse<MealLog>(res);
  },

  async updateLog(id: number, servings: number): Promise<MealLog> {
    const res = await fetch(`${API_BASE}/logs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servings }),
    });
    return handleResponse<MealLog>(res);
  },

  async deleteLog(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/logs/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(errorText || 'Failed to delete log');
    }
  },

  // Goal APIs
  async getGoal(date: string): Promise<DailyGoal> {
    const res = await fetch(`${API_BASE}/goals?date=${date}`);
    return handleResponse<DailyGoal>(res);
  },

  async updateGoal(goal: Omit<DailyGoal, 'id'>): Promise<DailyGoal> {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    return handleResponse<DailyGoal>(res);
  }
};