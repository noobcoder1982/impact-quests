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
  3. Determine a strategic focus sector (e.g. "Sector Delta", "Sector Alpha", "Sector Epsilon", etc.) based on where the critical tasks/missions or shortages are located.
  4. Write a brief strategic neural directive starting with 'Focus deployments on <focusSector>.' outlining the high-level focus.
  5. Return a JSON object with EXACTLY the following structure:
     {
       "focusSector": "Sector Name",
       "directive": "Focus deployments on <Sector Name>. Brief 1-2 sentence description of why and what to prioritize.",
       "shortages": [ { "item": "Name", "urgency": "High/Med/Low", "reason": "Why" } ],
       "suggestions": [ { "action": "Reallocate X from Y to Z", "impact": "Description" } ]
     }
  `;

  return await callAI(prompt);
};

module.exports = { detectResourceShortages };

