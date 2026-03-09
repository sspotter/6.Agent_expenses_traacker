import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import collectionsRoutes from './routes/collections.routes';
import expensesRoutes from './routes/expenses.routes';
import settlementsRoutes from './routes/settlements.routes';
import summaryRoutes from './routes/summary.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/collections', collectionsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/settlements', settlementsRoutes);
app.use('/api/summary', summaryRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Agent Expenses Tracker API',
    endpoints: {
      collections: '/api/collections/:month',
      expenses: '/api/expenses/:month',
      settlements: '/api/settlements/:month',
      summary: '/api/summary/:month'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
