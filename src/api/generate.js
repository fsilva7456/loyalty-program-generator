import OpenAI from 'openai';
import { drivers, evaluateDriver } from '../drivers/index.js';

function cleanAndParseJSON(text) {
  try {
    // First, try direct parsing
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to clean the text
    console.log('Initial parse failed, attempting to clean JSON string');
    
    // Remove any markdown code blocks
    let cleaned = text.replace(/```(json)?\n?/g, '').replace(/\n```$/g, '');
    
    // Remove any non-JSON text before or after the JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    // Remove any trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,([\s\r\n]*[}\]])/g, '$1');
    
    // Remove any non-printable characters
    cleaned = cleaned.replace(/[^\x20-\x7E]/g, '');
    
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      console.error('Failed to parse cleaned JSON:', e2);
      console.error('Cleaned text:', cleaned);
      throw new Error(`Failed to parse JSON: ${e2.message}`);
    }
  }
}

async function generateInitialProgram(openai, businessName) {
  const systemPrompt = `You are a loyalty program design expert. Create detailed, practical loyalty programs tailored to specific businesses.
  Return only valid JSON without any additional text, markdown, or explanation, using this exact format:
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

  const userPrompt = `Create a comprehensive loyalty program for ${businessName}. Consider industry standards and customer expectations for this type of business. Be innovative and specific with the rewards structure. Return only the JSON response without any markdown formatting.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7
  });

  try {
    return cleanAndParseJSON(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error parsing program generation response:', error);
    console.error('Raw response:', completion.choices[0].message.content);
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

  // Collect all improvements from driver evaluations
  const driverImprovements = [];
  Object.entries(driverEvaluations).forEach(([driverName, evaluation]) => {
    if (evaluation.subDriverAnalysis) {
      Object.entries(evaluation.subDriverAnalysis).forEach(([subDriver, analysis]) => {
        if (analysis.improvements) {
          analysis.improvements.forEach(improvement => {
            driverImprovements.push({
              driver: driverName,
              subDriver,
              improvement
            });
          });
        }
      });
    }
  });

  const analysisPrompt = `Analyze this loyalty program for ${businessName} and identify potential weaknesses and areas for improvement. Consider:
  1. Customer psychology and motivation
  2. Industry competition
  3. Technical feasibility
  4. Cost effectiveness
  5. Customer pain points

  Return only valid JSON without any markdown formatting in this format:
  {
    "weaknesses": ["string"],
    "suggestedImprovements": ["string"]
  }

  Program to analyze: ${JSON.stringify(initialProgram)}`;

  const analysis = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'You are a critical loyalty program analyst. Return only plain JSON without any markdown formatting.' 
      },
      { role: 'user', content: analysisPrompt }
    ],
    temperature: 0.7
  });

  const analysisResult = cleanAndParseJSON(analysis.choices[0].message.content);

  // Generate improved version considering all general and driver-specific improvements
  const improvementPrompt = `Create an improved version of this loyalty program addressing both general weaknesses and specific driver improvements.

  General Weaknesses to Address:
  ${JSON.stringify(analysisResult.weaknesses)}

  General Improvements Suggested:
  ${JSON.stringify(analysisResult.suggestedImprovements)}

  Specific Driver Improvements:
  ${driverImprovements.map(imp => `[${imp.driver} - ${imp.subDriver}] ${imp.improvement}`).join('\n')}

  Original Program:
  ${JSON.stringify(initialProgram, null, 2)}

  Create a comprehensive improved version that addresses all these points while maintaining a cohesive and practical program design. Return only the JSON response using the exact same format as the original program, with no additional text or formatting.`;

  const improved = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'You are a loyalty program design expert. Return only plain JSON without any markdown formatting, using the same schema as the original program. Do not include any additional text or explanations.' 
      },
      { role: 'user', content: improvementPrompt }
    ],
    temperature: 0.7
  });

  const improvedProgram = cleanAndParseJSON(improved.choices[0].message.content);

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