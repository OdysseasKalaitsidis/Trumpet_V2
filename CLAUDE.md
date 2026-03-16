# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Trumpet** is a full-stack digital archive for the Corfiot Music Archive. It consists of a .NET 8 backend API and a React 19 + TypeScript frontend.

## Commands

### Backend (from `Trumpet.Backend/`)
```bash
dotnet run          # Start API server on http://localhost:5000
dotnet build        # Compile
dotnet watch run    # Run with hot reload
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

### Backend (`Trumpet.Backend/`)
- **ASP.NET Core 8** REST API with **Entity Framework Core** and **SQLite** (`data/database/trumpet.db`)
- **Service layer pattern**: controllers delegate to injected services (`IItemsService`, `ICommunitiesService`, etc.)
- **Data models hierarchy**: `Community → Collection → Item → MetadataValue / Bitstream`
- Tags are stored as `MetadataValue` records with `Field = "trumpet.tag"`
- Media files served as static files from `/resources` at the `/media` URL prefix
- `DataImportService` reads JSON files from `data/raw/` and populates the DB; `hierarchy_*.json` is critical for linking collections to communities
- `AITaggingService` uses predefined mappings + heuristics (not a real LLM) to generate tags
- `RecommendationService` matches items by shared tags

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
`Trumpet.Backend/appsettings.json`:
```json
{
  "ConnectionStrings": { "DefaultConnection": "Data Source=../data/database/trumpet.db" },
  "ProjectSettings": { "ResourcesPath": "../resources", "RawDataPath": "../data/raw" }
}
```
