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
├── resources/                   <-- Rename your 'out' folder to 'resources'
│   └── [uuid]/                  <-- Item folders containing item_expanded.json
├── Trumpet.Backend/
└── Trumpet.Frontend/
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

The project is configured to look for these folders using absolute paths in `Trumpet.Backend/appsettings.json`.

**Verify `appsettings.json`:**
```json
"ProjectSettings": {
  "ResourcesPath": "C:/Path/To/Your/trumpet_data/resources",
  "RawDataPath": "C:/Path/To/Your/trumpet_data/data/raw"
}
```
*Note: Ensure these paths match your actual local file system location.*

---

## 🚀 Running the Import

Once your files are in place:

1.  **Start the Backend:**
    ```powershell
    cd Trumpet.Backend
    dotnet run
    ```
    *(Ensure it is listening on http://localhost:5000)*

2.  **Trigger Data Ingestion:**
    Open a terminal and run the following command to populate the database:
    ```bash
    curl -X POST http://localhost:5000/api/import/extract
    ```
    *   This process runs in the background.
    *   It imports Communities, Collections, and most importantly, parses `hierarchy.json` to link them correctly.
    *   Finally, it ingests all Items from the `resources` folder.

3.  **Verify:**
    *   Visit `http://localhost:5000/api/communities` to see the structure.
    *   Visit `http://localhost:5000/api/items/path-counts` to see item distribution.

---

## 🛠️ Troubleshooting

*   **"No items in community":** This usually means the `hierarchy.json` file wasn't imported. Run the import command again.
*   **"Directory not found":** Check `appsettings.json` and ensure the `RawDataPath` and `ResourcesPath` are correct absolute paths.
