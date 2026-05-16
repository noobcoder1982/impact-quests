const { callAI } = require('../../utils/ai.util');

/**
 * Volunteer Matching Engine
 */
const matchVolunteers = async (task, volunteers) => {
  const prompt = `
  Tactical Personnel Matching Required.
  Mission: "${task.title}" (${task.category})
  Priority: ${task.urgency}
  Description: "${task.description}"
  
  Personnel Roster:
  ${volunteers.map(v => `- ID: ${v._id}, Name: ${v.name}, Skills: ${v.skills.join(', ')}, Reliability: ${v.reliabilityScore}`).join('\n')}
  
  TASK:
  1. Rank these volunteers based on skill alignment and reliability.
  2. Return a JSON object with:
     "matches": [ { "volunteerId": "ID", "score": 0-100, "reasoning": "Brief explanation" } ]
  `;

  return await callAI(prompt);
};

module.exports = { matchVolunteers };
