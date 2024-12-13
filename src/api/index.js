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

app.use(cors());
app.use(express.json());

// Initial environment check
console.log('Starting API server...');
console.log('Environment check:', {
  nodeEnv: process.env.NODE_ENV,
  openAiKeyExists: !!process.env.VITE_OPENAI_API_KEY,
  envPath: join(__dirname, '../../.env')
});

// Test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ 
    message: 'API is working!',
    envCheck: {
      hasOpenAiKey: !!process.env.VITE_OPENAI_API_KEY
    }
  });
});

app.post('/api/generate', async (req, res) => {
  console.log('Generate endpoint hit');
  try {
    const { businessName } = req.body;
    console.log('Business name:', businessName);
    
    if (!process.env.VITE_OPENAI_API_KEY) {
      console.error('OpenAI API key is missing!');
      throw new Error('OpenAI API key not found in environment');
    }

    console.log('Starting program generation...');
    const program = await generateLoyaltyProgram(businessName);
    console.log('Program generated successfully');
    res.json(program);
  } catch (error) {
    console.error('Error in /api/generate:', error);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('OpenAI API Error:', error.response.data);
    }
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || null
    });
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
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  if (err instanceof Error) {
    console.error('Stack:', err.stack);
  }
});