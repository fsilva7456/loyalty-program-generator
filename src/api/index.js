import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

// Enable CORS with specific options
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  methods: ['POST'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const { businessName } = req.body;
    
    // Temporary response for testing
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

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});