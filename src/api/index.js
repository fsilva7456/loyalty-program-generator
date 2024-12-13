import express from 'express';
import cors from 'cors';

const app = express();

console.log('Starting API server...');

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'API is working!' });
});

app.post('/api/generate', async (req, res) => {
  try {
    console.log('Generate endpoint hit:', req.body);
    const { businessName } = req.body;
    
    // Mock response for testing
    const mockResponse = {
      programName: `${businessName} Rewards Club`,
      pointSystem: "10 points per $1 spent",
      tiers: ["Basic", "Silver", "Gold"],
      benefits: ["Birthday rewards", "Monthly specials", "Free items"]
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}/test`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});