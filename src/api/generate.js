async function analyzeAndImprove(openai, businessName, initialProgram) {
  // Get Access driver evaluation
  console.log('Evaluating Access driver...');
  const accessEvaluation = await evaluateAccessDriver(openai, initialProgram);

  // Get Time driver evaluation
  console.log('Evaluating Time driver...');
  const timeEvaluation = await evaluateTimeDriver(openai, initialProgram);

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
        content: `${analysisPrompt}\n\nProgram to analyze: ${JSON.stringify(initialProgram)}` 
      }
    ],
    temperature: 0.7
  });

  const cleanAnalysisJson = cleanJsonString(analysis.choices[0].message.content);
  const analysisResult = JSON.parse(cleanAnalysisJson);

  // Generate improved version considering both Access and Time evaluations
  const improvementPrompt = `Create an improved version of this loyalty program addressing these weaknesses: ${JSON.stringify(analysisResult.weaknesses)}
    
    Consider the following driver evaluations:
    Access Driver: ${JSON.stringify(accessEvaluation)}
    Time Driver: ${JSON.stringify(timeEvaluation)}

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
        content: `Original program: ${JSON.stringify(initialProgram)}\n\n${improvementPrompt}` 
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
      accessEvaluation,
      timeEvaluation
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