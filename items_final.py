# -*- coding: utf-8 -*-
"""
Created on Mon Nov  3 16:25:11 2025

@author: george
"""

#!/usr/bin/env python3
"""
Read local collections.json, list up to 500 items per collection, fetch each item
with expand=metadata,bitstreams, and download bitstreams using exact filenames.
Skips downloading a bitstream if the file already exists.

Outputs under: out/collections/<collectionId>/
"""

import os, csv, json, sys, time, uuid, pathlib
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urljoin, urlparse

import requests
from requests.adapters import HTTPAdapter, Retry

# ===================== CONFIG =====================
BASE_URL = "http://trumpet.di.ionio.gr"
COLLECTIONS_FILE = "collections_20251022_132519.json"
OUT_BASE = pathlib.Path("out/collections")
TIMEOUT = 30
MAX_RETRIES = 4
BACKOFF = 0.5
VERIFY_TLS = True           # ignored for http
SLEEP_BETWEEN = 0.03
HEADERS_JSON = {"Accept": "application/json"}
HEADERS_BIN  = {}
EXPAND_QUERY = "metadata,bitstreams"
LIMIT = 500                 # <— use ?limit=500 on listings
# ==================================================


def make_session() -> requests.Session:
    s = requests.Session()
    retries = Retry(
        total=MAX_RETRIES,
        backoff_factor=BACKOFF,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset(["GET"]),
        raise_on_status=False,
    )
    ad = HTTPAdapter(max_retries=retries)
    s.mount("http://", ad); s.mount("https://", ad)
    return s

def parse_link_header(v: str) -> Dict[str, str]:
    links = {}
    if not v: return links
    for part in v.split(","):
        sec = part.strip().split(";")
        if not sec: continue
        url = sec[0].strip()
        if url.startswith("<") and url.endswith(">"): url = url[1:-1]
        rel = None
        for kv in sec[1:]:
            kv = kv.strip()
            if kv.lower().startswith("rel="): rel = kv.split("=",1)[1].strip('"\'')
        if rel: links[rel] = url
    return links

def get_next_url(resp: requests.Response, body: Union[Dict[str, Any], List[Any]]) -> Optional[str]:
    if isinstance(body, dict):
        if isinstance(body.get("next"), str): return body["next"]
        links = body.get("links") or body.get("_links")
        if isinstance(links, dict):
            nxt = links.get("next")
            if isinstance(nxt, str): return nxt
            if isinstance(nxt, dict) and "href" in nxt: return nxt["href"]
    link = resp.headers.get("Link")
    if link: return parse_link_header(link).get("next")
    return None

def rest_get_all(session: requests.Session, url: str, params: Optional[Dict[str, Any]] = None) -> List[Any]:
    """GET all pages, honoring ?limit and following Link/next."""
    items: List[Any] = []
    cur_url, cur_params = url, dict(params or {})
    while cur_url:
        r = session.get(cur_url, headers=HEADERS_JSON, params=cur_params, timeout=TIMEOUT, verify=VERIFY_TLS)
        r.raise_for_status()
        data = r.json()
        if isinstance(data, list):
            items.extend(data)
        elif isinstance(data, dict):
            arr_keys = [k for k, v in data.items() if isinstance(v, list)]
            if arr_keys:
                for k in arr_keys: items.extend(data[k])
            else:
                items.append(data)
        else:
            raise RuntimeError(f"Unexpected JSON at {cur_url}: {type(data)}")
        nxt = get_next_url(r, data)
        cur_url, cur_params = (nxt, {}) if nxt else (None, {})
        time.sleep(SLEEP_BETWEEN)
    return items

def resolve_url(path_or_url: str) -> str:
    if not path_or_url: return ""
    if bool(urlparse(path_or_url).netloc): return path_or_url
    return urljoin(BASE_URL.rstrip("/") + "/", path_or_url.lstrip("/"))

def download_file(session: requests.Session, url: str, out_path: pathlib.Path) -> Dict[str, Any]:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with session.get(url, headers=HEADERS_BIN, stream=True, timeout=TIMEOUT, verify=VERIFY_TLS) as r:
        r.raise_for_status()
        total = 0
        with out_path.open("wb") as f:
            for chunk in r.iter_content(1024 * 1024):
                if chunk:
                    f.write(chunk); total += len(chunk)
        return {"file_path": str(out_path), "bytes": total, "content_type": r.headers.get("Content-Type", "")}

def load_collections(path: Union[str, pathlib.Path]) -> List[Dict[str, Any]]:
    p = pathlib.Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    if isinstance(data, list): return data
    if isinstance(data, dict):
        arr_keys = [k for k, v in data.items() if isinstance(v, list)]
        if arr_keys:
            merged: List[Dict[str, Any]] = []
            for k in arr_keys:
                merged.extend(v for v in data[k] if isinstance(v, dict))
            return merged
        return [data]
    raise RuntimeError(f"collections.json not a JSON array/object: {type(data)}")

def main():
    session = make_session()
    collections = load_collections(COLLECTIONS_FILE)
    if not collections:
        print("No collections found in collections.json"); sys.exit(0)

    OUT_BASE.mkdir(parents=True, exist_ok=True)

    for c in collections:
        col_id = c.get("uuid") or c.get("id")
        if not col_id: continue

        col_dir = OUT_BASE / str(col_id)
        (col_dir / "items").mkdir(parents=True, exist_ok=True)

        # 1) List items in collection with ?limit=500 (pagination still supported if >500)
        items_url = resolve_url(f"/rest/collections/{col_id}/items")
        try:
            items_list = rest_get_all(session, items_url, params={"limit": LIMIT})
        except Exception as e:
            sys.stderr.write(f"[collection {col_id}] items list error: {e}\n")
            continue

        (col_dir / "items.json").write_text(json.dumps(items_list, ensure_ascii=False, indent=2), encoding="utf-8")

        # 2) For each item, get expanded payload and download its bitstreams
        manifest_path = col_dir / "manifest.csv"
        with manifest_path.open("w", newline="", encoding="utf-8") as mf:
            w = csv.DictWriter(mf, fieldnames=[
                "collection_id","item_id","bitstream_id","bitstream_name",
                "file_path","retrieveLink","content_type","bytes","status"
            ])
            w.writeheader()

            for item in items_list:
                item_id = item.get("uuid") or item.get("id")
                if not item_id: continue

                # Expanded item
                item_url = resolve_url(f"/rest/items/{item_id}")
                try:
                    r = session.get(item_url, headers=HEADERS_JSON,
                                    params={"expand": EXPAND_QUERY}, timeout=TIMEOUT, verify=VERIFY_TLS)
                    r.raise_for_status()
                    item_expanded = r.json()
                except Exception as e:
                    sys.stderr.write(f"[collection {col_id}] item {item_id} expand error: {e}\n")
                    continue

                item_dir = col_dir / "items" / str(item_id)
                item_dir.mkdir(parents=True, exist_ok=True)
                (item_dir / "item_expanded.json").write_text(
                    json.dumps(item_expanded, ensure_ascii=False, indent=2), encoding="utf-8"
                )

                bitstreams = item_expanded.get("bitstreams") or []
                if not isinstance(bitstreams, list): bitstreams = []
                bits_dir = item_dir / "bitstreams"

                for b in bitstreams:
                    b_id = b.get("uuid") or b.get("id") or ""
                    name = (b.get("name") or "").strip()  # exact filename
                    retrieve = resolve_url(b.get("retrieveLink") or "")
                    if not retrieve:
                        sys.stderr.write(f"[collection {col_id} item {item_id}] skip: no retrieveLink for {b_id}\n")
                        continue
                    if not name:
                        tail = pathlib.PurePosixPath(urlparse(retrieve).path).name
                        name = tail or f"bitstream_{b_id or uuid.uuid4().hex}"

                    target = bits_dir / name
                    if target.exists():
                        # Do not download again
                        print(f"[SKIP exists] {target}")
                        w.writerow({
                            "collection_id": col_id,
                            "item_id": item_id,
                            "bitstream_id": b_id,
                            "bitstream_name": name,
                            "file_path": str(target),
                            "retrieveLink": retrieve,
                            "content_type": "",
                            "bytes": target.stat().st_size if target.is_file() else "",
                            "status": "skipped_existing",
                        })
                        continue

                    try:
                        meta = download_file(session, retrieve, target)
                        print(f"[OK] col={col_id} item={item_id} -> {meta['file_path']} ({meta['bytes']} bytes)")
                        w.writerow({
                            "collection_id": col_id,
                            "item_id": item_id,
                            "bitstream_id": b_id,
                            "bitstream_name": name,
                            "file_path": meta["file_path"],
                            "retrieveLink": retrieve,
                            "content_type": meta["content_type"],
                            "bytes": meta["bytes"],
                            "status": "downloaded",
                        })
                    except requests.HTTPError as e:
                        sys.stderr.write(f"[ERR] col={col_id} item={item_id} name={name} -> HTTP {e.response.status_code}\n")
                    except Exception as e:
                        sys.stderr.write(f"[ERR] col={col_id} item={item_id} name={name} -> {e}\n")
                    time.sleep(SLEEP_BETWEEN)

    print("\nAll done.")
    print(f"Results under: {OUT_BASE.resolve()}")

if __name__ == "__main__":
    main()
