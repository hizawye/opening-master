# Changelog

All notable changes to this project will be documented in this file.

## [0.7.0] - 2026-01-12

### Changed
- **Simplified Practice Mode - Repertoire-Only Drilling**: Complete redesign of practice mode for fast, focused repertoire memorization
  - Removed Stockfish integration from practice (too slow for drilling)
  - Practice now drills ONLY repertoire moves - no engine play
  - Simplified move categories from 7 to 2: `repertoire` (correct) and `mistake`
  - AI opponent plays exclusively from user's repertoire (no Lichess/Stockfish fallback)
  - Removed engine depth configuration from PracticeSetup
  - Stockfish remains available for repertoire building only (separate feature)

### Added
- **Practice Session Configuration**: New settings step in practice wizard
  - Session length options: Short (20 moves), Standard (30), Long (50), Unlimited
  - Difficulty modes: 'strict' (exact moves only) or 'flexible' (accept alternatives)
  - Allow Variations toggle: train on variations or main lines only
  - `PracticeConfig` type added to frontend and backend
- **RepertoireNavigator Utility**: Efficient repertoire traversal system
  - O(1) FEN-based position lookup via pre-built Map
  - `getOpponentMove()` - find repertoire response for any position
  - `isRepertoireMove()` - validate user moves against repertoire
  - `getExpectedMoves()` - get all valid continuations for a position
  - Handles transpositions naturally via FEN matching
  - Supports variation training with random selection
- **useRepertoireNavigator Hook**: React wrapper with lifecycle management
- **useEvaluationCache Hook**: Caching layer for Stockfish evaluations
  - Prevents race conditions in async evaluation
  - `prefetchEvaluations()` for warming cache
- **Take-Back on Wrong Moves**: When user plays incorrect move:
  - Move is undone automatically
  - Shows expected repertoire move(s)
  - "Try Again" button to retry
  - Instant feedback without waiting for engine evaluation
- Updated `MoveFeedback` component with take-back UI
- `WrongMoveState` tracking in PracticeSession
- Session settings step added to practice setup wizard flow

### Removed
- `ENGINE_DEPTHS` constant from practice.ts
- `engine_depth` from `PracticeConfig` interface
- `useStockfish` hook from PracticeSession
- `useLichessExplorer` hook from PracticeSession
- `categorizeMove()` and `calculateCentipawnLoss()` functions from moveEvaluation.ts
- Engine Strength selector UI from PracticeSetup
- `isAnalyzing` state (no more engine analysis in practice)
- Complex 3-tier fallback logic (repertoire → Lichess → Stockfish)
- ~200 lines of engine complexity from PracticeSession.tsx
- `eval_before`, `eval_after`, `centipawn_loss` fields from PracticeMove type

### Technical
- Frontend TypeScript builds clean with no errors
- Backend Go builds clean with no errors
- Backwards compatibility maintained in backend stats calculation
- PracticeSession.tsx reduced from 781 lines to 648 lines
- New files: `useEvaluationCache.ts`, `useRepertoireNavigator.ts`, `repertoireNavigator.ts`

## [0.6.0] - 2026-01-12

### Changed
- **Complete DaisyUI Migration with Cyberpunk Theme**: Migrated entire UI from plain CSS (BEM) to DaisyUI component library while establishing distinctive cyberpunk/neon aesthetic
  - Reinstalled Tailwind CSS 4 as DaisyUI dependency
  - Created custom "cyberpunk" theme using @theme directive with oklch() color format
  - Typography system: Orbitron (display), Rajdhani (body), Share Tech Mono (monospace)
  - Grid background with scanline effects and multi-layer glow shadows
  - Glassmorphism with backdrop-blur on all cards and modals
  - Custom utility classes: `.text-electric`, `.cyber-corners`, `.glow-primary`, etc.
  - Cyberpunk animations: `stat-glow`, `electric-flicker`, `circuit-pulse`, `shimmer`
  - All 21 components migrated to use DaisyUI classes with cyberpunk styling
  - Comprehensive CSS variable cleanup across all components (27 instances replaced)

### Added
- `frontend/src/styles/index.css` - Cyberpunk theme definition and grid/scanline effects (200+ lines)
- `frontend/src/styles/animations.css` - Cyberpunk-specific keyframe animations
- Google Fonts integration (Orbitron, Rajdhani, Share Tech Mono)

### Removed
- `frontend/src/index.css` - Replaced with new styles directory structure
- `frontend/src/utils/cn.ts` - No longer needed with DaisyUI
- All BEM CSS classes across components
- All CSS custom properties (var(--*)) replaced with explicit values

### Dependencies
- Added: `daisyui@5.5.14`, `tailwindcss@latest`, `@tailwindcss/vite@latest`
- Re-added Tailwind after v0.5.0 removal (required for DaisyUI)

### Design System
- **Colors**:
  - Primary (Cyan): #00f0ff / oklch(85% 0.18 200)
  - Error (Pink): #ff006e / oklch(65% 0.25 10)
  - Success (Green): #39ff14 / oklch(85% 0.25 130)
  - Accent (Purple): #bf00ff / oklch(65% 0.3 300)
  - Backgrounds: #0a0a0f (base), #1a1a2e (elevated)
- **Effects**: Multi-layer glows, glassmorphism, grid patterns, scanlines
- **Typography**: Distinctive font choices replacing generic system fonts

### Technical
- Total changes: 28 files, 1310 insertions, 1343 deletions
- Build verified with no errors
- All pages styled consistently with cyberpunk aesthetic
- Responsive design maintained across mobile/tablet/desktop

## [0.5.0] - 2026-01-12

### Changed
- **Removed Tailwind CSS**: Complete migration from Tailwind CSS to plain CSS with BEM naming convention
  - Created new CSS architecture: `styles/variables.css`, `reset.css`, `utilities.css`, `animations.css`
  - Component CSS files in `styles/components/` directory
  - Design tokens defined as CSS custom properties (colors, spacing, typography, shadows)
  - All 21 components migrated (517 className instances)

### Removed
- `@tailwindcss/forms` dependency
- `@tailwindcss/vite` dependency
- `tailwindcss` dependency
- `tailwind-merge` dependency
- `clsx` dependency
- `autoprefixer` dependency
- `postcss` dependency
- `src/utils/cn.ts` utility file

### Technical
- Dependencies reduced from 16 to 9 runtime dependencies
- CSS now uses BEM naming (`.button`, `.button--primary`, `.button__icon`)
- Utility classes use `u-` prefix (e.g., `u-flex`, `u-min-h-screen`)
- Build verified working with no errors
- Preserved cyberpunk/neon design aesthetic

## [0.4.0] - 2026-01-11

### Changed
- **Complete Tailwind CSS UI Redesign**: Removed all custom CSS variables and design tokens, simplified entire frontend to use clean Tailwind CSS classes
  - Deleted `frontend/src/styles/design-tokens.css` entirely (123 lines removed)
  - Simplified `frontend/src/index.css` from 442 lines to basic resets and Tailwind imports
  - Redesigned all layout components: `Header`, `MobileNav`, `PageContainer`
  - Redesigned all UI primitives: `Button`, `Card`, `Input`, `Modal`
  - Redesigned all page components: `Dashboard`, `LoginPage`, `RegisterPage`
  - Fixed remaining Card variant errors in `PracticeSession`, `PracticeSetup`, `RepertoireEditor`

### Design System
- **Colors**: Now using Tailwind's slate palette (slate-950, slate-900, slate-800, slate-700) with indigo-600 for primary actions
- **Components**: Removed glassmorphism and complex gradients in favor of simple borders and clean backgrounds
- **Styling**: All components now use direct Tailwind classes instead of CSS custom properties
- **Net Result**: Reduced CSS by 891 lines, improved maintainability and consistency

### Technical
- Total changes: 15 files modified, 393 insertions(+), 1284 deletions(-)
- Build successful with no TypeScript errors
- All pages verified and responsive

## [0.3.1] - 2026-01-11

### Fixed
- **Registration Bug**: Fixed issue where registration always showed "Email may already be in use" error regardless of actual error type
  - Frontend now displays actual backend error messages instead of generic fallback
  - Backend detects MongoDB duplicate key errors and returns proper "email already registered" message
  - Added unique index on email field to prevent duplicate registrations at database level

### Changed
- Improved error handling in `RegisterPage.tsx` to parse and display backend error responses
- `UserRepository.CreateIndexes()` now creates unique index on email field
- `AuthHandler.Register()` now handles duplicate key errors with specific error messages

## [0.3.0] - Mobile-First UI Overhaul

### Added
- **Mobile Navigation**: Fixed bottom navigation bar with Home, Practice, Repertoire, Profile tabs
- **AccuracyRing Component**: Animated circular progress indicator with color gradients based on percentage
- **Toast Notification System**: Provider-based toast system with success, error, warning, info variants
- **MoveFeedback Component**: Category-specific animations for move feedback (book glow, success pulse, error shake)
- **Chess-themed Design Tokens**:
  - Chess square colors (`--chess-light-square`, `--chess-dark-square`)
  - Move category colors with glow variants
  - Spacing scale (`--space-xs` through `--space-3xl`)
  - Mobile-specific dimensions (`--mobile-nav-height`, `--safe-area-bottom`)
- **CSS Patterns and Animations**:
  - `.bg-chess-pattern` / `.bg-chess-pattern-lg` for subtle backgrounds
  - `@keyframes success-pulse`, `error-shake`, `book-glow`
  - Category gradient backgrounds (`.bg-gradient-book`, `.bg-gradient-best`, etc.)
  - Mobile utilities (`.pb-safe`, `.hide-mobile`, `.hide-desktop`)

### Changed
- **Dashboard**: Hero section with chess pattern, user greeting, quick stats grid, improved repertoire cards with color stripes and chess piece icons
- **PracticeSession**:
  - Mobile: Edge-to-edge board, expandable stats overlay, bottom action bar
  - Desktop: Sticky sidebar with AccuracyRing and move history
  - Session complete: Animated trophy with glow, stats grid, AccuracyRing
- **PracticeSetup**: Step wizard UI with animated transitions, progress bar, visual mode selection cards
- **Header**: Gradient logo badge, user dropdown menu with avatar, better mobile subtitle truncation
- **Auth Pages**: Floating chess piece decorations, animated gradient orbs, improved form styling with password strength indicator
- **Button Component**: Added `success` variant, `icon` size, 44px minimum touch targets
- **PageContainer**: Support for `fullBleed` and `withMobileNav` props

### Technical
- Added z-index scale in design tokens for consistent layering
- Improved responsive breakpoints throughout
- Touch-action manipulation for better mobile tap response
- Safe area insets support for devices with notches

## [0.2.0] - UI Redesign

### Added
- Complete design system with CSS custom properties (design tokens)
- Reusable UI component library:
  - `Button` - Multiple variants (primary, secondary, ghost, danger), sizes, loading state, Framer Motion animations
  - `Card` - Variants (default, glass, gradient, interactive), padding options
  - `Input` - Labels, left/right icons, error states, focus animations
  - `Modal` - Animated with AnimatePresence, backdrop blur
  - `Badge` - Styled status indicators
  - `Spinner` - Multiple sizes with gradient animation
  - `Skeleton` - Loading placeholders for cards and text
- Layout components:
  - `Header` - Sticky header with blur effect, logo, back navigation, logout
  - `PageContainer` - Animated page wrapper with consistent padding
- Utility functions:
  - `cn()` - Class name merger using clsx + tailwind-merge
  - `animations.ts` - Reusable Framer Motion variants

### Changed
- **Auth Pages (Login, Register)**: Glassmorphism card design, chess board pattern background, animated gradient orbs, glowing logo pulse
- **Dashboard**: Animated staggered card entrance, hero gradient button for practice, interactive repertoire cards with hover effects
- **RepertoireEditor**: Glass card styling, animated book moves with win/draw/loss progress bars, move history with animated entry
- **PracticeSetup**: Selection cards with interactive hover states, consistent styling with new components
- **PracticeSession**: Move feedback with category-colored glow, animated stats display, session complete celebration with trophy glow and accuracy ring animation

### Technical
- Installed `framer-motion`, `clsx`, `tailwind-merge` dependencies
- Tailwind CSS v4 theme configuration using `@theme` directive
- Design tokens for colors, shadows, radii, transitions

## [0.1.1] - Custom LLM API Support

### Changed
- LLM integration now supports custom OpenAI-compatible API endpoints via `OPENAI_BASE_URL`
- Default model changed to `gemini-3-pro-high`
- Updated `.env.example` with new configuration options

### Configuration
```env
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gemini-3-pro-high
OPENAI_BASE_URL=http://127.0.0.1:8045/v1
```

## [0.1.0] - Initial MVP

### Added

#### Backend (Go + Gin + MongoDB)
- User authentication with email/password
- JWT-based session management with refresh tokens
- Password hashing with bcrypt
- Repertoire CRUD endpoints
- Opening management within repertoires
- Practice session endpoints (start, move, end, history)
- Teaching endpoints with OpenAI integration
- MongoDB repositories with proper indexing

#### Frontend (React + TypeScript + Vite)
- Authentication pages (Login, Register)
- Protected routes with AuthContext
- Dashboard with repertoire list
- Repertoire editor with interactive chessboard
- Lichess Opening Explorer integration
- Practice mode with AI opponent
- Move categorization and feedback
- Session summary with statistics
- LLM-powered move explanations

#### Features
- Move categories: Book, Best, Good, Inaccuracy, Mistake, Blunder
- Centipawn loss calculation for move evaluation
- Lichess masters database for book moves
- Stockfish WASM integration for AI opponent
- OpenAI integration for teaching

### Technical Stack
- **Backend**: Go 1.21+, Gin, MongoDB
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Chess**: react-chessboard, chess.js, Stockfish WASM
- **APIs**: Lichess Opening Explorer, OpenAI
