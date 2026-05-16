# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Structure (Non-Obvious)

- **Dual-module system**: Root has frontend (React/Vite), `backend/` has separate Node.js API with its own package.json
- **Run commands from correct directory**: Backend commands must run from `backend/` directory, not root
- **PowerShell launchers**: `start_all.ps1` and `launch.ps1` have hardcoded absolute paths - update for your system

## Build/Run Commands

```bash
# Frontend (from root)
npm run dev          # Vite dev server
npm run build        # TypeScript compile + Vite build

# Backend (from backend/ directory)
cd backend && npm run dev    # Node with --watch flag
cd backend && npm run seed   # Seed database with test data
```

## Critical Non-Obvious Patterns

### 1. GeoJSON Coordinate Order (CRITICAL)
- MongoDB location fields use `[longitude, latitude]` order (NOT lat/lng)
- Matching service ignores `[0, 0]` coordinates (default values that break distance calculations)
- See `backend/services/matching.service.js` line 119-122

### 2. AI Utility Auto-JSON Extraction
- All AI calls go through `backend/utils/ai.util.js` `callAI()` function
- Automatically extracts JSON from AI responses using regex (lines 31-38)
- Returns parsed JSON if found, raw string otherwise
- Don't manually parse AI responses - the utility handles it

### 3. Theme System Dual Storage
- Theme stored in BOTH `localStorage.theme` AND `localStorage.user.theme`
- Context syncs both locations on change (see `src/contexts/ThemeContext.tsx` lines 54-64)
- Must update both to prevent desync issues

### 4. Gamification Auto-Calculation
- Points/levels calculated in Mongoose pre-save hooks and instance methods
- Don't manually set `user.level` - call `user.calculateLevel()` instead
- Reliability score uses moving average: `score + (100 - score) * 0.05` (line 88 in `gamification.service.js`)

### 5. Matching Algorithm Weights (Hardcoded)
- Skill: 40%, Distance: 30%, Availability: 20%, Reliability: 10%
- Distance uses exponential decay: `Math.exp(-distance / (maxDistance / 3))`
- See `backend/services/matching.service.js` lines 16-21 and `backend/utils/distance.util.js` line 47

### 6. API URL Dynamic Resolution
- Frontend constructs API URL from `window.location.hostname` if `VITE_API_URL` not set
- Pattern: `http://${hostname}:5000/api/v1`
- See `src/lib/api.ts` lines 1-7

### 7. Firebase + JWT Dual Auth
- Users can have EITHER `firebaseUid` (Google Sign-In) OR `password` (email/password)
- Password field has `select: false` - must explicitly include in queries
- JWT middleware expects `Bearer <token>` format in Authorization header

### 8. Path Aliases
- TypeScript uses `@/*` alias for `./src/*` (see `tsconfig.app.json` lines 24-26)
- Import example: `import { cn } from "@/lib/utils"`

## Code Style (From Configs)

- **TypeScript**: Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **ESLint**: Flat config format, React hooks rules enforced
- **Tailwind**: Uses HSL CSS variables for theming (not direct color values)
- **Module type**: Frontend is ESM (`"type": "module"`), Backend is CommonJS

## Environment Variables

- Frontend: `VITE_API_URL` (optional, falls back to hostname-based URL)
- Backend: `NVIDIA_API_KEY` (required), `MONGO_URI`, `JWT_SECRET`, `FIREBASE_*` credentials