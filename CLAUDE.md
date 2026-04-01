# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Trumpet** is a full-stack digital archive for the Corfiot Music Archive. It consists of a .NET 8 backend API and a React 19 + TypeScript frontend.

## Commands

### Backend (from `TrumpetPython/`)
```bash
pip install -r requirements.txt  # Build environment
python main.py                   # Start FastAPI server on http://localhost:8000
python verify_alignment.py       # Check DB schema alignment
```

### Frontend (from `Trumpet.Frontend/`)
```bash
npm install         # Install dependencies (first time)
npm run dev         # Start dev server on http://localhost:5173
npm run build       # TypeScript compile + Vite bundle
npm run lint        # ESLint
npm run preview     # Preview production build
```

### Data Import
After starting the backend, trigger data ingestion:
```bash
curl -X POST http://localhost:5000/api/import/extract
```

## Architecture

### Backend (`TrumpetPython/`)
- **Python 3.11** with **FastAPI**, **SQLModel**, and **SQLite** (`data/database/trumpet.db`).
- **Gunicorn** with **Uvicorn** workers for production deployment.
- **Service layer pattern**: Routers delegate to services (`items_service.py`, `communities_service.py`, etc.).
- **Data models hierarchy**: `Community → Collection → Item → MetadataValue`.
- Media files served via local static files OR redirected to **Azure Blob Storage** based on configuration.
- **Data ingestion**: `api/import/extract` endpoint triggers extraction from `data/raw/` and `resources/`.

### Frontend (`Trumpet.Frontend/src/`)
- **React Router v7** with page components in `pages/` (home, communities, items, item-detail, music-paths)
- Each page folder contains its own `api/` subfolder for API calls and `components/` for page-specific UI
- Global reusable components in `src/components/`, custom hooks in `src/hooks/`
- TypeScript interfaces in `src/models/`
- API base URL configured in `src/config.ts` (defaults to `http://localhost:5000`)
- **Tailwind CSS** with CSS variables for theming; dark/light mode via `data-theme` attribute on root
- Leaflet.js used for map visualizations

### Data Layout (repo root)
```
data/raw/          # JSON metadata exports (communities, collections, hierarchy)
data/database/     # trumpet.db (SQLite, git-ignored)
resources/         # Media files organized by item UUID
```

### Key Configuration
`TrumpetPython/.env`:
```env
DATABASE_URL=sqlite:///../data/database/trumpet.db
RESOURCES_PATH=../resources
ALLOWED_ORIGINS=http://localhost:5173
```
*Note: Configured via Pydantic Settings in `database.py`.*
