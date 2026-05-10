#!/usr/bin/env python3
"""
recommendation_cli.py — Trumpet Recommendation CLI Shim
========================================================
Called by PHP RecommendationService (if you choose to delegate to Python).
NOTE: The PHP RecommendationService currently implements this entirely in SQL,
so this CLI is provided as a reference/fallback only.

Usage:
    python3 recommendation_cli.py <item_id> <db_path>

Output:
    JSON array of recommended item IDs, printed to stdout.

Dependencies:
    None — stdlib only (sqlite3, json, sys).
"""

import sys
import json
import sqlite3


def get_recommendations(db_path: str, item_id: str, max_results: int = 5) -> list[str]:
    conn = sqlite3.connect(db_path)
    cur  = conn.cursor()

    # Get source item tags
    cur.execute(
        "SELECT Value FROM MetadataValues WHERE ItemId = ? AND Field = 'trumpet.tag'",
        (item_id,)
    )
    source_tags = [row[0] for row in cur.fetchall()]

    if not source_tags:
        conn.close()
        return []

    placeholders = ",".join("?" * len(source_tags))
    cur.execute(
        f"""
        SELECT ItemId, COUNT(Id) AS match_count
        FROM MetadataValues
        WHERE Field = 'trumpet.tag'
          AND ItemId != ?
          AND Value IN ({placeholders})
        GROUP BY ItemId
        ORDER BY match_count DESC
        LIMIT ?
        """,
        [item_id, *source_tags, max_results]
    )

    rows = cur.fetchall()
    conn.close()
    return [row[0] for row in rows]


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("[]")
        sys.exit(0)

    try:
        item_id = sys.argv[1]
        db_path = sys.argv[2]
        ids     = get_recommendations(db_path, item_id)
        print(json.dumps(ids))
    except Exception:
        print("[]")
