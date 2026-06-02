import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import { getDb } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', router);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Initialize DB and start server
async function startServer() {
  try {
    console.log('Initializing SQLite database...');
    await getDb();
    console.log('Database initialized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();