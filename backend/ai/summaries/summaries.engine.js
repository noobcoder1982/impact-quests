const { callAI } = require('../../utils/ai.util');

/**
 * Smart Summaries Engine
 */
const summarizeActivity = async (data, type = 'general') => {
  const prompt = `
  Intelligence Synthesis Required (Type: ${type}).
  Source Data: "${JSON.stringify(data)}"
  
  TASK:
  1. Provide a concise, high-impact summary of the data.
  2. Highlight critical actions or anomalies.
  3. Return a JSON object with:
     "summary": "The main text",
     "critical_points": ["Point 1", "Point 2"],
     "sentiment": "Tone of the activity"
  `;

  return await callAI(prompt);
};

module.exports = { summarizeActivity };
