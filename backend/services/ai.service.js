const { callAI } = require('../utils/ai.util');
const { matchVolunteers } = require('../ai/matching/matching.engine');
const { generateMissionPlan } = require('../ai/planning/planning.engine');
const { summarizeActivity } = require('../ai/summaries/summaries.engine');
const { detectResourceShortages } = require('../ai/insights/insights.engine');
const { assistAdmin } = require('../ai/copilot/copilot.engine');

/**
 * AI Intelligence Layer (Refactored Service)
 */
const aiService = {
  // Legacy support & Incident Analysis
  analyzeCrisisReport: async (description) => {
    const prompt = `Analyze this disaster response report: "${description}". Extract intent, category, urgency, and location. Return JSON.`;
    return await callAI(prompt);
  },

  // Module-based features
  matchVolunteersForTask: async (task, volunteers) => {
    return await matchVolunteers(task, volunteers);
  },

  recommendInventoryForTask: async (task, inventory) => {
    const prompt = `Recommend 3 critical assets from ${JSON.stringify(inventory)} for mission "${task.title}". Return JSON array.`;
    return await callAI(prompt);
  },

  suggestCareerPath: async (user, recentTasks) => {
    const prompt = `Analyze volunteer "${user.name}" with skills ${user.skills} and recent tasks ${JSON.stringify(recentTasks)}. Suggest 2 new skills and a trending specialist title. Return JSON.`;
    return await callAI(prompt);
  },

  // Live Assistant (Unified Chat) - Enhanced with Mode Support
  handleChat: async (message, context = {}) => {
    const roleRules = {
      volunteer: "Focus on mission details and how they can help.",
      customer: "Focus on general mission progress and safety status. Maintain security.",
      ngo: "Full strategic access. Provide deep resource management advice."
    };

    // Detect if message is casual/simple
    const casualGreetings = /^(hi|hello|hey|sup|yo|greetings|good morning|good afternoon|good evening|thanks|thank you|ok|okay|cool|nice|great)$/i;
    const isCasual = casualGreetings.test(message.trim());

    // Mode-specific instructions
    const modeInstructions = {
      general: isCasual
        ? "Respond warmly and briefly to casual messages. Keep it friendly and concise (1-2 sentences max)."
        : "Provide helpful, professional assistance. Use markdown formatting: **bold** for emphasis, ## for headers, - for lists, and > for quotes.",
      mission: `You are a Mission Intelligence Analyst.
${isCasual ? "Respond briefly and professionally." : `When given incident reports:
1. Extract key details (location, severity, victim count, resources needed)
2. Categorize the incident (disaster-relief, medical, logistics, etc.)
3. Assess urgency level (low, medium, high, critical)
4. Suggest immediate actions and required resources
5. Use markdown: **bold** for critical info, ## for sections, - for lists`}`,
      tactical: `You are a Tactical Operations Advisor.
${isCasual ? "Respond briefly and professionally." : `Provide:
1. Strategic resource allocation recommendations
2. Volunteer deployment optimization
3. Risk assessment and mitigation strategies
4. Timeline and logistics planning
5. Use markdown: **bold** for key points, ## for sections, - for action items`}`,
      creative: isCasual
        ? "Respond warmly and briefly."
        : "Think outside the box, suggest innovative solutions. Use markdown: **bold** for ideas, ## for categories, - for suggestions."
    };

    const chatMode = context.mode || 'general';
    const modeInstruction = modeInstructions[chatMode] || modeInstructions.general;

    // Include conversation history for context
    const conversationContext = context.conversationHistory
      ? `\n\nRecent Conversation:\n${context.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}`
      : '';

    const lengthGuidance = isCasual
      ? "Keep response VERY SHORT (1-2 sentences). Be warm and friendly."
      : "Provide detailed, well-structured response with markdown formatting.";

    const prompt = `
    ImpactQuest AI Coordinator - ${chatMode.toUpperCase()} MODE
    
    Mode Instructions: ${modeInstruction}
    
    User Message: "${message}"
    User Role: ${context.user?.role || 'guest'}
    User Directive: ${roleRules[context.user?.role] || "Be helpful and professional."}
    ${conversationContext}
    
    ${context.site_intelligence ? `\nCurrent System Status:
- Active Missions: ${context.site_intelligence.active_missions?.length || 0}
- Available Inventory Items: ${context.site_intelligence.inventory_status?.length || 0}` : ''}
    
    RESPONSE GUIDELINES:
    ${lengthGuidance}
    
    MARKDOWN FORMATTING (for detailed responses):
    - Use **bold** for emphasis and key terms
    - Use ## for section headers
    - Use - for bullet points
    - Use > for important quotes or warnings
    - Use \`code\` for technical terms
    - Use --- for separators
    
    IMPORTANT: Return ONLY a JSON object with this exact structure:
    {
      "content": "your response here with markdown formatting",
      "metadata": {
        "mode": "${chatMode}",
        "analysis": "brief summary if applicable",
        "suggestions": ["suggestion1", "suggestion2"],
        "responseType": "${isCasual ? 'casual' : 'detailed'}"
      }
    }
    `;

    return await callAI(prompt, "google/gemma-3n-e4b-it", chatMode === 'creative' ? 0.9 : 0.7);
  },

  // New: Enhanced Mission Analysis
  analyzeMissionIntelligence: async (description) => {
    const prompt = `
    MISSION INTELLIGENCE EXTRACTION
    
    Incident Report: "${description}"
    
    TASK: Analyze this incident and extract structured intelligence.
    
    Return ONLY a JSON object with this structure:
    {
      "severity": "low|medium|high|critical",
      "category": "disaster-relief|medical|logistics|technical|other",
      "location": {
        "description": "extracted location",
        "coordinates": [longitude, latitude]
      },
      "victims": {
        "count": number,
        "type": "civilians|responders|mixed"
      },
      "resources_needed": ["resource1", "resource2"],
      "urgency_factors": ["factor1", "factor2"],
      "recommended_actions": ["action1", "action2"],
      "estimated_duration_hours": number,
      "risk_level": "low|medium|high|extreme"
    }
    `;

    return await callAI(prompt, "google/gemma-3n-e4b-it", 0.3);
  },

  generateDashboardInsights: async (tasks, inventory) => {
    return await detectResourceShortages(inventory, tasks);
  }
};

module.exports = aiService;
