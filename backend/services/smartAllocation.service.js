/**
 * Smart Resource Allocation Service
 * Uses IBM Watsonx.ai to analyze mission descriptions
 * and match them with the best available volunteers/resources
 */

const axios = require('axios');
const qs = require('qs'); // Used to stringify data for x-www-form-urlencoded

// IAM Token caching
let cachedToken = null;
let tokenExpiration = 0;

/**
 * Generate IBM Cloud IAM bearer token
 */
async function getIamToken() {
  // Return cached token if valid
  if (cachedToken && Date.now() < tokenExpiration) {
    return cachedToken;
  }
  
  const apiKey = process.env.IBM_API_KEY;
  if (!apiKey) {
    throw new Error('IBM_API_KEY is missing or invalid. Please set it in your environment variables.');
  }

  try {
    const response = await axios.post('https://iam.cloud.ibm.com/identity/token', qs.stringify({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    cachedToken = response.data.access_token;
    // Expire token 60 seconds before actual expiration
    tokenExpiration = Date.now() + (response.data.expires_in - 60) * 1000;
    return cachedToken;
  } catch (error) {
    console.error('Error fetching IAM token:', error.response?.data || error.message);
    throw new Error('Failed to generate IAM token');
  }
}

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
 * Extract keywords, entities, and concepts from mission description using Watsonx
 * @param {string} missionDescription - The mission description text
 * @returns {Promise<Object>} Extracted features
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

    const token = await getIamToken();
    const url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
    const projectId = process.env.WATSONX_PROJECT_ID;

    if (!projectId) {
      throw new Error('WATSONX_PROJECT_ID is missing in environment variables.');
    }

    const prompt = `Analyze the following mission description and extract concepts, entities, and keywords.
Return ONLY valid JSON with no markdown formatting. The JSON must match this structure:
{
  "concepts": [{"text": "concept1", "relevance": 0.9}],
  "entities": [{"text": "entity1", "type": "Location", "relevance": 0.8}],
  "keywords": [{"text": "keyword1", "relevance": 0.95}],
  "categories": [{"label": "/category", "score": 0.9}]
}

Mission description:
"${missionDescription}"`;

    console.log('🔍 Analyzing mission description with Watsonx...');
    
    const response = await axios.post(`${url}/ml/v1/text/generation?version=2023-05-29`, {
      model_id: 'ibm/granite-13b-chat-v2',
      project_id: projectId,
      input: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.1,
        decoding_method: 'greedy'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const outputText = response.data.results[0].generated_text;
    
    let parsedData;
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedData = JSON.parse(jsonMatch[0]);
    } else {
      parsedData = JSON.parse(outputText);
    }

    // Extract and normalize the results
    const extractedData = {
      concepts: parsedData.concepts?.map(c => ({
        text: c.text.toLowerCase(),
        relevance: c.relevance || 0.5
      })) || [],
      entities: parsedData.entities?.map(e => ({
        text: e.text.toLowerCase(),
        type: e.type,
        relevance: e.relevance || 0.5
      })) || [],
      keywords: parsedData.keywords?.map(k => ({
        text: k.text.toLowerCase(),
        relevance: k.relevance || 0.5
      })) || [],
      categories: parsedData.categories?.map(c => ({
        label: c.label,
        score: c.score || 0.5
      })) || []
    };

    console.log('✅ Watsonx analysis complete');
    console.log(`   - Concepts: ${extractedData.concepts.length}`);
    console.log(`   - Entities: ${extractedData.entities.length}`);
    console.log(`   - Keywords: ${extractedData.keywords.length}`);

    return extractedData;

  } catch (error) {
    console.error('❌ Watsonx Analysis Error:', error.response?.data || error.message);
    
    // Provide helpful error messages
    if (error.response?.status === 401) {
      // Token might be expired, clear it
      cachedToken = null;
      throw new Error('Watsonx authentication failed. Token may be expired.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to Watsonx service. Please check your network connection.');
    }
    
    throw error;
  }
}

/**
 * Calculate match score between extracted features and volunteer skills
 * @param {Object} extractedFeatures - Features extracted from Watsonx
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
    // Step 1: Extract features using Watsonx
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
 * Health check for Watsonx service
 * @returns {Promise<Object>} Service status
 */
async function checkWatsonHealth() {
  try {
    // Generate token to verify credentials
    await getIamToken();
    return {
      status: 'healthy',
      service: 'Watsonx AI',
      message: 'Service is operational and IAM token successfully generated'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      service: 'Watsonx AI',
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
