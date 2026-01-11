# Architecture

## System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│   Go Backend    │────▶│    MongoDB      │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Stockfish WASM  │     │   OpenAI API    │
│  (Web Worker)   │     │                 │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Lichess API    │
│ (Opening Data)  │
└─────────────────┘
```

## Frontend Architecture

### Component Hierarchy
```
App
├── AuthProvider
│   └── StockfishProvider
│       └── Routes
│           ├── LoginPage / RegisterPage
│           └── ProtectedRoutes
│               ├── Dashboard (RepertoireList)
│               ├── RepertoireEditor
│               └── PracticeSession
```

### State Management
- **AuthContext**: User authentication state
- **ChessContext**: Game state (chess.js)
- **StockfishContext**: Engine instance and analysis

### Key Hooks
- `useAuth()` - Authentication operations
- `useChess()` - Chess game state and moves
- `useStockfish()` - Engine analysis
- `useLichessExplorer()` - Opening book data
- `usePractice()` - Practice session state machine

## Backend Architecture

### Layers
```
Handlers (HTTP) → Services (Business Logic) → Repository (Data Access) → MongoDB
```

### Directory Structure
- `cmd/server/` - Application entry point
- `internal/config/` - Environment configuration
- `internal/models/` - Data structures
- `internal/handlers/` - HTTP request handlers
- `internal/middleware/` - Auth, CORS, rate limiting
- `internal/repository/` - MongoDB operations
- `internal/services/` - Business logic, external APIs
- `internal/router/` - Route definitions
- `pkg/database/` - MongoDB connection

## Database Schema

### Collections
1. **users** - User accounts and preferences
2. **repertoires** - Opening repertoires with move trees
3. **practice_sessions** - Practice history and statistics

## External Integrations

### Stockfish WASM
- Runs in Web Worker (non-blocking)
- UCI protocol communication
- Provides: position evaluation, best move

### Lichess Opening Explorer
- Endpoint: `https://explorer.lichess.ovh/masters`
- Returns: move frequencies, win rates, ECO codes
- Used for: book move detection

### OpenAI API
- Used for: teaching explanations, plan suggestions
- Model: configurable via OPENAI_MODEL env var
