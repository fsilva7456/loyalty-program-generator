import { accessDriver } from './accessDriver.js';
import { timeDriver } from './timeDriver.js';
import { financialDriver } from './financialDriver.js';
import { securityDriver } from './securityDriver.js';
import { learningDriver } from './learningDriver.js';

export const drivers = {
  access: accessDriver,
  time: timeDriver,
  financial: financialDriver,
  security: securityDriver,
  learning: learningDriver
};

export async function evaluateDriver(openai, driver, program) {
  console.log(`Starting evaluation for ${driver.name} driver`);

  const prompt = `Evaluate this loyalty program specifically on the ${driver.name} driver and its sub-drivers.
  
  ${driver.name} Driver Definition: ${driver.description}

  Sub-drivers to evaluate:
  ${Object.entries(driver.subDrivers)
    .map(([key, sub], index) => `${index + 1}. ${sub.name}: ${sub.description}`)
    .join('\n')}

  Return a detailed analysis in this exact JSON format:
  {
    "driverScore": "number 1-10",
    "overallAssessment": "string",
    "subDriverAnalysis": {
      ${Object.keys(driver.subDrivers)
        .map(key => `"${key}": {
          "score": "number 1-10",
          "strengths": ["string"],
          "weaknesses": ["string"],
          "improvements": ["string"]
        }`)
        .join(',\n      ')}
    }
  }

  Program to evaluate: ${JSON.stringify(program)}`;

  try {
    console.log(`Making OpenAI API call for ${driver.name} driver`);
    const evaluation = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are a loyalty program analyst specializing in evaluating ${driver.name} aspects of loyalty programs. Return only valid JSON matching the exact schema provided, with no additional text or markdown formatting.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    console.log(`Received response for ${driver.name} driver`);
    const cleanJson = evaluation.choices[0].message.content
      .replace(/```(json)?\n?/g, '')
      .trim();

    try {
      const parsedResult = JSON.parse(cleanJson);
      console.log(`Successfully parsed ${driver.name} driver evaluation`);
      return parsedResult;
    } catch (parseError) {
      console.error(`Error parsing ${driver.name} driver response:`, parseError);
      console.error('Raw response:', cleanJson);
      throw new Error(`Failed to parse ${driver.name} driver evaluation response: ${parseError.message}`);
    }
  } catch (error) {
    console.error(`Error in ${driver.name} driver evaluation:`, error);
    throw error;
  }
}