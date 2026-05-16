const { callAI } = require('../../utils/ai.util');

/**
 * Admin Copilot Engine
 */
const assistAdmin = async (request, context = {}) => {
  const prompt = `
  Administrative Tactical Support.
  Request: "${request}"
  Context: ${JSON.stringify(context)}
  
  TASK:
  1. Generate professional administrative content (announcements, schedules, or reports).
  2. Maintain a clear, authoritative, yet supportive NGO tone.
  3. Return a JSON object with:
     "draft": "The generated text",
     "tone_analysis": "Explanation of the communication style",
     "next_steps": ["Action 1", "Action 2"]
  `;

  return await callAI(prompt, "google/gemma-3n-e4b-it", 0.7);
};

module.exports = { assistAdmin };
