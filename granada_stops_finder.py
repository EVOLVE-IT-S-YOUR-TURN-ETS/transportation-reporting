#!/usr/bin/env python3
"""
Fetch all public transport stops in the Granada (Spain) metro area from
OpenStreetMap via the Overpass API, dedupe them by name + geographic
proximity, and write out `granada.json` in the same shape as `bologna.json`:

  [
    {"id": "1", "name": "GRAN VÍA - CATEDRAL", "lat": 37.176, "lon": -3.598},
    ...
  ]

Also writes `granada_raw.json` (the untouched OSM dump) for auditing.

Only stdlib — no pip installs needed.

Usage:
    python3 fetch_granada_stops.py

Output files land in the same folder as the script.
"""

import json
import math
import urllib.request
from collections import defaultdict
from pathlib import Path

# --- Configuration ---------------------------------------------------------

# Bounding box for Granada + metro area (south, west, north, east).
# Tweak the box if you want smaller / larger coverage.
#   south=37.05  (roughly Alhendín)
#   north=37.30  (roughly Albolote/Peligros)
#   west=-3.80   (Santa Fe / airport)
#   east=-3.40   (Cenes/Huétor Vega)
BBOX = (37.05, -3.80, 37.30, -3.40)

# Overpass query — includes bus stops, tram stops, and public transport
# platforms tagged for bus or tram.
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
QUERY = f"""
[out:json][timeout:180];
(
  node["highway"="bus_stop"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
  node["public_transport"="platform"]["bus"="yes"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
  node["public_transport"="platform"]["tram"="yes"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
  node["railway"="tram_stop"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
);
out;
"""

CLUSTER_RADIUS_METERS = 200

OUT_DIR = Path(__file__).parent
RAW_OUT = OUT_DIR / "granada_raw.json"
CLEAN_OUT = OUT_DIR / "granada.json"


# --- Overpass fetch --------------------------------------------------------

def fetch_from_overpass():
    print(f"Fetching stops from Overpass... (bbox {BBOX})")
    req = urllib.request.Request(
        OVERPASS_URL,
        data=QUERY.encode("utf-8"),
        method="POST",
        headers={"User-Agent": "granada-stops-fetch/1.0 (personal transit app)"},
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        raw = json.load(resp)
    RAW_OUT.write_text(json.dumps(raw, ensure_ascii=False, indent=2))
    print(f"  → wrote {RAW_OUT.name} ({len(raw.get('elements', []))} elements)")
    return raw


# --- Normalize -------------------------------------------------------------

def normalize(raw):
    """Turn OSM elements into {id,name,lat,lon} entries.
    Drops entries without a `name` tag — the app needs names to display."""
    stops = []
    dropped_no_name = 0
    for el in raw.get("elements", []):
        if el.get("type") != "node":
            continue
        tags = el.get("tags", {}) or {}
        name = tags.get("name")
        if not name:
            dropped_no_name += 1
            continue
        stops.append({
            "id": str(el["id"]),        # OSM node id — globally unique, stable
            "name": name.strip(),
            "lat": round(el["lat"], 7),
            "lon": round(el["lon"], 7),
        })
    print(f"  → {len(stops)} named stops (dropped {dropped_no_name} unnamed)")
    return stops


# --- Dedup (same logic as the Bologna cleanup) -----------------------------

def haversine_m(lat1, lon1, lat2, lon2):
    R = 6_371_000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp/2)**2 + math.cos(p1) * math.cos(p2) * math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(a))


def dedupe(stops, radius_m=CLUSTER_RADIUS_METERS):
    """Group by name, then within each name group cluster points within
    `radius_m` of each other. Same-named stops in different parts of town
    stay separate. Preserves one representative id per cluster."""
    by_name = defaultdict(list)
    for s in stops:
        by_name[s["name"]].append(s)

    deduped = []
    for name, entries in by_name.items():
        clusters = []
        for e in entries:
            placed = False
            for c in clusters:
                clat = c["lat_sum"] / c["n"]
                clon = c["lon_sum"] / c["n"]
                if haversine_m(e["lat"], e["lon"], clat, clon) <= radius_m:
                    c["lat_sum"] += e["lat"]
                    c["lon_sum"] += e["lon"]
                    c["n"] += 1
                    c["ids"].append(e["id"])
                    placed = True
                    break
            if not placed:
                clusters.append({
                    "lat_sum": e["lat"], "lon_sum": e["lon"],
                    "n": 1, "ids": [e["id"]],
                })
        for c in clusters:
            deduped.append({
                # Use the first OSM id as the primary id; this matches the
                # scalar-id shape your StationPicker expects.
                "id":   c["ids"][0],
                "name": name,
                "lat":  round(c["lat_sum"] / c["n"], 7),
                "lon":  round(c["lon_sum"] / c["n"], 7),
            })
    deduped.sort(key=lambda x: (x["name"], x["lat"]))
    return deduped


# --- Main ------------------------------------------------------------------

def main():
    raw = fetch_from_overpass()
    stops = normalize(raw)
    print(f"Deduping (cluster radius {CLUSTER_RADIUS_METERS}m)...")
    clean = dedupe(stops)
    CLEAN_OUT.write_text(json.dumps(clean, ensure_ascii=False, indent=2))

    print()
    print(f"Raw named stops: {len(stops)}")
    print(f"After dedup:     {len(clean)}")
    print(f"Saved:           {CLEAN_OUT}")
    print()
    print("Preview (first 5):")
    for s in clean[:5]:
        print(f"  {s}")


if __name__ == "__main__":
    main()