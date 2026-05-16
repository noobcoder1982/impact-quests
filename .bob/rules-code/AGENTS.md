# Code Mode Rules (Non-Obvious Only)

## Custom Utilities That Replace Standard Approaches

### AI Service Pattern
- **ALWAYS** use `backend/utils/ai.util.js` `callAI()` for AI requests
- Never manually parse AI responses - utility auto-extracts JSON via regex
- Returns parsed JSON object if found, raw string otherwise
- See lines 31-38 in `ai.util.js`

### Distance Calculations
- Use `backend/utils/distance.util.js` for geospatial operations
- `haversineDistance()` returns kilometers (not miles)
- `distanceToScore()` uses exponential decay, not linear scaling
- Formula: `Math.exp(-distance / (maxDistance / 3))`

## Non-Standard Patterns Unique to This Project

### GeoJSON Coordinate Order (CRITICAL)
- MongoDB stores coordinates as `[longitude, latitude]` (NOT lat/lng)
- User and Task models both use this format
- Matching service filters out `[0, 0]` defaults (lines 119-122 in `matching.service.js`)
- Always validate coordinates before distance calculations

### Gamification System
- **NEVER** manually set `user.level` - call `user.calculateLevel()` method
- Points auto-calculated in Task pre-save hook based on urgency
- Reliability score uses moving average: `score + (100 - score) * 0.05`
- Badge checking happens in `gamification.service.js` `checkAndAwardBadges()`

### Theme System Dual Storage
- Theme stored in TWO places: `localStorage.theme` AND `localStorage.user.theme`
- ThemeContext syncs both on change (lines 54-64 in `ThemeContext.tsx`)
- Must update both to prevent desync
- Also updates `data-variant` attribute on root element

## Required Import Orders and Naming Conventions

### Path Aliases
- Use `@/*` for `./src/*` imports in frontend
- Example: `import { cn } from "@/lib/utils"` not `"../lib/utils"`
- Configured in `tsconfig.app.json` lines 24-26

### API Request Pattern
- Frontend API calls use `src/lib/api.ts` `apiRequest()` function
- Automatically adds `Bearer ${token}` to Authorization header
- Handles both JSON and text responses
- API URL dynamically resolved from hostname if `VITE_API_URL` not set

## Hidden Dependencies and Coupling

### Matching Algorithm Weights (Hardcoded)
- Skill: 40%, Distance: 30%, Availability: 20%, Reliability: 10%
- Defined in `backend/services/matching.service.js` lines 16-21
- Changing weights requires updating WEIGHTS constant
- All scores normalized to 0-1 before weighting

### Firebase + JWT Dual Auth
- Users have EITHER `firebaseUid` OR `password` (not both typically)
- Password field has `select: false` - must explicitly include in queries
- JWT middleware expects `Bearer <token>` format
- See `backend/middleware/auth.middleware.js` lines 8-56

### Backend Directory-Specific Commands
- Backend commands MUST run from `backend/` directory
- `npm run dev` uses Node's `--watch` flag (not nodemon)
- `npm run seed` populates test data
- Running from root will fail

## Module System Differences
- Frontend: ESM (`"type": "module"` in package.json)
- Backend: CommonJS (no type field, uses `require()`)
- Don't mix import styles between frontend/backend