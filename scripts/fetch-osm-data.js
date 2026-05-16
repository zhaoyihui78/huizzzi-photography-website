/**
 * Build script: fetch OSM data for Beijing, simplify, and output TopoJSON.
 * Run: node scripts/fetch-osm-data.js
 */

const fs = require('fs');
const path = require('path');

// We'll use native fetch (Node 18+) and minimal dependencies.
// Simplification is done with a lightweight Douglas-Peucker implementation
// to avoid pulling in the full turf bundle for a build script.

const OUTPUT_PATH = path.join(__dirname, '../public/maps/beijing-osm.json');
const BOUNDS = {
  south: 39.6359,
  north: 40.1755,
  west: 116.0396,
  east: 116.7430,
};

// ------------------------------------------------------------------
// Tiny Douglas–Peucker (operates on geo-coord arrays [lng, lat])
// ------------------------------------------------------------------
function sqDist(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function simplifyDP(points, epsilon) {
  if (points.length <= 2) return points;

  const epsilonSq = epsilon * epsilon;

  function rec(start, end, result) {
    let maxDist = -1;
    let idx = -1;
    const a = points[start];
    const b = points[end];
    for (let i = start + 1; i < end; i++) {
      // perpendicular distance squared to segment a-b
      const l2 = sqDist(a, b);
      let t = 0;
      if (l2 !== 0) {
        t = ((points[i][0] - a[0]) * (b[0] - a[0]) + (points[i][1] - a[1]) * (b[1] - a[1])) / l2;
        t = Math.max(0, Math.min(1, t));
      }
      const proj = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
      const d = sqDist(points[i], proj);
      if (d > maxDist) {
        maxDist = d;
        idx = i;
      }
    }
    if (maxDist > epsilonSq) {
      rec(start, idx, result);
      result.push(points[idx]);
      rec(idx, end, result);
    }
  }

  const result = [points[0]];
  rec(0, points.length - 1, result);
  result.push(points[points.length - 1]);
  return result;
}

function simplifyFeature(feature, epsilon) {
  const geom = feature.geometry;
  if (!geom) return feature;

  const clone = JSON.parse(JSON.stringify(feature));
  const g = clone.geometry;

  if (g.type === 'LineString') {
    g.coordinates = simplifyDP(g.coordinates, epsilon);
  } else if (g.type === 'MultiLineString') {
    g.coordinates = g.coordinates.map((line) => simplifyDP(line, epsilon));
  } else if (g.type === 'Polygon') {
    g.coordinates = g.coordinates.map((ring) => simplifyDP(ring, epsilon));
  } else if (g.type === 'MultiPolygon') {
    g.coordinates = g.coordinates.map((polygon) => polygon.map((ring) => simplifyDP(ring, epsilon)));
  }
  return clone;
}

// ------------------------------------------------------------------
// Overpass helpers
// ------------------------------------------------------------------
function buildOverpassQuery() {
  const { south, west, north, east } = BOUNDS;
  const bbox = `${south},${west},${north},${east}`;

  return `
[out:json];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](${bbox});
  way["waterway"="river"](${bbox});
  way["natural"="water"](${bbox});
  way["leisure"="park"](${bbox});
  way["highway"~"^(residential|living_street)$"](${bbox});
);
out body;
>;
out skel qt;
`.trim();
}

async function fetchOverpass() {
  const query = buildOverpassQuery();
  const url = 'https://overpass.openstreetmap.fr/api/interpreter';

  console.log('Fetching OSM data from Overpass API...');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ------------------------------------------------------------------
// Convert Overpass JSON → GeoJSON-like features
// ------------------------------------------------------------------
function parseOsmToGeoFeatures(osmJson) {
  const nodes = new Map();
  for (const el of osmJson.elements) {
    if (el.type === 'node') {
      nodes.set(el.id, [el.lon, el.lat]);
    }
  }

  const features = [];

  for (const el of osmJson.elements) {
    if (el.type !== 'way') continue;
    const coords = el.nodes.map((nid) => nodes.get(nid)).filter(Boolean);
    if (coords.length < 2) continue;

    const tags = el.tags || {};
    const highway = tags.highway || '';
    const waterway = tags.waterway || '';
    const natural = tags.natural || '';
    const leisure = tags.leisure || '';

    let category = 'road';
    let subType = 'default';

    if (highway) {
      category = 'road';
      if (['motorway', 'trunk'].includes(highway)) subType = 'motorway';
      else if (highway === 'primary') subType = 'primary';
      else if (highway === 'secondary') subType = 'secondary';
      else if (highway === 'tertiary') subType = 'tertiary';
      else if (['residential', 'living_street'].includes(highway)) subType = 'residential';
    } else if (waterway === 'river' || natural === 'water') {
      category = 'water';
      subType = waterway === 'river' ? 'river' : 'lake';
    } else if (leisure === 'park') {
      category = 'park';
      subType = 'park';
    } else {
      continue; // skip unknown
    }

    const geomType = (category === 'water' || category === 'park') ? 'Polygon' : 'LineString';
    const geometryCoords = geomType === 'Polygon' ? [coords] : coords;

    features.push({
      type: 'Feature',
      properties: { category, subType },
      geometry: {
        type: geomType,
        coordinates: geometryCoords,
      },
    });
  }

  return features;
}

// ------------------------------------------------------------------
// Manual TopoJSON encode (we only need geometry; avoids heavy lib)
// ------------------------------------------------------------------
function encodeTopoJSON(features, name) {
  const arcs = [];
  const objects = [];

  // We store everything as MultiLineString / Polygon arcs for tiny size.
  // For simplicity, encode each feature as a geometry object with arc indexes.
  function pushArc(coordList) {
    // delta-encode
    const arc = [];
    let prevLon = 0;
    let prevLat = 0;
    for (const [lon, lat] of coordList) {
      const dLon = Math.round((lon - prevLon) * 1e6);
      const dLat = Math.round((lat - prevLat) * 1e6);
      arc.push([dLon, dLat]);
      prevLon = lon;
      prevLat = lat;
    }
    const idx = arcs.length;
    arcs.push(arc);
    return idx;
  }

  const geometries = [];

  for (const f of features) {
    const geom = f.geometry;
    if (geom.type === 'LineString') {
      const arcIdx = pushArc(geom.coordinates);
      geometries.push({
        type: 'LineString',
        properties: f.properties,
        arcs: [arcIdx],
      });
    } else if (geom.type === 'Polygon') {
      const ringArcs = geom.coordinates.map((ring) => pushArc(ring));
      geometries.push({
        type: 'Polygon',
        properties: f.properties,
        arcs: [ringArcs],
      });
    } else if (geom.type === 'MultiLineString') {
      const lineArcs = geom.coordinates.map((line) => pushArc(line));
      geometries.push({
        type: 'MultiLineString',
        properties: f.properties,
        arcs: lineArcs,
      });
    } else if (geom.type === 'MultiPolygon') {
      // simplify: take first polygon only for parks/water to keep size down
      const polyArcs = geom.coordinates[0].map((ring) => pushArc(ring));
      geometries.push({
        type: 'Polygon',
        properties: f.properties,
        arcs: [polyArcs],
      });
    }
  }

  return {
    type: 'Topology',
    objects: {
      [name]: {
        type: 'GeometryCollection',
        geometries,
      },
    },
    arcs,
    bbox: [BOUNDS.west, BOUNDS.south, BOUNDS.east, BOUNDS.north],
  };
}

function decodeTopoJSON(topo) {
  const geometries = [];
  const obj = topo.objects.beijing;

  for (const g of obj.geometries) {
    const properties = g.properties;

    if (g.type === 'LineString') {
      const coords = arcToCoords(topo.arcs[g.arcs[0]]);
      geometries.push({
        type: 'Feature',
        properties,
        geometry: { type: 'LineString', coordinates: coords },
      });
    } else if (g.type === 'Polygon') {
      const rings = g.arcs[0].map((arcIdx) => arcToCoords(topo.arcs[arcIdx]));
      geometries.push({
        type: 'Feature',
        properties,
        geometry: { type: 'Polygon', coordinates: rings },
      });
    } else if (g.type === 'MultiLineString') {
      const lines = g.arcs.map((arcIdx) => arcToCoords(topo.arcs[arcIdx]));
      geometries.push({
        type: 'Feature',
        properties,
        geometry: { type: 'MultiLineString', coordinates: lines },
      });
    }
  }

  return { type: 'FeatureCollection', features: geometries };
}

function arcToCoords(arc) {
  let lon = 0;
  let lat = 0;
  const coords = [];
  for (const [dlon, dlat] of arc) {
    lon += dlon / 1e6;
    lat += dlat / 1e6;
    coords.push([lon, lat]);
  }
  return coords;
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function main() {
  try {
    const osmJson = await fetchOverpass();
    console.log(`Received ${osmJson.elements.length} OSM elements`);

    let features = parseOsmToGeoFeatures(osmJson);
    console.log(`Parsed ${features.length} features`);

    // Simplify per category
    const epsilons = {
      motorway: 0.0015,
      primary: 0.001,
      secondary: 0.0008,
      tertiary: 0.0006,
      default: 0.0004,
      river: 0.001,
      lake: 0.001,
      park: 0.001,
      residential: 0.0003,
    };

    features = features.map((f) => {
      const sub = f.properties.subType;
      const eps = epsilons[sub] || epsilons.default;
      return simplifyFeature(f, eps);
    });

    console.log(`Simplified features`);

    const topo = encodeTopoJSON(features, 'beijing');

    // verify decode works
    const decoded = decodeTopoJSON(topo);
    console.log(`Decoded back to ${decoded.features.length} features for sanity check`);

    const jsonStr = JSON.stringify(topo);
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, jsonStr, 'utf-8');

    const sizeKB = (jsonStr.length / 1024).toFixed(1);
    console.log(`Wrote ${OUTPUT_PATH} (${sizeKB} KB)`);
  } catch (err) {
    console.error('Failed to fetch OSM data:', err.message);
    process.exit(1);
  }
}

main();
