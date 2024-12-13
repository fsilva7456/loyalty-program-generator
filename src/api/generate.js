import OpenAI from 'openai';
import { drivers, evaluateDriver } from '../drivers/index.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function validateJsonResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Invalid JSON response:', text);
    throw new Error('Invalid JSON response from server');
  }
}

function cleanAndParseJSON(text) {
  if (!text || typeof text !== 'string') {
    console.error('Invalid input to cleanAndParseJSON:', text);
    throw new Error('Invalid input: text is required');
  }

  let cleanedText = text;
  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    console.log('Initial parse failed, attempting to clean JSON string');

    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```/g, '');

    // Find the main JSON object
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      console.error('No valid JSON object found in response');
      throw new Error('No valid JSON object found in response');
    }

    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);

    // Remove trailing commas
    cleanedText = cleanedText.replace(/,([\s\r\n]*[}\]])/g, '$1');

    // Remove non-printable characters
    cleanedText = cleanedText.replace(/[^\x20-\x7E]/g, '');

    console.log('Cleaned JSON text:', cleanedText);

    try {
      const parsed = JSON.parse(cleanedText);
      // Validate required fields
      if (!parsed.programName || !parsed.description || !parsed.pointSystem) {
        throw new Error('Missing required fields in program data');
      }
      return parsed;
    } catch (e2) {
      console.error('Failed to parse cleaned JSON:', e2);
      console.error('Cleaned text:', cleanedText);
      throw new Error(`Failed to parse JSON after cleaning: ${e2.message}`);
    }
  }
}

async function makeOpenAIRequest(openai, messages, model = 'gpt-4o-mini', temperature = 0.7) {
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: 2500, // Ensure we get complete responses
        presence_penalty: 0.1, // Slightly encourage new information
        frequency_penalty: 0.1, // Slightly discourage repetition
        stop: ["}"] // Try to ensure we get complete JSON
      });

      if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI');
      }

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      return cleanAndParseJSON(content);
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error);

      if (attempts === MAX_RETRIES) {
        throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
      }

      await delay(RETRY_DELAY);
    }
  }
}

async function generateInitialProgram(openai, businessName) {
  const exampleProgram = {
    programName: "Example Rewards",
    description: "A program focused on athletic achievement and community engagement",
    behavioralPrinciples: [
      {
        principle: "Goal Gradient",
        application: "Progress tracking towards fitness goals"
      },
      {
        principle: "Social Proof",
        application: "Community challenges and shared achievements"
      }
    ],
    pointSystem: {
      earning: "Points for workouts and purchases",
      redemption: "Gear and experience rewards"
    },
    tiers: [
      {
        name: "Starter",
        benefits: ["Basic rewards"],
        psychologicalBenefits: ["Clear progress tracking"]
      }
    ]
  };

  const systemPrompt = `Create a complete loyalty program for ${businessName} using behavioral science principles. Return a JSON object exactly matching this structure:

${JSON.stringify(exampleProgram, null, 2)}

Ensure ALL fields are included and properly formatted.`;

  return await makeOpenAIRequest(openai, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Generate the complete program JSON.' }
  ]);
}

async function analyzeAndImprove(openai, businessName, initialProgram) {
  // Rest of the analyzeAndImprove function remains the same
  ...
}

export async function generateLoyaltyProgram(businessName) {
  console.log('Generating loyalty program for:', businessName);
  console.log('OpenAI API Key exists:', !!process.env.VITE_OPENAI_API_KEY);

  const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY
  });

  try {
    console.log('Generating initial program...');
    const initialProgram = await generateInitialProgram(openai, businessName);
    
    if (!initialProgram || !initialProgram.programName) {
      throw new Error('Invalid program data generated');
    }

    console.log('Analyzing and improving program...');
    const result = await analyzeAndImprove(openai, businessName, initialProgram);
    
    console.log('Program generation complete');
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate loyalty program: ${error.message}`);
  }
}