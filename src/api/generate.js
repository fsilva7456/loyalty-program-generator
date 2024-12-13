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
  // Example program structure with behavioral elements
  const exampleProgram = {
    programName: "Example Rewards",
    description: "A program incorporating loss aversion and goal gradient effects...",
    behavioralPrinciples: [
      {
        principle: "Loss Aversion",
        application: "Points expire monthly, creating urgency to maintain status"
      },
      {
        principle: "Goal Gradient Effect",
        application: "Progress bars show proximity to next reward tier"
      }
    ],
    pointSystem: {
      earning: "10 points per dollar, with accelerators near tier thresholds",
      redemption: "Flexible redemption with better value at higher tiers",
      bonusMechanics: "Surprise bonus point events create variable rewards"
    },
    tiers: [
      {
        name: "Silver",
        requirements: "0-1000 points",
        benefits: ["Basic earning rate", "Standard redemptions"],
        psychologicalBenefits: ["Immediate progress visualization", "Clear next-tier preview"]
      }
    ],
    engagementMechanics: {
      habitLoops: "Daily check-in rewards with increasing value streaks",
      socialElements: "Member spotlights and social sharing incentives",
      progressTracking: "Visual progress bars and milestone celebrations"
    },
    specialPerks: ["Limited-time exclusive offers"],
    immediateValue: "Instant reward upon signup"
  };

  const systemPrompt = `You are a loyalty program design expert with deep knowledge of behavioral science principles.

  Create a loyalty program that deliberately applies these behavioral principles:
  1. Loss Aversion - Create mechanics where members want to avoid losing status/points
  2. Goal Gradient Effect - Show clear progress and increase rewards as goals approach
  3. Social Proof - Add social comparison and community elements
  4. Scarcity - Include limited-time or exclusive elements
  5. Variable Rewards - Mix predictable and surprise rewards

  Here's an example program structure showing how to incorporate behavioral elements:
  ${JSON.stringify(exampleProgram, null, 2)}

  Use this exact same structure for your response, ensuring every behavioral principle is explicitly defined and applied.`;

  const userPrompt = `Create a loyalty program for ${businessName} that uses behavioral science to drive engagement.

  Your response must include:
  1. At least 3 specific behavioral principles with their applications
  2. Point system mechanics that create clear goals and progress
  3. Tier benefits with both practical and psychological rewards
  4. Engagement mechanics that establish habits
  5. Variable reward elements to maintain excitement

  Use the exact same JSON structure as the example program.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system',
        content: systemPrompt
      },
      { 
        role: 'user',
        content: userPrompt
      }
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
  // Rest of the function remains the same...
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