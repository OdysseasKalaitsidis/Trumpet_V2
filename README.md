# Trumpet: Migration & Setup Guide

This guide explains how to set up the **Trumpet** project, specifically for existing data archives moving from the legacy `out` folder structure to the new system.

## 📂 Project Structure

To ensure the backend can correctly import and serve your data, you must organize your files as follows within the root `trumpet_data` directory:

```
trumpet_data/
├── data/
│   └── raw/                     <-- Place your JSON metadata files here
│       ├── communities_*.json
│       ├── collections_*.json
│       └── hierarchy_*.json     <-- Critical for Community->Collection links!
├── resources/                   <-- Media files (formerly 'out')
│   └── [uuid]/                  <-- Item folders
├── TrumpetPython/               <-- FastAPI Backend
└── Trumpet.Frontend/            <-- React Frontend
```

### 1. Metadata Files (`data/raw`)
Place the following JSON export files into `data/raw`:
*   `communities_20251022_132429.json` (or similar timestamp)
*   `collections_20251022_132519.json`
*   `hierarchy_20251021_204338.json` (Required to link orphaned collections to communities)

### 2. Resource Files (`resources`)
*   Locate your existing `out` folder.
*   Rename it to `resources`.
*   Establish it at the root level, so the path is `trumpet_data/resources`.
*   Inside, it should contain folders named by UUID (e.g., `6084e990-...`), which contain `items`, `bitstreams`, and `item_expanded.json`.

---

## ⚙️ Configuration

The project uses a `.env` file (or environment variables in production) inside the `TrumpetPython` directory.

**Verify `.env` or App Settings:**
- `DATABASE_URL`: `sqlite:///../data/database/trumpet.db`
- `RESOURCES_PATH`: `../resources`
- `ALLOWED_ORIGINS`: `http://localhost:5173` (comma-separated URLs)

*Note: Relative paths work automatically across operating systems.*

---

## 🚀 Running the Import

Once your files are in place:

1.  **Start the Backend:**
    ```bash
    cd TrumpetPython
    pip install -r requirements.txt
    python main.py
    ```
    *(Ensure it is listening on http://localhost:8000)*

2.  **Trigger Data Ingestion:**
    Open a terminal and run the following command to populate the database:
    ```bash
    curl -X POST http://localhost:8000/api/import/extract
    ```
    *   This process runs in the background.
    *   It imports Communities, Collections, and most importantly, parses `hierarchy.json` to link them correctly.
    *   Finally, it ingests all Items from the `resources` folder.

3.  **Verify:**
    *   Visit `http://localhost:8000/docs` to see the Interactive API documentation (Swagger).
    *   Visit `http://localhost:8000/health` to check system status.

### 4. Running the Frontend

1.  Open a new terminal window/tab.
2.  Navigate to the frontend directory:
    ```bash
    cd Trumpet.Frontend
    ```
3.  Install dependencies (first time only):
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open your browser to the local URL (e.g., `http://localhost:5173`).

---

## 🛠️ Troubleshooting

*   **"No items in community":** This usually means the `hierarchy.json` file wasn't imported. Run the import command again.
*   **"Directory not found":** Check `appsettings.json` and ensure the `RawDataPath` and `ResourcesPath` are correct absolute paths.
