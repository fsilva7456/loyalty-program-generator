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

async function evaluateAccessDriver(openai, program) {
  const accessPrompt = `Evaluate this loyalty program specifically on the Access driver and its sub-drivers. Return a detailed analysis in JSON format.
  
  Access Driver Definition: This category is about providing exclusive or priority access to products, services, events, or experiences not readily available to the general public or non-members.

  Sub-drivers to evaluate:
  1. Exclusivity of Offerings: Offering members early or exclusive access to new products, services, or events.
  2. Priority Service: Providing members with priority service options like expedited shipping or dedicated support.
  3. VIP Experiences: Granting access to special events and experiences.
  4. Behind-the-Scenes Access: Allowing glimpses into exclusive content and insider knowledge.
  5. Members-Only Content: Providing exclusive content, tutorials, webinars, or forums.
  6. Limited Edition Products: Offering access to purchase limited edition items before the public.
  7. Networking Opportunities: Facilitating exclusive networking events or connections.

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