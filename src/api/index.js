import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateLoyaltyProgram } from './generate.js';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: join(__dirname, '../../.env') });

const app = express();

console.log('Starting API server...');
console.log('Environment check:', {
  nodeEnv: process.env.NODE_ENV,
  openAiKeyExists: !!process.env.VITE_OPENAI_API_KEY,
});

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
    
    if (!process.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found in environment');
    }

    const program = await generateLoyaltyProgram(businessName);
    res.json(program);
  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}/test`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});