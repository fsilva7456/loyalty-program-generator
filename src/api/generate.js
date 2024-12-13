import OpenAI from 'openai';

function cleanJsonString(str) {
  str = str.replace(/```(json)?\\n?/g, '');
  str = str.trim();
  return str;
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

  const cleanJson = cleanJsonString(completion.choices[0].message.content);
  return JSON.parse(cleanJson);
}

async function evaluateAccessDriver(openai, program) {
  const accessPrompt = `Evaluate this loyalty program specifically on the Access driver and its sub-drivers. Return a detailed analysis in JSON format.
  
  Access Driver Definition: This category is about providing exclusive or priority access to products, services, events, or experiences not readily available to the general public or non-members.

  Sub-drivers to evaluate:
  1. Exclusivity of Offerings
  2. Priority Service
  3. VIP Experiences
  4. Behind-the-Scenes Access
  5. Members-Only Content
  6. Limited Edition Products
  7. Networking Opportunities

  Program to evaluate: ${JSON.stringify(program)}

  Return the evaluation in this exact JSON format:
  {
    "driverScore": "number 1-10",
    "overallAssessment": "string",
    "subDriverAnalysis": {
      "exclusivityOfOfferings": {
        "score": "number 1-10",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "improvements": ["string"]
      },
      "priorityService": {
        "score": "number 1-10",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "improvements": ["string"]
      },
      "vipExperiences": {
        "score": "number 1-10",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "improvements": ["string"]
      },
      "behindTheScenes": {
        "score": "number 1-10",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "improvements": ["string"]
      },
      "membersOnlyContent": {
        "score": "number 1-10",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "improvements": ["string"]
      },
      "limitedEditionProducts": {
        "score": "number 1-10",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "improvements": ["string"]
      },
      "networkingOpportunities": {
        "score": "number 1-10",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "improvements": ["string"]
      }
    }
  }`;

  const evaluation = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'You are a loyalty program analyst specializing in evaluating Access aspects of loyalty programs. Be specific and practical in your analysis.'
      },
      { role: 'user', content: accessPrompt }
    ],
    temperature: 0.7
  });

  const cleanJson = cleanJsonString(evaluation.choices[0].message.content);
  return JSON.parse(cleanJson);
}

async function analyzeAndImprove(openai, businessName, initialProgram) {
  // Get Access driver evaluation
  console.log('Evaluating Access driver...');
  const accessEvaluation = await evaluateAccessDriver(openai, initialProgram);

  const analysisPrompt = `Analyze this loyalty program for ${businessName} and identify potential weaknesses or areas for improvement. Consider:
  1. Customer psychology and motivation
  2. Industry competition
  3. Technical feasibility
  4. Cost effectiveness
  5. Customer pain points
  Return only valid JSON without any markdown formatting in this format:
  {
    "weaknesses": ["string"],
    "suggestedImprovements": ["string"]
  }`;

  const analysis = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'You are a critical loyalty program analyst. Return only plain JSON without any markdown formatting.' 
      },
      { 
        role: 'user', 
        content: `${analysisPrompt}\\n\\nProgram to analyze: ${JSON.stringify(initialProgram)}` 
      }
    ],
    temperature: 0.7
  });

  const cleanAnalysisJson = cleanJsonString(analysis.choices[0].message.content);
  const analysisResult = JSON.parse(cleanAnalysisJson);

  // Generate improved version considering Access evaluation
  const improvementPrompt = `Create an improved version of this loyalty program addressing these weaknesses: ${JSON.stringify(analysisResult.weaknesses)}
    
    Also consider the Access driver evaluation: ${JSON.stringify(accessEvaluation)}

    Return only plain JSON without any markdown formatting.`;

  const improved = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'You are a loyalty program design expert. Return only plain JSON without any markdown formatting, using the same schema as the original program.' 
      },
      { 
        role: 'user', 
        content: `Original program: ${JSON.stringify(initialProgram)}\\n\\n${improvementPrompt}` 
      }
    ],
    temperature: 0.7
  });

  const cleanImprovedJson = cleanJsonString(improved.choices[0].message.content);
  const improvedProgram = JSON.parse(cleanImprovedJson);

  return {
    initial: initialProgram,
    analysis: {
      ...analysisResult,
      accessEvaluation
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