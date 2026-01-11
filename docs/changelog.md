# Changelog

All notable changes to this project will be documented in this file.

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
