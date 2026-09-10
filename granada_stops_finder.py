#!/usr/bin/env python3
"""
Fetch Thessaloniki public transport stops from OpenStreetMap (Overpass API)
and write them in the same JSON schema used by bologna.json / granada.json:

    [ { "id": "...", "name": "...", "lat": 0.0, "lon": 0.0 }, ... ]

Usage:
    python fetch_thessaloniki_stops.py
    -> writes thessaloniki.json in the current folder

Then copy it to: src/data/stops/thessaloniki.json

Requires: pip install requests
Data source: OpenStreetMap contributors, ODbL licence.
"""

import json
import sys
import time

try:
    import requests
except ImportError:
    sys.exit("Missing dependency. Run:  pip install requests")

# Several public Overpass instances; tried in order until one answers.
# NOTE: do not add overpass.osm.ch here — it only holds Swiss data and will
# return an empty result for Greece instead of an error.
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.osm.jp/api/interpreter",
]

# How many times to cycle through the whole mirror list before giving up.
MAX_ROUNDS = 3

# Overpass rejects requests with the default python-requests User-Agent (406).
# Identify the script properly — put your own contact in here if you like.
HEADERS = {
    "User-Agent": "transportation-reporting/1.0 (EVOLVE ETS; stop data import)",
}

# Bounding box covering the Thessaloniki urban area (incl. Kalamaria,
# Pylaia, Evosmos, Stavroupoli, Neapoli). south,west,north,east
BBOX = "40.55,22.83,40.72,23.08"

QUERY = f"""
[out:json][timeout:90];
(
  node["highway"="bus_stop"]({BBOX});
  node["public_transport"="platform"]["bus"="yes"]({BBOX});
  node["railway"="tram_stop"]({BBOX});
  node["station"="subway"]({BBOX});
  node["public_transport"="station"]["subway"="yes"]({BBOX});
);
out body;
"""


def main():
    data = None
    for attempt in range(1, MAX_ROUNDS + 1):
        for url in OVERPASS_URLS:
            print(f"[round {attempt}] Querying {url} ...")
            try:
                resp = requests.post(
                    url, data={"data": QUERY}, headers=HEADERS, timeout=200
                )
                resp.raise_for_status()
                data = resp.json()
                break
            except requests.exceptions.RequestException as err:
                print(f"  failed: {err}")
                continue
        if data is not None:
            break
        if attempt < MAX_ROUNDS:
            print("All mirrors busy — waiting 20s before retrying...")
            time.sleep(20)

    if data is None:
        sys.exit(
            "All Overpass mirrors failed (they are often overloaded).\n"
            "Wait a few minutes and run the script again."
        )

    elements = data.get("elements", [])
    print(f"Received {len(elements)} raw elements.")

    stops = []
    seen_names = set()

    for el in elements:
        tags = el.get("tags", {})
        # Prefer the Greek name, fall back to generic name, then English
        name = tags.get("name") or tags.get("name:el") or tags.get("name:en")
        if not name:
            continue  # unnamed stops are useless in a dropdown

        lat, lon = el.get("lat"), el.get("lon")
        if lat is None or lon is None:
            continue

        # Collapse the two sides of the same street into one entry:
        # same name + within ~100m is treated as a duplicate.
        key = (name, round(lat, 3), round(lon, 3))
        if key in seen_names:
            continue
        seen_names.add(key)

        stops.append({
            "id": str(el["id"]),
            "name": name,
            "lat": lat,
            "lon": lon,
        })

    stops.sort(key=lambda s: s["name"])
    print(f"Kept {len(stops)} named, de-duplicated stops.")

    if len(stops) < 100:
        sys.exit(
            f"\nERROR: only {len(stops)} stops found — that is far too few for\n"
            "Thessaloniki, so nothing was written. This usually means the server\n"
            "returned an empty/partial result rather than a real error.\n"
            "Just run the script again."
        )

    with open("thessaloniki.json", "w", encoding="utf-8") as f:
        json.dump(stops, f, ensure_ascii=False, indent=1)

    print("Wrote thessaloniki.json")
    print("Sample:", json.dumps(stops[:3], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()