import OpenAI from 'openai';
import { drivers, evaluateDriver } from '../drivers/index.js';

function cleanAndParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('Initial parse failed, attempting to clean JSON string');
    let cleaned = text.replace(/```(json)?\n?/g, '').replace(/\n```$/g, '');
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    cleaned = cleaned.replace(/,([\s\r\n]*[}\]])/g, '$1');
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
  const systemPrompt = `You are a loyalty program design expert with deep knowledge of behavioral science principles. Create detailed, practical loyalty programs that effectively leverage behavioral psychology to drive engagement and loyalty.

  Consider these behavioral science principles in your design:
  1. Loss Aversion - People are more motivated to avoid losses than to acquire gains
  2. Goal Gradient Effect - Motivation increases as people get closer to goals
  3. Endowed Progress Effect - People are more likely to complete goals if they feel they've already made progress
  4. Social Proof - People look to others' behavior to guide their own
  5. Scarcity - Items/opportunities perceived as scarce are more valuable
  6. Variable Rewards - Unpredictable rewards create stronger engagement
  7. Choice Architecture - How options are presented influences decisions
  8. Habit Formation - Programs should create engagement loops and routines
  9. Status Quo Bias - People tend to stick with default options
  10. Hyperbolic Discounting - Immediate rewards are valued more than future ones

  Return only valid JSON without any additional text, markdown, or explanation, using this exact format:
  {
    "programName": "string",
    "description": "string",
    "behavioralPrinciples": {
      "primaryPrinciples": [{
        "principle": "string",
        "application": "string"
      }]
    },
    "pointSystem": {
      "earning": "string",
      "redemption": "string",
      "bonusMechanics": "string"
    },
    "tiers": [
      {
        "name": "string",
        "requirements": "string",
        "benefits": ["string"],
        "psychologicalBenefits": ["string"]
      }
    ],
    "engagement": {
      "habitLoops": "string",
      "socialElements": "string",
      "progressFeedback": "string"
    },
    "specialPerks": ["string"],
    "exclusiveAccess": ["string"],
    "signupProcess": "string",
    "immediateValue": "string"
  }`;

  const userPrompt = `Create a comprehensive loyalty program for ${businessName} that effectively applies behavioral science principles. Consider industry standards and customer expectations, but focus on creating engaging mechanics that tap into core human psychology and motivation. Make the program both innovative and psychologically compelling.

  For each aspect of the program:
  1. Point system should create clear goal gradients and progress visualization
  2. Tiers should leverage status motivations and loss aversion
  3. Special perks should use scarcity and exclusivity principles
  4. Engagement mechanics should establish clear habit loops
  5. Include variable reward elements to maintain excitement

  Return only the JSON response without any markdown formatting.`;

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

  const analysisPrompt = `Analyze this loyalty program for ${businessName}, focusing on both practical aspects and behavioral science principles.

  Consider:
  1. Customer psychology and motivation
  2. Habit formation and engagement loops
  3. Goal structures and progress mechanics
  4. Social proof and status elements
  5. Variable reward effectiveness
  6. Loss aversion triggers
  7. Technical feasibility
  8. Cost effectiveness

  Return only valid JSON without any markdown formatting in this format:
  {
    "weaknesses": ["string"],
    "suggestedImprovements": ["string"],
    "behavioralAnalysis": {
      "effectivePrinciples": ["string"],
      "missedOpportunities": ["string"]
    }
  }

  Program to analyze: ${JSON.stringify(initialProgram)}`;

  const analysis = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'You are a loyalty program analyst specializing in behavioral science and customer psychology. Return only plain JSON without any markdown formatting.' 
      },
      { role: 'user', content: analysisPrompt }
    ],
    temperature: 0.7
  });

  const analysisResult = cleanAndParseJSON(analysis.choices[0].message.content);

  const improvementPrompt = `Create an improved version of this loyalty program addressing both general weaknesses and specific driver improvements, while strengthening behavioral science elements.

  General Weaknesses to Address:
  ${JSON.stringify(analysisResult.weaknesses)}

  General Improvements Suggested:
  ${JSON.stringify(analysisResult.suggestedImprovements)}

  Behavioral Analysis:
  ${JSON.stringify(analysisResult.behavioralAnalysis)}

  Specific Driver Improvements:
  ${driverImprovements.map(imp => `[${imp.driver} - ${imp.subDriver}] ${imp.improvement}`).join('\n')}

  Original Program:
  ${JSON.stringify(initialProgram, null, 2)}

  Create a comprehensive improved version that addresses all points while strengthening behavioral mechanics. Return only the JSON response using the exact same format as the original program.`;

  const improved = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'You are a loyalty program design expert specializing in behavioral science. Return only plain JSON without any markdown formatting, using the same schema as the original program.' 
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
      behavioralAnalysis: analysisResult.behavioralAnalysis,
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