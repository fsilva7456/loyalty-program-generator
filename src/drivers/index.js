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

  Program to evaluate: ${JSON.stringify(program)}`;

  try {
    console.log(`Making OpenAI API call for ${driver.name} driver`);
    const evaluation = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: `You are a loyalty program analyst specializing in evaluating ${driver.name} aspects of loyalty programs. Always return a valid JSON response matching the exact schema provided.`
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
      functions: [
        {
          name: "analyze_driver",
          parameters: {
            type: "object",
            properties: {
              driverScore: { type: "number", description: "Score from 1-10" },
              overallAssessment: { type: "string" },
              subDriverAnalysis: {
                type: "object",
                properties: Object.fromEntries(
                  Object.keys(driver.subDrivers).map(key => [
                    key,
                    {
                      type: "object",
                      properties: {
                        score: { type: "number", description: "Score from 1-10" },
                        strengths: { type: "array", items: { type: "string" } },
                        weaknesses: { type: "array", items: { type: "string" } },
                        improvements: { type: "array", items: { type: "string" } }
                      },
                      required: ["score", "strengths", "weaknesses", "improvements"]
                    }
                  ])
                )
              }
            },
            required: ["driverScore", "overallAssessment", "subDriverAnalysis"]
          }
        }
      ],
      function_call: { name: "analyze_driver" },
      temperature: 0.7
    });

    console.log(`Received response for ${driver.name} driver`);
    const functionCallArguments = evaluation.choices[0].message.function_call.arguments;
    
    try {
      const parsedResult = JSON.parse(functionCallArguments);
      console.log(`Successfully parsed ${driver.name} driver evaluation`);
      return parsedResult;
    } catch (parseError) {
      console.error(`Error parsing ${driver.name} driver response:`, parseError);
      console.error('Raw response:', functionCallArguments);
      throw new Error(`Failed to parse ${driver.name} driver evaluation response: ${parseError.message}`);
    }
  } catch (error) {
    console.error(`Error in ${driver.name} driver evaluation:`, error);
    throw error;
  }
}