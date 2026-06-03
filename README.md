# Aahar - Indian Calorie Tracker

Aahar is a modern, clean, and beautiful full-stack application designed to track daily calorie and macronutrient intake based on Indian foods. Built with React, Tailwind CSS, Node.js, Express, and SQLite.

## Features

- **Pre-seeded Database**: Pre-loaded with 18 common Indian foods (e.g., Butter Chicken, Paneer Tikka, Masala Dosa, Idli, Roti, Dal Tadka, Biryani, Samosa, Gulab Jamun, Chole Bhature, etc.) with their calorie, protein, carb, and fat values.
- **Daily Progress Dashboard**: Beautiful circular progress ring showing calorie intake vs daily target, along with macronutrient progress bars (Carbs, Protein, Fat).
- **Meal Categories**: Track food consumption across Breakfast, Lunch, Dinner, and Snacks.
- **Food Search & Log**: Instant search and filter by category to log foods with custom portion sizes.
- **Custom Food Creator**: Easily add new Indian food items to the database.
- **Weekly Analytics**: Elegant pure CSS/SVG bar chart showing calorie intake over the last 7 days.
- **Timezone-Aware Logging**: Robust date selector to log and view history for any specific date.

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express
- **Database**: SQLite (using `sqlite3`)

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your system.

### Installation

1. Clone or extract the project files.
2. Install all dependencies for both the root (backend) and the frontend:
   ```bash
   npm run install-all
   ```

### Running the Application

You can run both the backend server and the frontend development server concurrently with a single command:

```bash
npm run dev
```

- **Frontend**: Runs on [http://localhost:5173](http://localhost:5173)
- **Backend API**: Runs on [http://localhost:5000](http://localhost:5000)

### Production Build

To build the frontend and serve it directly from the Express backend:

1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open [http://localhost:5000](http://localhost:5000) in your browser.