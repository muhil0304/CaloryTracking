# CaloryTracking — Indian Food Calorie Tracker

A modern, enterprise-grade, highly responsive **Indian Food Calorie Tracker** application. It allows users to track their daily calorie intake, set personalized goals, log meals categorized by meal types (Breakfast, Lunch, Dinner, Snacks), search a rich pre-seeded database of popular Indian foods, and visualize their macronutrient breakdown (Carbohydrates, Proteins, Fats) using interactive charts and progress indicators.

## Features
- **Dashboard**: Visual progress ring (current vs. goal) and macro-nutrient tracking (Carbs, Protein, Fat) with interactive charts.
- **Meal Logging**: Add foods to Breakfast, Lunch, Dinner, or Snacks with custom serving sizes.
- **Food Search**: Search the pre-seeded Indian food database (e.g., Chicken Biryani, Paneer Butter Masala, Roti, Dal Tadka, Idli, Dosa, Samosa, Chole Bhature, Gulab Jamun, etc.) and add custom foods.
- **Daily Calorie Goal**: Set and update daily calorie goals.
- **History**: View logs for previous days.
- **Macronutrient Breakdown**: Visualizer for Carbs, Protein, and Fat.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express, TypeScript, `better-sqlite3`
- **Database**: SQLite (persisted locally in `server/calories.db`)

## Setup & Installation

### Prerequisites
- Node.js (v18.x, v20.x, or v22.x)
- npm (v9.x or higher)

### Quick Start (Single Command)

1. **Clone or extract the project files.**
2. **Install all dependencies** for the root, server, and client:
   ```bash
   npm run install:all
   ```
3. **Run the application in development mode**:
   ```bash
   npm run dev
   ```
   This command starts both the Express backend (on port `5001`) and the Vite frontend (on port `5173`) concurrently.
4. Open your browser and navigate to:
   [http://localhost:5173](http://localhost:5173)

### Database Seeding
The SQLite database is automatically created and pre-seeded with 20+ popular Indian foods on the first run of the backend server.

---

## Architecture & API Endpoints

### Database Schema
- `foods`: Stores pre-seeded and custom food items with calorie, protein, carb, and fat details.
- `logs`: Stores daily meal entries with meal type, serving size, and date.
- `goals`: Stores daily calorie goals for specific dates.

### API Endpoints
- `GET /api/foods` - Search and list foods.
- `POST /api/foods` - Add a custom food item.
- `GET /api/logs?date=YYYY-MM-DD` - Get meal logs for a specific date.
- `POST /api/logs` - Log a food item.
- `DELETE /api/logs/:id` - Delete a logged food item.
- `GET /api/goals?date=YYYY-MM-DD` - Get calorie goal for a specific date.
- `POST /api/goals` - Set/update calorie goal for a specific date.