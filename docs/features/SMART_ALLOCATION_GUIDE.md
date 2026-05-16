# Smart Resource Allocation with IBM Watsonx NLU - Implementation Guide

## Overview

This feature uses IBM Watsonx Natural Language Understanding (NLU) to automatically analyze emergency mission descriptions and match them with the best available volunteers/resources based on their skills.

## 🎯 What It Does

When you submit a mission description like:
> "Medical supplies and boats needed for 50 stranded families in the flooded downtown area"

The system will:
1. **Extract key information** using Watson NLU (concepts, entities, keywords)
2. **Match against volunteers** based on their skills
3. **Return top 3 best matches** with match scores and reasoning

---

## 📦 Installation

### 1. Install Required Packages

The IBM Watson SDK packages are already installed in your project:

```bash
cd backend
npm install ibm-watson@^8.0.0 ibm-cloud-sdk-core@^4.0.0
```

### 2. Environment Variables

Add these to your `backend/.env` file:

```env
# IBM Watsonx NLU Configuration
WATSONX_NLU_API_KEY=[REDACTED]
WATSONX_NLU_URL=https://api.us-south.natural-language-understanding.watson.cloud.ibm.com
```

**Note:** The API key and URL are already configured in your `.env` file.

---

## 🚀 API Endpoints

### Base URL
```
http://localhost:5000/api/v1/smart-allocation
```

### 1. Analyze Mission (Main Endpoint)

**POST** `/analyze`

Analyzes a mission description and returns the best matching volunteers.

**Request:**
```json
{
  "missionDescription": "Medical supplies and boats needed for 50 stranded families in the flooded downtown area",
  "topN": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mission analyzed successfully",
  "data": {
    "success": true,
    "missionAnalysis": {
      "concepts": [
        { "text": "medical supplies", "relevance": 0.95 },
        { "text": "flood rescue", "relevance": 0.88 }
      ],
      "keywords": [
        { "text": "boats", "relevance": 0.92 },
        { "text": "medical", "relevance": 0.89 }
      ],
      "entities": [
        { "text": "downtown", "type": "Location", "relevance": 0.85 }
      ]
    },
    "topMatches": [
      {
        "id": "vol_004",
        "name": "David Park",
        "skills": ["medical", "paramedic", "emergency", "trauma care"],
        "matchScore": 87,
        "matchedSkills": [
          { "skill": "medical", "term": "medical", "type": "exact" }
        ],
        "reliability": 97,
        "completedMissions": 68
      }
    ],
    "totalAnalyzed": 8
  }
}
```

### 2. Get Available Volunteers

**GET** `/volunteers`

Returns all available volunteers/resources.

**Response:**
```json
{
  "success": true,
  "data": {
    "volunteers": [...],
    "total": 8,
    "available": 8
  }
}
```

### 3. Extract Features (Testing)

**POST** `/extract-features`

Extracts NLU features without matching (useful for debugging).

**Request:**
```json
{
  "missionDescription": "Emergency medical assistance needed"
}
```

### 4. Health Check

**GET** `/health`

Checks if Watson NLU service is operational.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "Watson NLU",
    "message": "Service is operational"
  }
}
```

### 5. Batch Analyze

**POST** `/batch-analyze`

Analyze multiple missions at once (max 5).

**Request:**
```json
{
  "missions": [
    { "id": "m1", "description": "Medical supplies needed" },
    { "id": "m2", "description": "Boat rescue required" }
  ],
  "topN": 3
}
```

---

## 💻 Usage Examples

### Example 1: Basic Usage in Controller

```javascript
const smartAllocationService = require('../services/smartAllocation.service');

async function createMission(req, res) {
  try {
    const { description } = req.body;
    
    // Analyze mission and get best matches
    const result = await smartAllocationService.findBestMatches(description, 3);
    
    // Use the top matches to assign volunteers
    const topVolunteers = result.topMatches;
    
    // Create mission with suggested volunteers
    const mission = await Mission.create({
      description,
      suggestedVolunteers: topVolunteers.map(v => v.id),
      status: 'pending'
    });
    
    res.json({ success: true, mission, suggestions: topVolunteers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Example 2: Frontend API Call

```typescript
// src/lib/api.ts
import { apiRequest } from '@/lib/api';

export async function analyzeMission(description: string) {
  const response = await apiRequest('/smart-allocation/analyze', {
    method: 'POST',
    body: JSON.stringify({
      missionDescription: description,
      topN: 3
    })
  });
  
  return response.data;
}

// Usage in component
const handleAnalyze = async () => {
  try {
    const result = await analyzeMission(missionDescription);
    console.log('Top matches:', result.topMatches);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

### Example 3: Testing with cURL

```bash
# Test the analyze endpoint
curl -X POST http://localhost:5000/api/v1/smart-allocation/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "missionDescription": "Medical supplies and boats needed for 50 stranded families in the flooded downtown area",
    "topN": 3
  }'

# Check health
curl http://localhost:5000/api/v1/smart-allocation/health
```

---

## 🏗️ Architecture

### Files Created

1. **`backend/services/smartAllocation.service.js`** (330 lines)
   - Watson NLU integration
   - Feature extraction logic
   - Matching algorithm
   - Mock volunteer database

2. **`backend/controllers/smartAllocation.controller.js`** (217 lines)
   - HTTP request handlers
   - Input validation
   - Error handling

3. **`backend/routes/smartAllocation.routes.js`** (50 lines)
   - API route definitions
   - Authentication middleware

### How It Works

```
Mission Description
       ↓
Watson NLU Analysis
       ↓
Extract: Concepts, Keywords, Entities
       ↓
Match Against Volunteer Skills
       ↓
Calculate Match Scores (0-100)
       ↓
Return Top N Matches
```

### Matching Algorithm

The match score is calculated based on:

1. **Skill Matching (70%)**
   - Exact match: 30 points × relevance
   - Partial match: 15 points × relevance

2. **Reliability Bonus (10%)**
   - Based on volunteer's reliability score

3. **Experience Bonus (5%)**
   - Based on completed missions

**Formula:**
```javascript
score = skillMatches + (reliability/100 * 10) + min(completedMissions/10, 5)
```

---

## 🚂 Railway Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure all files are committed to Git:
```bash
git add .
git commit -m "Add Smart Resource Allocation with Watson NLU"
git push origin main
```

### Step 2: Set Up Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will auto-detect the Node.js backend

### Step 3: Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# AI Services
NVIDIA_API_KEY=your_nvidia_key
WATSONX_NLU_API_KEY=[REDACTED]
WATSONX_NLU_URL=https://api.us-south.natural-language-understanding.watson.cloud.ibm.com

# CORS (use your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 4: Configure Build Settings

1. **Root Directory:** Set to `backend`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`

Or create a `railway.json` in your backend directory:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Railway will build and deploy your backend
3. You'll get a public URL like: `https://your-app.railway.app`

### Step 6: Update Frontend API URL

Update your frontend `.env`:

```env
VITE_API_URL=https://your-app.railway.app/api/v1
```

### Step 7: Test the Deployment

```bash
# Test health endpoint
curl https://your-app.railway.app/api/v1/smart-allocation/health

# Test analyze endpoint (with auth token)
curl -X POST https://your-app.railway.app/api/v1/smart-allocation/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"missionDescription": "Medical emergency in downtown area"}'
```

### Step 8: Monitor Logs

In Railway dashboard:
1. Go to **"Deployments"** tab
2. Click on latest deployment
3. View **"Logs"** to monitor Watson NLU calls

---

## 🔧 Troubleshooting

### Error: "Missing required parameters: apikey"

**Solution:** Ensure `WATSONX_NLU_API_KEY` is set in your environment variables.

```bash
# Check if variable is loaded
echo $WATSONX_NLU_API_KEY
```

### Error: "Watson NLU authentication failed"

**Possible causes:**
1. Invalid API key
2. API key expired
3. Wrong service URL

**Solution:** Verify your credentials in IBM Cloud dashboard.

### Error: "Cannot connect to Watson NLU service"

**Possible causes:**
1. Network connectivity issues
2. Firewall blocking requests
3. Service URL incorrect

**Solution:** Check the service URL and network settings.

### Low Match Scores

**Solution:** The mock volunteer database has limited skills. In production:
1. Replace `mockVolunteers` with real database queries
2. Ensure volunteers have comprehensive skill tags
3. Use synonyms and related terms in skill lists

---

## 🎨 Customization

### Adding More Volunteers

Edit `backend/services/smartAllocation.service.js`:

```javascript
const mockVolunteers = [
  {
    id: 'vol_009',
    name: 'Your Name',
    skills: ['skill1', 'skill2', 'skill3'],
    availability: 'available',
    location: 'your-location',
    reliability: 90,
    completedMissions: 25
  },
  // ... more volunteers
];
```

### Adjusting Match Weights

Modify the `calculateMatchScore` function:

```javascript
// Increase exact match weight
if (term.text === skillLower) {
  score += term.weight * 40; // Changed from 30
}
```

### Integrating with Real Database

Replace mock data with database queries:

```javascript
async function findBestMatches(missionDescription, topN = 3) {
  // Extract features
  const extractedFeatures = await extractMissionFeatures(missionDescription);
  
  // Query real volunteers from database
  const volunteers = await Volunteer.find({ availability: 'available' });
  
  // Calculate scores and return matches
  // ... rest of logic
}
```

---

## 📊 Performance Considerations

- **Watson NLU API calls:** ~1-2 seconds per request
- **Matching algorithm:** <100ms for 100 volunteers
- **Recommended:** Cache Watson results for identical descriptions
- **Rate limits:** Check your Watson NLU plan limits

---

## 🔐 Security Notes

1. **API Key Protection:** Never commit API keys to Git
2. **Authentication:** All endpoints (except health) require JWT token
3. **Input Validation:** Mission descriptions are validated before processing
4. **Error Handling:** Sensitive error details are not exposed to clients

---

## 📚 Additional Resources

- [IBM Watson NLU Documentation](https://cloud.ibm.com/docs/natural-language-understanding)
- [Watson Node.js SDK](https://github.com/watson-developer-cloud/node-sdk)
- [Railway Documentation](https://docs.railway.app)

---

## ✅ Testing Checklist

- [ ] Watson NLU health check passes
- [ ] Can analyze simple mission descriptions
- [ ] Returns appropriate match scores
- [ ] Handles errors gracefully
- [ ] Works with authentication
- [ ] Deployed successfully to Railway
- [ ] Frontend can call the API
- [ ] Logs show Watson API calls

---

## 🎉 Success!

Your Smart Resource Allocation feature is now ready! The system will automatically analyze mission descriptions and suggest the best volunteers based on AI-powered natural language understanding.

For questions or issues, check the logs or contact your development team.