import { accessDriver } from './accessDriver';
import { timeDriver } from './timeDriver';
import { financialDriver } from './financialDriver';

export const drivers = {
  access: accessDriver,
  time: timeDriver,
  financial: financialDriver
};

export const evaluateDriver = async (openai, driver, program) => {
  console.log(`Starting evaluation for ${driver.name} driver`);

  const prompt = `Evaluate this loyalty program specifically on the ${driver.name} driver and its sub-drivers. Return a detailed analysis in JSON format.
  
  ${driver.name} Driver Definition: ${driver.description}

  Sub-drivers to evaluate:
  ${Object.entries(driver.subDrivers)
    .map(([key, sub], index) => `${index + 1}. ${sub.name}: ${sub.description}`)
    .join('\n')}

  Program to evaluate: ${JSON.stringify(program)}

  Return the evaluation in this exact JSON format:
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
  }`;

  try {
    console.log(`Making OpenAI API call for ${driver.name} driver`);
    const evaluation = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: `You are a loyalty program analyst specializing in evaluating ${driver.name} aspects of loyalty programs. Be specific and practical in your analysis.`
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
};