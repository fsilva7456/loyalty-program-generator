import OpenAI from 'openai';

function cleanJsonString(str) {
  str = str.replace(/```(json)?\n?/g, '');
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