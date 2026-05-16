/**
 * Smart Resource Allocation Service
 * Uses IBM Watsonx Natural Language Understanding (NLU) to analyze mission descriptions
 * and match them with the best available volunteers/resources
 */

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

/**
 * Initialize Watson NLU client
 * API Key is loaded from environment variables
 */
const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2022-04-07',
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSONX_NLU_API_KEY,
  }),
  serviceUrl: process.env.WATSONX_NLU_URL || 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com',
});

/**
 * Mock database of available volunteers/resources
 * In production, this would come from your actual database
 */
const mockVolunteers = [
  {
    id: 'vol_001',
    name: 'Sarah Johnson',
    skills: ['medical', 'first aid', 'emergency response', 'healthcare', 'nursing'],
    availability: 'available',
    location: 'downtown',
    reliability: 95,
    completedMissions: 47
  },
  {
    id: 'vol_002',
    name: 'Mike Chen',
    skills: ['boat operation', 'water rescue', 'swimming', 'navigation', 'marine'],
    availability: 'available',
    location: 'riverside',
    reliability: 88,
    completedMissions: 32
  },
  {
    id: 'vol_003',
    name: 'Emily Rodriguez',
    skills: ['logistics', 'supply management', 'distribution', 'inventory', 'coordination'],
    availability: 'available',
    location: 'central',
    reliability: 92,
    completedMissions: 56
  },
  {
    id: 'vol_004',
    name: 'David Park',
    skills: ['medical', 'paramedic', 'emergency', 'trauma care', 'ambulance'],
    availability: 'available',
    location: 'downtown',
    reliability: 97,
    completedMissions: 68
  },
  {
    id: 'vol_005',
    name: 'Lisa Thompson',
    skills: ['boat', 'rescue', 'water safety', 'lifeguard', 'swimming'],
    availability: 'available',
    location: 'waterfront',
    reliability: 85,
    completedMissions: 29
  },
  {
    id: 'vol_006',
    name: 'James Wilson',
    skills: ['supplies', 'food distribution', 'shelter setup', 'logistics', 'transport'],
    availability: 'available',
    location: 'downtown',
    reliability: 90,
    completedMissions: 41
  },
  {
    id: 'vol_007',
    name: 'Maria Garcia',
    skills: ['medical supplies', 'pharmacy', 'medication', 'healthcare', 'nursing'],
    availability: 'available',
    location: 'central',
    reliability: 94,
    completedMissions: 52
  },
  {
    id: 'vol_008',
    name: 'Robert Lee',
    skills: ['flood response', 'water rescue', 'boat', 'emergency', 'evacuation'],
    availability: 'available',
    location: 'riverside',
    reliability: 89,
    completedMissions: 38
  }
];

/**
 * Extract keywords, entities, and concepts from mission description using Watson NLU
 * @param {string} missionDescription - The mission description text
 * @returns {Promise<Object>} Extracted NLU features
 */
async function extractMissionFeatures(missionDescription) {
  try {
    // Validate input
    if (!missionDescription || typeof missionDescription !== 'string') {
      throw new Error('Mission description must be a non-empty string');
    }

    if (missionDescription.trim().length < 10) {
      throw new Error('Mission description is too short. Please provide more details.');
    }

    // Configure Watson NLU analysis parameters
    const analyzeParams = {
      text: missionDescription,
      features: {
        // Extract key concepts from the text
        concepts: {
          limit: 10
        },
        // Extract named entities (locations, quantities, organizations, etc.)
        entities: {
          limit: 20,
          mentions: true,
          sentiment: false,
          emotion: false
        },
        // Extract important keywords
        keywords: {
          limit: 15,
          sentiment: false,
          emotion: false
        },
        // Classify the text into categories
        categories: {
          limit: 5
        }
      }
    };

    console.log('🔍 Analyzing mission description with Watson NLU...');
    const analysisResults = await naturalLanguageUnderstanding.analyze(analyzeParams);

    // Extract and normalize the results
    const extractedData = {
      concepts: analysisResults.result.concepts?.map(c => ({
        text: c.text.toLowerCase(),
        relevance: c.relevance
      })) || [],
      entities: analysisResults.result.entities?.map(e => ({
        text: e.text.toLowerCase(),
        type: e.type,
        relevance: e.relevance
      })) || [],
      keywords: analysisResults.result.keywords?.map(k => ({
        text: k.text.toLowerCase(),
        relevance: k.relevance
      })) || [],
      categories: analysisResults.result.categories?.map(c => ({
        label: c.label,
        score: c.score
      })) || []
    };

    console.log('✅ Watson NLU analysis complete');
    console.log(`   - Concepts: ${extractedData.concepts.length}`);
    console.log(`   - Entities: ${extractedData.entities.length}`);
    console.log(`   - Keywords: ${extractedData.keywords.length}`);

    return extractedData;

  } catch (error) {
    console.error('❌ Watson NLU Analysis Error:', error.message);
    
    // Provide helpful error messages
    if (error.code === 401 || error.status === 401) {
      throw new Error('Watson NLU authentication failed. Please check your API key.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to Watson NLU service. Please check your network connection.');
    } else if (error.message.includes('API key')) {
      throw new Error('Watson NLU API key is missing or invalid. Please set WATSONX_NLU_API_KEY in your environment.');
    }
    
    throw error;
  }
}

/**
 * Calculate match score between extracted features and volunteer skills
 * @param {Object} extractedFeatures - Features extracted from Watson NLU
 * @param {Object} volunteer - Volunteer object with skills
 * @returns {number} Match score (0-100)
 */
function calculateMatchScore(extractedFeatures, volunteer) {
  let score = 0;
  let matchedSkills = [];

  // Combine all extracted terms for matching
  const allTerms = [
    ...extractedFeatures.concepts.map(c => ({ text: c.text, weight: c.relevance * 1.2 })),
    ...extractedFeatures.keywords.map(k => ({ text: k.text, weight: k.relevance })),
    ...extractedFeatures.entities.map(e => ({ text: e.text, weight: e.relevance * 0.8 }))
  ];

  // Match volunteer skills against extracted terms
  volunteer.skills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    
    allTerms.forEach(term => {
      // Exact match
      if (term.text === skillLower) {
        score += term.weight * 30;
        matchedSkills.push({ skill, term: term.text, type: 'exact' });
      }
      // Partial match (skill contains term or vice versa)
      else if (term.text.includes(skillLower) || skillLower.includes(term.text)) {
        score += term.weight * 15;
        matchedSkills.push({ skill, term: term.text, type: 'partial' });
      }
    });
  });

  // Bonus for high reliability
  score += (volunteer.reliability / 100) * 10;

  // Bonus for experience (completed missions)
  score += Math.min(volunteer.completedMissions / 10, 5);

  // Normalize score to 0-100 range
  const normalizedScore = Math.min(Math.round(score), 100);

  return {
    score: normalizedScore,
    matchedSkills: matchedSkills.slice(0, 5) // Top 5 matched skills
  };
}

/**
 * Find the best matching volunteers for a mission
 * @param {string} missionDescription - The mission description text
 * @param {number} topN - Number of top matches to return (default: 3)
 * @returns {Promise<Array>} Array of top matched volunteers with scores
 */
async function findBestMatches(missionDescription, topN = 3) {
  try {
    // Step 1: Extract features using Watson NLU
    const extractedFeatures = await extractMissionFeatures(missionDescription);

    // Step 2: Calculate match scores for all volunteers
    console.log('🎯 Calculating match scores for volunteers...');
    const scoredVolunteers = mockVolunteers.map(volunteer => {
      const matchResult = calculateMatchScore(extractedFeatures, volunteer);
      return {
        ...volunteer,
        matchScore: matchResult.score,
        matchedSkills: matchResult.matchedSkills,
        reasoning: `Matched ${matchResult.matchedSkills.length} relevant skills`
      };
    });

    // Step 3: Sort by match score (descending) and return top N
    const topMatches = scoredVolunteers
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, topN);

    console.log('✅ Top matches found:');
    topMatches.forEach((match, index) => {
      console.log(`   ${index + 1}. ${match.name} - Score: ${match.matchScore}%`);
    });

    return {
      success: true,
      missionAnalysis: {
        concepts: extractedFeatures.concepts.slice(0, 5),
        keywords: extractedFeatures.keywords.slice(0, 5),
        entities: extractedFeatures.entities.slice(0, 5)
      },
      topMatches,
      totalAnalyzed: mockVolunteers.length
    };

  } catch (error) {
    console.error('❌ Error in findBestMatches:', error.message);
    throw error;
  }
}

/**
 * Health check for Watson NLU service
 * @returns {Promise<Object>} Service status
 */
async function checkWatsonHealth() {
  try {
    // Try a simple analysis to verify the service is working
    const testText = "Emergency medical assistance needed";
    await naturalLanguageUnderstanding.analyze({
      text: testText,
      features: {
        keywords: { limit: 1 }
      }
    });

    return {
      status: 'healthy',
      service: 'Watson NLU',
      message: 'Service is operational'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      service: 'Watson NLU',
      message: error.message
    };
  }
}

module.exports = {
  findBestMatches,
  extractMissionFeatures,
  calculateMatchScore,
  checkWatsonHealth,
  mockVolunteers // Export for testing purposes
};

// Made with Bob
