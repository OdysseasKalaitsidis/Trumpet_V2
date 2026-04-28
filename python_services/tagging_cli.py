#!/usr/bin/env python3
"""
tagging_cli.py — Trumpet Tagging CLI Shim
==========================================
Called by PHP TaggingService via shell_exec().

Usage:
    python3 tagging_cli.py '<item_json>'

Input:
    A JSON-encoded item object as a single argument.
    Expected shape:
      {
        "Id": "...", "Name": "...",
        "metadata": [{"Field": "dc.title", "Value": "...", ...}, ...]
      }

Output:
    A JSON array of tag strings, printed to stdout.
    Example: ["Piano", "Romantic", "Opera"]

Dependencies:
    None — stdlib only (json, sys).
"""

import sys
import json

# ── Predefined tag map (exact match on lowercase item name) ──────────────────
# Ported 1:1 from TrumpetPython/services/tagging_service.py
PREDEFINED: dict[str, list[str]] = {
    "metodo per lo studio del pianoforte": ["Piano", "Pedagogy", "Instructional"],
    "marche hongroise": ["Classical", "Orchestral", "Piano Solo"],
    "spanische tanze": ["Dance", "Spanish", "Romantic"],
    "libro iii, mazurke per pianoforte op.6": ["Chopin", "Mazurka", "Piano"],
    "menuet aus mozart's sinfonie in es": ["Mozart", "Symphony", "Arrangement"],
    "etude iii": ["Study", "Technique", "Piano"],
    "danse de la frayeur": ["de Falla", "Modern", "Spanish"],
    "preghiera del mose": ["Rossini", "Opera", "Sacred"],
    "iris serenata di jor": ["Mascagni", "Opera", "Serenade"],
    "la gioconda": ["Ponchielli", "Opera", "Vocal Score"],
    "herodiade": ["Massenet", "French Opera", "Biblical"],
    "il barbiere di siviglia": ["Rossini", "Opera Buffa", "Italian"],
    "chant hindou": ["Rimsky-Korsakov", "Opera", "Sadko"],
    "vorrei morire!...": ["Tosti", "Romanza", "Vocal"],
    "rigoletto": ["Verdi", "Opera", "Drama"],
    "tosca": ["Puccini", "Opera", "Verismo"],
    "mefistofele": ["Boito", "Opera", "Faust"],
    "rondo capriccioso": ["Mendelssohn", "Virtuoso", "Piano"],
    "danze spagnuole per pianoforte, op.12": ["Moszkowski", "Dance", "Piano"],
    "caprice espagnol": ["Rimsky-Korsakov", "Orchestral", "Spanish"],
    "nocturnes": ["Chopin", "Romantic", "Piano"],
    "humoresques de concert menuet pour piano": ["Paderewski", "Piano Solo", "Concert"],
    "fedora": ["Giordano", "Opera", "Verismo"],
    "czardas": ["Monti", "Hungarian", "Violin/Piano"],
    "die lustige witwe": ["Lehár", "Operetta", "Viennese"],
    "serenade / σερενάδα": ["Vocal", "Romantic", "Melodic"],
    "cavalerie legere": ["von Suppé", "Overture", "Operetta"],
    "le tango de nos amours": ["Tango", "Dance", "Popular"],
    "26 melodies": ["Vocal", "Collection", "Art Song"],
    "der zigeunerprimas": ["Kálmán", "Operetta", "Gypsy Style"],
    "egmont": ["Beethoven", "Incidental Music", "Overture"],
    "ο γέρο δήμος": ["Karreras", "Greek Song", "Folklore"],
    "lakme": ["Delibes", "French Opera", "Exoticism"],
    "cavalleria rusticana": ["Mascagni", "Verismo", "Opera"],
    "mignon": ["Thomas", "Opéra Comique", "French"],
    "cavatine de leïla": ["Bizet", "The Pearl Fishers", "Soprano"],
    "mireille": ["Gounod", "Opera", "Provençal"],
    "romeo et juliette": ["Gounod", "Shakespeare", "Opera"],
    "i puritani": ["Bellini", "Bel Canto", "Opera"],
    "la sonnambula": ["Bellini", "Bel Canto", "Opera"],
    "die csárdásfürstin": ["Kálmán", "Operetta", "Hungarian"],
    "aida": ["Verdi", "Grand Opera", "Egypt"],
    "ouverture de guillaume tell": ["Rossini", "Overture", "Final"],
    "pagliacci": ["Leoncavallo", "Verismo", "Opera"],
    "μέθυσες μια καρδιά": ["Greek", "Popular", "Vocal"],
    "souvenir des aples": ["Flute/Piano", "Romantic", "Alpine"],
    "madame butterfly": ["Puccini", "Opera", "Japan"],
    "invitation a la valse": ["Weber", "Waltz", "Piano"],
    "manon": ["Massenet", "French Opera", "Drama"],
    "mattinata": ["Leoncavallo", "Song", "Italian"],
    "chanson de solveig": ["Grieg", "Peer Gynt", "Vocal"],
    "tannhauser": ["Wagner", "German Opera", "Romantic"],
}

# ── Keyword heuristic map ─────────────────────────────────────────────────────
KEYWORDS: dict[str, list[str]] = {
    "Music":          ["music", "song"],
    "Ensemble":       ["band", "orchestra"],
    "Oral History":   ["interview", "oral info"],
    "Sheet Music":    ["score", "sheet", "notation"],
    "Audio Recording":["recording", "tape"],
    "Corfu Heritage": ["corfu", "kerkyra"],
    "Choral":         ["χορωδία", "choir"],
    "Piano":          ["πιάνο", "πιάνου", "piano"],
    "Violin":         ["βιολί", "violin"],
    "Jazz":           ["jazz"],
    "Classical":      ["classical", "symphony"],
    "Sacred Music":   ["church", "sacred", "chant"],
    "Folk":           ["folk", "traditional"],
    "Brass":          ["trumpet", "brass"],
}

USEFUL_META_FIELDS = {"dc.description", "dc.subject", "dc.contributor", "dc.type", "dc.title"}


def generate_tags(item: dict) -> list[str]:
    name = item.get("Name", "").lower().strip()

    # 1. Predefined exact / substring match
    for key, tags in PREDEFINED.items():
        if key in name:
            return tags

    # 2. Build context text from name + useful metadata fields
    context = item.get("Name", "")
    for meta in item.get("metadata", []):
        field = meta.get("Field", "")
        if any(field.startswith(f) for f in USEFUL_META_FIELDS):
            context += " " + (meta.get("Value") or "")

    lower = context.lower()

    # 3. Keyword heuristic
    potential: set[str] = set()
    for tag, words in KEYWORDS.items():
        if any(w in lower for w in words):
            potential.add(tag)

    if not potential:
        return ["Uncategorized", "Archive Item"]

    return list(potential)[:3]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("[]")
        sys.exit(0)

    try:
        item = json.loads(sys.argv[1])
        tags = generate_tags(item)
        print(json.dumps(tags, ensure_ascii=False))
    except Exception:
        print('["Uncategorized", "Archive Item"]')
