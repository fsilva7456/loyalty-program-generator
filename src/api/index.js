import express from 'express';
import cors from 'cors';
import { generateLoyaltyProgram } from './generate.js';

const app = express();

// Enable CORS for the frontend
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { businessName } = req.body;
    const program = await generateLoyaltyProgram(businessName);
    res.json(program);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});