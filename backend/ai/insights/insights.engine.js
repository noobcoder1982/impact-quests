const { callAI } = require('../../utils/ai.util');

/**
 * Resource Insights Engine
 */
const detectResourceShortages = async (inventory, activeMissions) => {
  const prompt = `
  Tactical Logistics Analysis.
  Current Inventory: ${JSON.stringify(inventory)}
  Active Missions: ${JSON.stringify(activeMissions)}
  
  TASK:
  1. Predict resource shortages based on mission demand.
  2. Suggest optimized reallocation.
  3. Return a JSON object with:
     "shortages": [ { "item": "Name", "urgency": "High/Med/Low", "reason": "Why" } ],
     "suggestions": [ { "action": "Reallocate X from Y to Z", "impact": "Description" } ]
  `;

  return await callAI(prompt);
};

module.exports = { detectResourceShortages };
