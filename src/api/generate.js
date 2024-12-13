import OpenAI from 'openai';
import { drivers, evaluateDriver } from '../drivers/index.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MODEL_NAME = 'gpt-4o-mini';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validateProgramStructure(program) {
  // Required fields for a valid loyalty program
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

  // Check all required fields
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
      // Handle nested objects (like pointSystem)
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

  // Validate tiers structure
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
      console.log(`[${source}] Attempt ${attempts + 1} of ${MAX_RETRIES}`);

      const completion = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages,
        temperature,
        max_tokens: 3000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        response_format: { type: 'json_object' },
        timeout: 60000 // 60 second timeout
      });

      if (!completion.choices?.[0]?.message?.content) {
        throw new Error('Empty or invalid response from OpenAI');
      }

      const content = completion.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        console.log(`[${source}] Successfully parsed response`);
        return parsed;
      } catch (parseError) {
        console.error(`[${source}] JSON parse error:`, parseError);
        console.error('Raw content:', content);
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }

    } catch (error) {
      lastError = error;
      attempts++;
      console.error(`[${source}] Attempt ${attempts} failed:`, error);

      if (attempts < MAX_RETRIES) {
        const delayTime = RETRY_DELAY * attempts;
        console.log(`[${source}] Retrying in ${delayTime}ms...`);
        await delay(delayTime);
      }
    }
  }

  throw new Error(`[${source}] Failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

async function generateInitialProgram(openai, businessName) {
  const systemPrompt = `You are a loyalty program designer specializing in creating engaging and effective programs.

Create a complete loyalty program for ${businessName} that includes:
1. Clear point earning and redemption rules
2. Multiple membership tiers with increasing benefits
3. Special perks that drive engagement
4. A simple signup process

Return a JSON object with exactly this structure:
{
  "programName": "string",
  "description": "string",
  "pointSystem": {
    "earning": "string",
    "redemption": "string"
  },
  "tiers": [
    {
      "name": "string",
      "requirements": "string",
      "benefits": ["string"]
    }
  ],
  "specialPerks": ["string"],
  "signupProcess": "string"
}`;

  const initialProgram = await makeOpenAIRequest(
    openai,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate a complete loyalty program JSON matching the exact structure provided.' }
    ],
    'initial_program'
  );

  validateProgramStructure(initialProgram);
  return initialProgram;
}

async function analyzeProgram(openai, program) {
  const analysisPrompt = `Analyze this loyalty program focusing on:
1. Customer psychology and motivation
2. Engagement mechanics
3. Reward effectiveness
4. Technical feasibility
5. Business impact

Return a JSON object with this structure:
{
  "weaknesses": ["string"],
  "suggestedImprovements": ["string"],
  "behavioralAnalysis": {
    "effectivePrinciples": ["string"],
    "missedOpportunities": ["string"]
  }
}`;

  return await makeOpenAIRequest(
    openai,
    [
      { 
        role: 'system', 
        content: 'You are a loyalty program analyst specializing in behavioral science and customer psychology.'
      },
      { 
        role: 'user', 
        content: `${analysisPrompt}\n\nProgram to analyze:\n${JSON.stringify(program, null, 2)}`
      }
    ],
    'program_analysis'
  );
}

async function generateImprovedProgram(openai, businessName, initialProgram, analysis, driverAnalyses) {
  const improvementPrompt = `Create an improved version of this loyalty program addressing all identified issues while maintaining the same JSON structure.

Issues to address:
${JSON.stringify(analysis, null, 2)}

Driver Analyses:
${JSON.stringify(driverAnalyses, null, 2)}

Original Program:
${JSON.stringify(initialProgram, null, 2)}`;

  const improvedProgram = await makeOpenAIRequest(
    openai,
    [
      { 
        role: 'system', 
        content: `You are a loyalty program improvement specialist working on ${businessName}'s program. Return only valid JSON matching the original program structure.`
      },
      { 
        role: 'user', 
        content: improvementPrompt
      }
    ],
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
    timeout: 60000,
    maxRetries: 3
  });

  try {
    // Step 1: Generate initial program
    console.log('Generating initial program...');
    const initialProgram = await generateInitialProgram(openai, businessName);
    
    // Step 2: Analyze the program
    console.log('Analyzing program...');
    const analysis = await analyzeProgram(openai, initialProgram);
    
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

    console.log('Program generation complete');
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