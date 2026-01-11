# Project: openings-master

## Overview
Chess Openings Trainer - A web app for practicing chess openings with AI opponent and move analysis.

## Tech Stack
- **Frontend**: React + TypeScript, Vite, Tailwind CSS
- **Backend**: Go (Gin framework)
- **Database**: MongoDB
- **Chess Engine**: Stockfish WASM
- **LLM**: OpenAI SDK

## System Behaviors
- **Docs Source:** Reference `docs/project-spec.md`, `docs/architecture.md`, `docs/project-status.md`, and `docs/changelog.md` before answering questions.
- **Auto-Update:** You MUST update the relevant `docs/` file after any code change.

## Git Command
- **Command:** `/update-docs-and-commit`
- **Rule:** Do not add AI attribution to commits.

## Build & Run

### Backend
```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Guidelines
- **Style:** Concise, typed, modular.
- **Docs:** Keep `docs/` in sync with code reality.

## Project Structure
```
openings-master/
├── backend/           # Go backend (Gin + MongoDB)
│   ├── cmd/server/    # Entry point
│   ├── internal/      # Private app code
│   └── pkg/           # Shared packages
├── frontend/          # React + TypeScript
│   ├── src/
│   └── public/
└── docs/              # Documentation
```
