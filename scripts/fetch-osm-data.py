#!/usr/bin/env python3
"""
Build script: fetch OSM data for Beijing using osmnx, aggressively simplify,
pre-project to SVG coordinates, and output a compact JSON.

Strategy: only keep motorways + trunks + largest water bodies + largest parks.
Target: < 200 KB.

Run: python3 scripts/fetch-osm-data.py
"""

import json
import os

import osmnx as ox
from shapely import simplify
from shapely.geometry import mapping

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "../public/maps/beijing-osm.json")

BOUNDS = {
    "south": 39.6359,
    "north": 40.1755,
    "west": 116.0396,
    "east": 116.7430,
}

W, E, S, N = BOUNDS["west"], BOUNDS["east"], BOUNDS["south"], BOUNDS["north"]
DW = E - W
DH = N - S


def project(lon, lat):
    x = ((lon - W) / DW) * 1000
    y = ((N - lat) / DH) * 800
    return (round(x, 1), round(y, 1))


def simplify_ring(ring, epsilon):
    if len(ring) <= 2:
        return ring

    def sq_dist(a, b):
        dx = a[0] - b[0]
        dy = a[1] - b[1]
        return dx * dx + dy * dy

    def rec(start, end, result):
        max_dist = -1
        idx = -1
        a = ring[start]
        b = ring[end]
        l2 = sq_dist(a, b)
        for i in range(start + 1, end):
            if l2 == 0:
                t = 0
            else:
                t = max(
                    0.0,
                    min(
                        1.0,
                        (
                            (ring[i][0] - a[0]) * (b[0] - a[0])
                            + (ring[i][1] - a[1]) * (b[1] - a[1])
                        )
                        / l2,
                    ),
                )
            proj = (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))
            d = sq_dist(ring[i], proj)
            if d > max_dist:
                max_dist = d
                idx = i
        if max_dist > epsilon * epsilon:
            rec(start, idx, result)
            result.append(ring[idx])
            rec(idx, end, result)

    result = [ring[0]]
    rec(0, len(ring) - 1, result)
    result.append(ring[-1])
    return result


def fetch_roads():
    print("Fetching motorways + trunks only...")
    bbox = (BOUNDS["west"], BOUNDS["south"], BOUNDS["east"], BOUNDS["north"])

    # Only motorways and trunks to keep data tiny
    custom_filter = '["highway"~"^(motorway|trunk)$"]'
    G = ox.graph_from_bbox(
        bbox,
        network_type="drive",
        simplify=True,
        retain_all=True,
        custom_filter=custom_filter,
    )

    gdf_nodes, gdf_edges = ox.graph_to_gdfs(G)
    print(f"Road edges: {len(gdf_edges)}")

    roads = []
    seen = set()
    for _, row in gdf_edges.iterrows():
        geom = row.geometry
        if geom is None or geom.is_empty:
            continue

        coords = list(geom.coords)
        if len(coords) < 2:
            continue

        svg_coords = [project(lon, lat) for lon, lat in coords]
        svg_coords = simplify_ring(svg_coords, 3.0)  # aggressive simplify in px
        if len(svg_coords) < 2:
            continue

        # dedup
        key = tuple((round(x, 1), round(y, 1)) for x, y in svg_coords)
        rkey = tuple(reversed(key))
        if key in seen or rkey in seen:
            continue
        seen.add(key)

        roads.append({"t": "motorway", "c": [svg_coords]})

    return roads


def fetch_features(tags, category, sub_type, geo_eps, min_area, top_n):
    print(f"Fetching {category} ({sub_type})...")
    bbox = (BOUNDS["west"], BOUNDS["south"], BOUNDS["east"], BOUNDS["north"])
    try:
        gdf = ox.features_from_bbox(bbox, tags=tags)
    except Exception as e:
        print(f"  Failed: {e}")
        return []

    print(f"  Found {len(gdf)} features")

    items = []
    for _, row in gdf.iterrows():
        geom = row.geometry
        if geom is None or geom.is_empty:
            continue

        # Use area for polygons, length for linestrings
        try:
            if geom.geom_type in ("Polygon", "MultiPolygon"):
                metric = geom.area
            else:
                metric = geom.length
        except Exception:
            metric = 0

        if metric < min_area:
            continue

        try:
            geom = simplify(geom, tolerance=geo_eps)
        except Exception:
            pass

        svg_rings = []
        if geom.geom_type == "Polygon":
            rings = [list(geom.exterior.coords)] + [list(i.coords) for i in geom.interiors]
            for ring in rings:
                svg_ring = [project(lon, lat) for lon, lat in ring]
                svg_ring = simplify_ring(svg_ring, 2.0)
                if len(svg_ring) >= 3:
                    svg_rings.append(svg_ring)
        elif geom.geom_type == "MultiPolygon":
            for poly in geom.geoms:
                rings = [list(poly.exterior.coords)] + [list(i.coords) for i in poly.interiors]
                for ring in rings:
                    svg_ring = [project(lon, lat) for lon, lat in ring]
                    svg_ring = simplify_ring(svg_ring, 2.0)
                    if len(svg_ring) >= 3:
                        svg_rings.append(svg_ring)
        elif geom.geom_type == "LineString":
            svg_line = [project(lon, lat) for lon, lat in geom.coords]
            svg_line = simplify_ring(svg_line, 2.0)
            if len(svg_line) >= 2:
                svg_rings.append(svg_line)
        elif geom.geom_type == "MultiLineString":
            for line in geom.geoms:
                svg_line = [project(lon, lat) for lon, lat in line.coords]
                svg_line = simplify_ring(svg_line, 2.0)
                if len(svg_line) >= 2:
                    svg_rings.append(svg_line)

        if svg_rings:
            items.append({"metric": metric, "rings": svg_rings})

    # keep top N
    items.sort(key=lambda x: x["metric"], reverse=True)
    items = items[:top_n]
    print(f"  Kept top {len(items)}")

    return [{"t": sub_type, "c": item["rings"]} for item in items]


def main():
    print("Fetching Beijing OSM data (aggressive minimal)...")

    roads = fetch_roads()
    # rivers are linestrings -> use length threshold (in degrees)
    rivers = fetch_features({"waterway": "river"}, "water", "river", 0.005, min_area=0.003, top_n=20)
    # lakes/parks are polygons -> use area threshold (in square degrees); 0.00005 ~ 0.5 km2 at this latitude
    lakes = fetch_features({"natural": "water"}, "water", "lake", 0.005, min_area=0.00005, top_n=20)
    parks = fetch_features({"leisure": "park"}, "park", "park", 0.005, min_area=0.00005, top_n=20)

    data = {
        "type": "beijing-map",
        "bounds": BOUNDS,
        "features": roads + rivers + lakes + parks,
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))

    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Wrote {OUTPUT_PATH} ({size_kb:.1f} KB)")
    print(f"  Roads: {len(roads)}")
    print(f"  Rivers: {len(rivers)}")
    print(f"  Lakes: {len(lakes)}")
    print(f"  Parks: {len(parks)}")


if __name__ == "__main__":
    main()
