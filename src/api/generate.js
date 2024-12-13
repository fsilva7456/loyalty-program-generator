import OpenAI from 'openai';
import { drivers, evaluateDriver } from '../drivers/index.js';

async function generateInitialProgram(openai, businessName) {
  const prompt = `Create a comprehensive loyalty program for ${businessName}. Consider industry standards and customer expectations for this type of business. Be innovative and specific with the rewards structure.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { 
        role: 'system', 
        content: 'You are a loyalty program design expert. Create detailed, practical loyalty programs tailored to specific businesses.'
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: "json_object" },
    functions: [
      {
        name: "create_loyalty_program",
        parameters: {
          type: "object",
          properties: {
            programName: { type: "string" },
            description: { type: "string" },
            pointSystem: {
              type: "object",
              properties: {
                earning: { type: "string" },
                redemption: { type: "string" }
              },
              required: ["earning", "redemption"]
            },
            tiers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  requirements: { type: "string" },
                  benefits: { type: "array", items: { type: "string" } }
                },
                required: ["name", "requirements", "benefits"]
              }
            },
            specialPerks: { type: "array", items: { type: "string" } },
            signupProcess: { type: "string" }
          },
          required: ["programName", "description", "pointSystem", "tiers", "specialPerks", "signupProcess"]
        }
      }
    ],
    function_call: { name: "create_loyalty_program" },
    temperature: 0.7
  });

  try {
    const functionCallArguments = completion.choices[0].message.function_call.arguments;
    return JSON.parse(functionCallArguments);
  } catch (error) {
    console.error('Error parsing program generation response:', error);
    console.error('Raw response:', completion.choices[0].message);
    throw new Error('Failed to parse program generation response');
  }
}

async function analyzeAndImprove(openai, businessName, initialProgram) {
  // Evaluate all drivers
  const driverEvaluations = {};
  const driverNames = Object.keys(drivers);
  
  console.log('Evaluating drivers:', driverNames);
  
  try {
    for (const driverKey of driverNames) {
      console.log(`Starting evaluation for ${driverKey} driver...`);
      try {
        const evaluation = await evaluateDriver(openai, drivers[driverKey], initialProgram);
        console.log(`Successfully evaluated ${driverKey} driver`);
        driverEvaluations[driverKey] = evaluation;
      } catch (driverError) {
        console.error(`Error evaluating ${driverKey} driver:`, driverError);
        throw driverError;
      }
    }
  } catch (error) {
    console.error('Error during driver evaluations:', error);
    throw error;
  }

  console.log('All driver evaluations complete:', Object.keys(driverEvaluations));

  const analysisPrompt = `Analyze this loyalty program for ${businessName} and identify potential weaknesses and areas for improvement, considering:
  1. Customer psychology and motivation
  2. Industry competition
  3. Technical feasibility
  4. Cost effectiveness
  5. Customer pain points

  Program to analyze: ${JSON.stringify(initialProgram)}`;

  const analysis = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { 
        role: 'system', 
        content: 'You are a critical loyalty program analyst. Return a structured analysis of program weaknesses and improvements.'
      },
      { role: 'user', content: analysisPrompt }
    ],
    response_format: { type: "json_object" },
    functions: [
      {
        name: "analyze_program",
        parameters: {
          type: "object",
          properties: {
            weaknesses: { type: "array", items: { type: "string" } },
            suggestedImprovements: { type: "array", items: { type: "string" } }
          },
          required: ["weaknesses", "suggestedImprovements"]
        }
      }
    ],
    function_call: { name: "analyze_program" },
    temperature: 0.7
  });

  const analysisResult = JSON.parse(analysis.choices[0].message.function_call.arguments);

  // Generate improved version considering all driver evaluations
  const evaluationSummary = Object.entries(driverEvaluations)
    .map(([driverName, driverResult]) => `${driverName}: ${JSON.stringify(driverResult)}`)
    .join('\n');

  const improvementPrompt = `Create an improved version of this loyalty program addressing these weaknesses: ${JSON.stringify(analysisResult.weaknesses)}
    
    Consider the following driver evaluations:
    ${evaluationSummary}

    Original program: ${JSON.stringify(initialProgram)}`;

  const improved = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { 
        role: 'system', 
        content: 'You are a loyalty program design expert. Create an improved version of the program that addresses identified weaknesses.'
      },
      { role: 'user', content: improvementPrompt }
    ],
    response_format: { type: "json_object" },
    functions: [
      {
        name: "create_loyalty_program",
        parameters: {
          type: "object",
          properties: {
            programName: { type: "string" },
            description: { type: "string" },
            pointSystem: {
              type: "object",
              properties: {
                earning: { type: "string" },
                redemption: { type: "string" }
              },
              required: ["earning", "redemption"]
            },
            tiers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  requirements: { type: "string" },
                  benefits: { type: "array", items: { type: "string" } }
                },
                required: ["name", "requirements", "benefits"]
              }
            },
            specialPerks: { type: "array", items: { type: "string" } },
            signupProcess: { type: "string" }
          },
          required: ["programName", "description", "pointSystem", "tiers", "specialPerks", "signupProcess"]
        }
      }
    ],
    function_call: { name: "create_loyalty_program" },
    temperature: 0.7
  });

  const improvedProgram = JSON.parse(improved.choices[0].message.function_call.arguments);

  return {
    initial: initialProgram,
    analysis: {
      weaknesses: analysisResult.weaknesses,
      suggestedImprovements: analysisResult.suggestedImprovements,
      drivers: driverEvaluations
    },
    improved: improvedProgram
  };
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
    
    console.log('Analyzing and improving program...');
    const result = await analyzeAndImprove(openai, businessName, initialProgram);
    
    console.log('Program generation complete');
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error.response) {
      console.error('OpenAI API response:', error.response.data);
    }
    throw new Error(`Failed to generate loyalty program: ${error.message}`);
  }
}