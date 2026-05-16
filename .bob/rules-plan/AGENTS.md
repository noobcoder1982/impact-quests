# Plan Mode Rules (Non-Obvious Only)

## Hidden Coupling Between Components

### Matching Service Dependencies
- Matching algorithm depends on FOUR separate scoring functions
- Each score normalized to 0-1 before applying hardcoded weights
- Distance calculation requires valid coordinates (filters out `[0,0]` defaults)
- See `backend/services/matching.service.js` lines 88-170

### Gamification State Management
- User level auto-calculated from points via instance method
- Points auto-set by Task pre-save hook based on urgency
- Reliability score uses moving average formula (not simple increment)
- Badge awards checked in service layer after each task completion
- Circular dependency: Task completion → points → level → badges

### Theme Synchronization Chain
- Theme change triggers THREE updates: localStorage.theme, localStorage.user.theme, root element class
- Variant stored separately and synced to root element data-variant attribute
- Context effect runs on every theme/variant change (lines 42-65 in `ThemeContext.tsx`)
- Breaking this chain causes UI desync

## Undocumented Architectural Decisions

### AI Response Parsing Strategy
- All AI calls centralized through `backend/utils/ai.util.js`
- Utility automatically extracts JSON from responses using regex
- Falls back to raw string if no JSON found
- This pattern prevents manual parsing inconsistencies across AI engines

### Dual Authentication Architecture
- Firebase auth (Google Sign-In) and traditional auth coexist
- User model supports both `firebaseUid` and `password` fields
- JWT middleware handles both auth types identically
- Password field excluded from queries by default (`select: false`)

### API URL Resolution Pattern
- Frontend constructs API URL dynamically from hostname if env var not set
- Enables zero-config development setup
- Production requires explicit `VITE_API_URL` for cross-origin scenarios
- See `src/lib/api.ts` lines 1-7

## Non-Standard Patterns That Must Be Followed

### GeoJSON Coordinate Order (CRITICAL)
- MongoDB uses `[longitude, latitude]` order (GeoJSON standard)
- Opposite of typical `[latitude, longitude]` convention
- Matching service explicitly filters `[0, 0]` coordinates
- Distance calculations fail silently with wrong order

### Backend Command Execution Context
- Backend npm scripts MUST run from `backend/` directory
- `npm run dev` uses Node's `--watch` flag (not nodemon)
- `npm run seed` expects to be in backend directory for relative paths
- Running from root causes silent failures or path errors

### Module System Boundary
- Frontend: ESM with `"type": "module"` in package.json
- Backend: CommonJS (no type field, uses require/module.exports)
- Cannot share code directly without transpilation
- Path aliases (`@/*`) only work in frontend

## Performance Bottlenecks Discovered Through Investigation

### Distance Calculation Optimization
- Matching service filters out invalid coordinates BEFORE distance calculation
- Uses exponential decay for distance scoring (not linear)
- Formula: `Math.exp(-distance / (maxDistance / 3))` heavily favors nearby volunteers
- See `backend/utils/distance.util.js` line 47

### Reliability Score Moving Average
- Each task completion increases reliability by: `(100 - current) * 0.05`
- Asymptotic approach to 100 prevents instant max reliability
- Task drops reduce by flat 10 points (not percentage-based)
- See `backend/services/gamification.service.js` lines 87-89 and 153

### Badge Checking Efficiency
- Badge requirements checked on EVERY task completion
- Already-awarded badges skipped via name comparison
- No caching - rechecks all badge definitions each time
- See `backend/services/gamification.service.js` lines 118-139

## Critical Gotchas for Planning

### PowerShell Launcher Absolute Paths
- `launch.ps1` has hardcoded paths (lines 7-8): `c:\Users\DELL\Desktop\hackathon files\Google-hackathon-files`
- Won't work on other machines without modification
- `start_all.ps1` uses relative paths but still directory-specific

### Theme Variant Separate from Theme
- Theme is light/dark, variant is standard/mono/graphite/slate/onyx
- Both must be managed independently
- Both stored in localStorage AND user object
- Forgetting variant causes incomplete theme application