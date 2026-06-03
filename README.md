# AaharCal - Indian Calorie & Nutrition Tracker

AaharCal is a complete, modern-themed calorie and macro-nutrient tracking application tailored specifically for Indian foods. Built with React.js, Tailwind CSS, Node.js/Express, and SQLite.

## Features

- **Dashboard View**:
  - Beautiful circular progress ring showing calories consumed vs daily goal (2000 kcal).
  - Macro-nutrient breakdown (Carbohydrates, Protein, Fats) with visual progress bars and percentages.
  - Daily summary stats.
- **Log Food Section**:
  - Search bar with auto-suggest to search Indian foods.
  - Quantity/serving selector (e.g., number of servings).
  - Quick-add buttons for extremely common Indian foods (Roti, Rice, Dal, Chai, Idli).
- **Custom Food Creator**:
  - A clean modal form to add custom Indian foods with name, serving size, calories, protein, carbs, and fat.
- **Daily Log History**:
  - List of logged items for the selected day with calorie/macro breakdown and a delete button.
  - Date picker to view/log for previous or future days.
- **Pre-populated Database**:
  - Pre-populated with 20 common Indian foods (Roti, Rice, Dal Tadka, Paneer Butter Masala, Chicken Biryani, Masala Dosa, Idli, Samosa, Gulab Jamun, Chole Bhature, etc.).

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express.js, SQLite (`sqlite3`)
- **Process Management**: Concurrently (runs frontend and backend together in development)

## Setup & Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Application (Development)**:
   This command runs both the Express backend (port 5000) and the Vite frontend (port 5173) concurrently.
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build & Run (Production)**:
   Build the React frontend and serve it directly from the Express backend:
   ```bash
   npm run build
   npm start
   ```
   Open [http://localhost:5000](http://localhost:5000) in your browser.

## API Endpoints

- `GET /api/foods` - Fetch all foods (including custom ones).
- `POST /api/foods` - Add a new custom food.
- `GET /api/logs` - Fetch logs for a specific date (default to today).
- `POST /api/logs` - Log a food consumption entry.
- `DELETE /api/logs/:id` - Delete a log entry.
- `GET /api/stats` - Get summary stats (total calories, protein, carbs, fat consumed vs daily goals).