import OpenAI from 'openai';
import { drivers, evaluateDriver } from '../drivers/index.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeOpenAIRequest(openai, messages, model = 'gpt-4', temperature = 0.7) {
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: 2500
      });

      if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI');
      }

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw content:', content);
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
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
    description: "A loyalty program focused on customer engagement and rewards",
    pointSystem: {
      earning: "1 point per dollar spent",
      redemption: "100 points = $1 in rewards"
    },
    tiers: [
      {
        name: "Bronze",
        requirements: "0-499 points",
        benefits: ["Basic member discounts", "Birthday reward"]
      }
    ],
    specialPerks: ["Welcome bonus", "Referral rewards"],
    signupProcess: "Simple online registration with email and basic info"
  };

  const systemPrompt = `Create a loyalty program for ${businessName}. Return a JSON object matching this structure exactly:

${JSON.stringify(exampleProgram, null, 2)}

Include:
- A memorable program name
- Clear points system
- At least 3 membership tiers
- Engaging special perks
- Simple signup process`;

  return await makeOpenAIRequest(openai, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Generate the complete program JSON.' }
  ]);
}

async function analyzeProgram(openai, program) {
  const analysisPrompt = `Analyze this loyalty program focusing on:
1. Program weaknesses
2. Potential improvements
3. Behavioral principles used
4. Missed opportunities

Return a JSON object with this structure:
{
  "weaknesses": ["string"],
  "suggestedImprovements": ["string"],
  "behavioralAnalysis": {
    "effectivePrinciples": ["string"],
    "missedOpportunities": ["string"]
  }
}`;

  return await makeOpenAIRequest(openai, [
    { 
      role: 'system', 
      content: 'You are a loyalty program analyst specializing in behavioral science and customer psychology.'
    },
    { 
      role: 'user', 
      content: `${analysisPrompt}\n\nProgram to analyze: ${JSON.stringify(program, null, 2)}`
    }
  ]);
}

async function generateImprovedProgram(openai, businessName, initialProgram, analysis, driverAnalyses) {
  const improvementPrompt = `Create an improved version of this loyalty program addressing all identified issues.

Use the exact same JSON structure as the original program.

Original Program:
${JSON.stringify(initialProgram, null, 2)}

Analysis:
${JSON.stringify(analysis, null, 2)}

Driver Analyses:
${JSON.stringify(driverAnalyses, null, 2)}`;

  return await makeOpenAIRequest(openai, [
    { 
      role: 'system', 
      content: `You are a loyalty program improvement specialist working on ${businessName}'s program. Return only a JSON object matching the original structure.`
    },
    { 
      role: 'user', 
      content: improvementPrompt
    }
  ]);
}

export async function generateLoyaltyProgram(businessName) {
  console.log('Starting loyalty program generation for:', businessName);
  
  if (!process.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found in environment variables');
  }

  const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY
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