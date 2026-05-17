const axios = require('axios');

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

/**
 * Common AI call wrapper
 */
const callAI = async (prompt, model = "meta/llama-3.1-8b-instruct", temperature = 0.1, maxTokens = 1024) => {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  
  if (!NVIDIA_API_KEY) {
    console.error("❌ NVIDIA_API_KEY not found in environment variables");
    console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('NVIDIA')));
    throw new Error("NVIDIA_API_KEY is not configured in Railway. Please add it in the Variables tab.");
  }

  try {
    const response = await axios.post(NVIDIA_API_URL, {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: maxTokens
    }, {
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    });

    let content = response.data.choices[0].message.content;
    
    // Attempt to extract JSON if present
    const jsonMatch = content.match(/\{.*\}/s) || content.match(/\[.*\]/s);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        return content;
      }
    }
    
    return content;
  } catch (error) {
    console.error("AI Utility Error:", error.message);
    throw error;
  }
};

module.exports = { callAI };
