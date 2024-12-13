import OpenAI from 'openai';

async function generateInitialProgram(openai, businessName) {
  const systemPrompt = `You are a loyalty program design expert. Create detailed, practical loyalty programs tailored to specific businesses.
  Return only valid JSON without any additional text or explanation, using this exact format:
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

  const userPrompt = `Create a comprehensive loyalty program for ${businessName}. Consider industry standards and customer expectations for this type of business. Be innovative and specific with the rewards structure. Return only the JSON response.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7
  });

  return JSON.parse(completion.choices[0].message.content);
}

async function analyzeAndImprove(openai, businessName, initialProgram) {
  const analysisPrompt = `Analyze this loyalty program for ${businessName} and identify potential weaknesses or areas for improvement. Consider:
  1. Customer psychology and motivation
  2. Industry competition
  3. Technical feasibility
  4. Cost effectiveness
  5. Customer pain points
  Return only valid JSON in this format:
  {
    "weaknesses": ["string"],
    "suggestedImprovements": ["string"]
  }`;

  const analysis = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a critical loyalty program analyst.' },
      { role: 'user', content: `${analysisPrompt}\n\nProgram to analyze: ${JSON.stringify(initialProgram)}` }
    ],
    temperature: 0.7
  });

  const analysisResult = JSON.parse(analysis.choices[0].message.content);

  // Generate improved version
  const improvementPrompt = `Create an improved version of this loyalty program addressing these weaknesses: ${JSON.stringify(analysisResult.weaknesses)}\n\nSuggested improvements: ${JSON.stringify(analysisResult.suggestedImprovements)}`;

  const improved = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a loyalty program design expert. Return only the improved program in the same JSON format as the original.' },
      { role: 'user', content: `Original program: ${JSON.stringify(initialProgram)}\n\n${improvementPrompt}` }
    ],
    temperature: 0.7
  });

  const improvedProgram = JSON.parse(improved.choices[0].message.content);

  return {
    initial: initialProgram,
    analysis: analysisResult,
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