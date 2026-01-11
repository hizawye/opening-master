# Project Specification

## Chess Openings Trainer

### Purpose
A web application to help chess players practice and memorize opening repertoires with AI-powered analysis and teaching.

### Core Features

1. **Practice Mode**
   - AI plays opponent side while user practices their repertoire
   - Options: practice specific opening OR random from repertoire
   - Untimed practice
   - First 15 moves depth

2. **Move Analysis**
   - Categories: Book Move, Best, Good, Inaccuracy, Mistake, Blunder
   - Powered by Stockfish WASM (runs in browser)
   - Centipawn loss calculation

3. **Opening Database**
   - Lichess Opening Explorer API integration
   - Book move detection
   - Opening statistics (win rates, frequency)

4. **LLM Teaching**
   - Explain opening ideas and plans
   - Analyze mistakes
   - Suggest strategic plans
   - Powered by OpenAI SDK (model configurable via .env)

5. **Repertoire Management**
   - Create/edit repertoires for White and Black
   - Opening tree visualization
   - Add custom lines and annotations

### Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript, Vite, Tailwind CSS |
| Backend | Go (Gin framework) |
| Database | MongoDB |
| Auth | Email/password + JWT |
| Chess Engine | Stockfish WASM |
| LLM | OpenAI SDK |
| Openings | Lichess API |

### User Flow
1. Register/Login
2. Create repertoire (White/Black)
3. Add opening lines to repertoire
4. Start practice session
5. Make moves, receive feedback
6. View session summary
