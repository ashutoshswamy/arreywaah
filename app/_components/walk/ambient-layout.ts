import type { WorldPoint } from "./stations";

// Coordinates include the entire moving model, not just its origin. +x east, +z south.
export const AMBIENT_LAYOUT = {
  road: { x: 37, minZ: -83, maxZ: 83, lanes: [36, 38] },
  railway: {
    lanes: [43, 48],
    minZ: -126,
    maxZ: 126,
    westFence: 40.4,
    eastFence: 51,
  },
  pedestrians: [
    { minX: 7.5, maxX: 12, z: 18.6, phase: 0.4, period: 18, color: "#27c2b0" },
    { minX: -7, maxX: -3.5, z: 18.6, phase: 2.1, period: 21, color: "#e8336d" },
    { minX: 29.8, maxX: 33, z: 18.6, phase: 1.2, period: 17, color: "#dba64c" },
  ],
} as const;

export const PEDESTRIAN_RESERVATIONS = AMBIENT_LAYOUT.pedestrians.map(
  (path) => ({
    x: (path.minX + path.maxX) / 2,
    z: path.z,
    width: path.maxX - path.minX + 2.6,
    depth: 2.6,
  }),
);

export function outsideAmbientDomains(point: WorldPoint) {
  // Player envelope stays west of the traffic and north of the southern road.
  return point.x <= 34.2 && point.z <= 19 && point.z >= -3.8;
}
