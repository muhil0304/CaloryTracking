# AaharCal - Indian Food Calorie Tracker

AaharCal is a modern, beautiful full-stack web application designed to track daily calorie and macronutrient intake based on popular Indian foods. Built with React, Tailwind CSS, Node.js, Express, and SQLite.

## Features

- **Dashboard**:
  - Daily progress ring showing calories consumed vs. daily goal.
  - Macronutrient breakdown (Carbs, Protein, Fat) with progress bars.
  - Meal-wise breakdown cards (Breakfast, Lunch, Dinner, Snacks) showing calories consumed in each.
- **Food Logger**:
  - Search bar to search the pre-populated Indian food database with instant results.
  - Quick-add modal where the user selects a food, specifies the number of servings/quantity, selects the meal type, and logs it.
  - Custom food creator: Form to add a new Indian food item to the database if it doesn't exist.
- **Daily Log List**:
  - List of all logged items for the selected date, grouped by meal type, with the ability to delete entries.
  - Date picker to view and log foods for past or future dates.
- **Analytics/History**:
  - A beautiful custom SVG bar chart showing calorie intake over the last 7 days compared to the daily goal.
- **Settings**:
  - Form to update daily calorie goal and target macronutrient ratios (Protein, Carbs, Fat).

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, SQLite (`sqlite3`)
- **Process Management**: Concurrently

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository.
2. Install all dependencies for the root, backend, and frontend using the helper script:
   ```bash
   npm run install-all
   ```

### Running the Application

To run both the backend server and the frontend development server concurrently, run:
```bash
npm start
```

- The frontend will be available at `http://localhost:3000`
- The backend API will be running at `http://localhost:5000`

## Database Schema

The application uses a local SQLite database file `backend/database.sqlite` with the following tables:
- `foods`: Pre-populated with 30 popular Indian foods (Roti, Biryani, Paneer Butter Masala, etc.) with calories, protein, carbs, fat, and serving size.
- `logs`: Tracks daily food intake with meal type, quantity, and date.
- `goals`: Stores user's daily calorie and macronutrient goals.