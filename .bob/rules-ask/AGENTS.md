# Ask Mode Rules (Non-Obvious Only)

## Hidden or Misnamed Documentation

### Dual-Module Architecture
- Root directory contains frontend (React/Vite), NOT a monolithic app
- `backend/` is a completely separate Node.js API with its own package.json
- Don't assume standard single-app structure

### PowerShell Launcher Scripts
- `launch.ps1` has hardcoded absolute paths (lines 7-8)
- `start_all.ps1` is simpler but still directory-specific
- These won't work on other machines without path updates

### AI Engine Modular Structure
- AI capabilities split across `backend/ai/` subdirectories
- Each engine (matching, planning, summaries, insights, copilot) is separate
- All route through `backend/services/ai.service.js` orchestrator
- Not documented in README.md architecture section

## Counterintuitive Code Organization

### Theme System Complexity
- Theme stored in THREE places: localStorage.theme, localStorage.user.theme, AND root element data-variant
- ThemeContext manages synchronization (lines 42-65 in `ThemeContext.tsx`)
- Variant is separate from theme (light/dark vs standard/mono/graphite/slate/onyx)

### Gamification Calculation Location
- Level calculation is an instance method on User model, not a service function
- Points are auto-calculated in Task pre-save hook (lines 168-179 in `Task.js`)
- Badge checking happens in service layer, not model layer
- Split responsibility pattern not obvious from file names

### Authentication Dual Path
- Users can authenticate via Firebase (Google Sign-In) OR traditional email/password
- `firebaseUid` field indicates Firebase auth, `password` field indicates traditional
- Password field has `select: false` - must explicitly request in queries
- See `User.js` lines 32-43

## Important Context Not Evident from File Structure

### Backend Commands Must Run from Backend Directory
- `npm run dev` and `npm run seed` MUST be run from `backend/` directory
- Running from root will fail silently or with confusing errors
- Frontend commands run from root, backend from backend/

### API URL Resolution Strategy
- Frontend doesn't require `VITE_API_URL` environment variable
- Falls back to constructing URL from `window.location.hostname:5000`
- See `src/lib/api.ts` lines 1-7
- Enables development without environment configuration

### GeoJSON Coordinate Convention
- MongoDB location fields use `[longitude, latitude]` order (GeoJSON standard)
- This is OPPOSITE of typical `[latitude, longitude]` convention
- Matching service explicitly filters out `[0, 0]` default coordinates
- See `User.js` line 92 and `Task.js` line 42

### Module System Split
- Frontend uses ESM (ES Modules) with `"type": "module"` in package.json
- Backend uses CommonJS (require/module.exports)
- Can't share code directly between frontend/backend without transpilation

## Misleading Folder Names or Structures

### `docs/ARCHITECTURE.md` is Incomplete
- Doesn't document the matching algorithm weights
- Doesn't explain the gamification calculation formulas
- Doesn't mention the dual theme storage pattern
- Use code as source of truth, not just documentation