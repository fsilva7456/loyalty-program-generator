import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function generateLoyaltyProgram(businessName) {
  const prompt = `Create a detailed loyalty program design for ${businessName}. Include:
  1. Program name
  2. Point system structure
  3. Rewards and benefits
  4. Membership tiers (if applicable)
  5. Special perks
  6. Sign-up process

Format the response as a JSON object.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a loyalty program design expert. Create detailed, practical loyalty programs tailored to specific businesses. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate loyalty program');
  }
}