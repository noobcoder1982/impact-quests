const { callAI } = require('../../utils/ai.util');

/**
 * Mission Planning AI
 */
const generateMissionPlan = async (missionDescription) => {
  const prompt = `
  Disaster Response Operational Planning.
  Incident: "${missionDescription}"
  
  TASK:
  1. Generate a step-by-step operational plan.
  2. Identify required resources and personnel roles.
  3. Estimate timeline and potential risks.
  4. Return a JSON object with:
     "plan": [ { "step": 1, "action": "Description", "duration": "Estimate" } ],
     "requirements": { "skills": [], "inventory": [] },
     "riskAssessment": "Strategic overview of hazards"
  `;

  return await callAI(prompt);
};

module.exports = { generateMissionPlan };
