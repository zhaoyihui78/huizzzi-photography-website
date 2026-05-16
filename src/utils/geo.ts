/**
 * Geographic utilities and map bounds for the SVG map.
 * Pre-projected coordinates are stored in beijing-osm.json,
 * but we still need this for marker positions.
 */

/** 地图底图的地理边界（与 SVG viewBox 0-1000, 0-1000 对应） */
export const MAP_BOUNDS = {
  west: 116.0396,
  east: 116.7430,
  south: 39.6359,
  north: 40.1755,
};

const { west, east, south, north } = MAP_BOUNDS;
const dw = east - west;
const dh = north - south;

/** Convert lat/lng to SVG x/y using equirectangular projection matching MAP_BOUNDS */
export function projectToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - west) / dw) * 1000;
  const y = ((north - lat) / dh) * 1000;
  return { x, y };
}
