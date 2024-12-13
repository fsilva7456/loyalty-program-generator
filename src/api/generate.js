import OpenAI from 'openai';
import { drivers, evaluateDriver } from '../drivers/index.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MODEL_NAME = 'gpt-4';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validateProgramStructure(program) {
  const required = {
    programName: 'string',
    description: 'string',
    pointSystem: {
      earning: 'string',
      redemption: 'string'
    },
    tiers: 'array',
    specialPerks: 'array',
    signupProcess: 'string'
  };

  for (const [key, type] of Object.entries(required)) {
    if (typeof type === 'string') {
      if (!program[key]) {
        throw new Error(`Missing required field: ${key}`);
      }
      if (type === 'array' && !Array.isArray(program[key])) {
        throw new Error(`Field ${key} must be an array`);
      }
      if (type !== 'array' && typeof program[key] !== type) {
        throw new Error(`Field ${key} must be type ${type}`);
      }
    } else {
      if (!program[key] || typeof program[key] !== 'object') {
        throw new Error(`Missing or invalid object: ${key}`);
      }
      for (const [subKey, subType] of Object.entries(type)) {
        if (!program[key][subKey]) {
          throw new Error(`Missing required field: ${key}.${subKey}`);
        }
        if (typeof program[key][subKey] !== subType) {
          throw new Error(`Field ${key}.${subKey} must be type ${subType}`);
        }
      }
    }
  }

  if (program.tiers.length === 0) {
    throw new Error('Program must have at least one tier');
  }
  
  program.tiers.forEach((tier, index) => {
    if (!tier.name || !tier.requirements || !Array.isArray(tier.benefits)) {
      throw new Error(`Invalid tier structure at index ${index}`);
    }
  });

  return true;
}

async function makeOpenAIRequest(openai, messages, source = 'unknown', temperature = 0.7) {
  let attempts = 0;
  let lastError = null;

  while (attempts < MAX_RETRIES) {
    try {
      console.log(`[${source}] Making API request - Attempt ${attempts + 1}/${MAX_RETRIES}`);
      console.log(`[${source}] Request messages:`, JSON.stringify(messages, null, 2));

      const completion = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          ...messages,
          {
            role: 'system',
            content: 'You must respond with only valid JSON. No markdown, no code blocks, no additional text.'
          }
        ],
        temperature,
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        timeout: 120000 // 2 minute timeout
      });

      const content = completion.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      console.log(`[${source}] Raw API response:`, content);

      try {
        const parsed = JSON.parse(content);
        console.log(`[${source}] Successfully parsed JSON response`);
        return parsed;
      } catch (parseError) {
        console.error(`[${source}] JSON parse error:`, parseError);
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }

    } catch (error) {
      lastError = error;
      attempts++;
      console.error(`[${source}] Request failed:`, error);

      if (error.response) {
        console.error(`[${source}] API Error Details:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }

      if (attempts < MAX_RETRIES) {
        const delayTime = RETRY_DELAY * Math.pow(2, attempts - 1); // Exponential backoff
        console.log(`[${source}] Retrying in ${delayTime}ms...`);
        await delay(delayTime);
      }
    }
  }

  console.error(`[${source}] All retry attempts failed`);
  throw new Error(`Failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

async function generateInitialProgram(openai, businessName) {
  const exampleProgram = {
    "programName": "Example Rewards",
    "description": "A loyalty program focused on customer engagement and rewards",
    "pointSystem": {
      "earning": "1 point per dollar spent",
      "redemption": "100 points = $1 in rewards"
    },
    "tiers": [
      {
        "name": "Bronze",
        "requirements": "0-499 points",
        "benefits": ["Basic member discounts", "Birthday reward"]
      }
    ],
    "specialPerks": ["Welcome bonus", "Referral rewards"],
    "signupProcess": "Simple online registration with email and basic info"
  };

  const systemPrompt = {
    role: 'system',
    content: `You are designing a loyalty program for ${businessName}. Create a program that matches this exact JSON structure:
${JSON.stringify(exampleProgram, null, 2)}

Include:
- A memorable program name
- Clear points system
- At least 3 membership tiers
- Engaging special perks
- Simple signup process`
  };

  const initialProgram = await makeOpenAIRequest(
    openai,
    [systemPrompt],
    'initial_program',
    0.7
  );

  validateProgramStructure(initialProgram);
  return initialProgram;
}

async function analyzeProgram(openai, program) {
  const exampleAnalysis = {
    "weaknesses": ["string"],
    "suggestedImprovements": ["string"],
    "behavioralAnalysis": {
      "effectivePrinciples": ["string"],
      "missedOpportunities": ["string"]
    }
  };

  const systemPrompt = {
    role: 'system',
    content: `Analyze this loyalty program. Return a JSON object exactly matching this structure:
${JSON.stringify(exampleAnalysis, null, 2)}

Focus on:
1. Program weaknesses
2. Potential improvements
3. Behavioral principles used
4. Missed opportunities`
  };

  const userPrompt = {
    role: 'user',
    content: `Analyze this program:\n${JSON.stringify(program, null, 2)}`
  };

  return await makeOpenAIRequest(
    openai,
    [systemPrompt, userPrompt],
    'program_analysis'
  );
}

async function generateImprovedProgram(openai, businessName, initialProgram, analysis, driverAnalyses) {
  const systemPrompt = {
    role: 'system',
    content: `You are improving ${businessName}'s loyalty program. Create an enhanced version that addresses these issues while maintaining the exact same JSON structure as the original program.`
  };

  const userPrompt = {
    role: 'user',
    content: `Original Program: ${JSON.stringify(initialProgram, null, 2)}\n\nAnalysis: ${JSON.stringify(analysis, null, 2)}\n\nDriver Analyses: ${JSON.stringify(driverAnalyses, null, 2)}\n\nCreate an improved version that addresses all identified issues.`
  };

  const improvedProgram = await makeOpenAIRequest(
    openai,
    [systemPrompt, userPrompt],
    'program_improvement'
  );

  validateProgramStructure(improvedProgram);
  return improvedProgram;
}

export async function generateLoyaltyProgram(businessName) {
  console.log('Starting loyalty program generation for:', businessName);
  
  if (!process.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found in environment variables');
  }

  const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
    timeout: 120000,
    maxRetries: 3
  });

  try {
    // Step 1: Generate initial program
    console.log('Generating initial program...');
    const initialProgram = await generateInitialProgram(openai, businessName);
    console.log('Initial program generated successfully');
    
    // Step 2: Analyze the program
    console.log('Analyzing program...');
    const analysis = await analyzeProgram(openai, initialProgram);
    console.log('Program analysis complete');
    
    // Step 3: Evaluate with all drivers
    console.log('Evaluating drivers...');
    const driverAnalyses = {};
    for (const [key, driver] of Object.entries(drivers)) {
      console.log(`Evaluating ${key} driver...`);
      try {
        driverAnalyses[key] = await evaluateDriver(openai, driver, initialProgram);
        console.log(`${key} driver evaluation complete`);
      } catch (error) {
        console.error(`Error evaluating ${key} driver:`, error);
        throw new Error(`Driver evaluation failed: ${key} - ${error.message}`);
      }
    }
    
    // Step 4: Generate improved version
    console.log('Generating improved program...');
    const improvedProgram = await generateImprovedProgram(
      openai,
      businessName,
      initialProgram,
      analysis,
      driverAnalyses
    );
    console.log('Improved program generated successfully');

    return {
      initial: initialProgram,
      analysis: {
        ...analysis,
        drivers: driverAnalyses
      },
      improved: improvedProgram
    };

  } catch (error) {
    console.error('Program generation error:', error);
    throw new Error(`Loyalty program generation failed: ${error.message}`);
  }
}