export type StationId = "parel" | "prabhadevi";
export type WorldPoint = { x: number; z: number };

export const OFFICE_POINT: WorldPoint = { x: 24, z: -3.6 };

/** Fictional relative neighbourhood layout, not navigation or pedestrian directions. */
export const STATIONS = [
  {
    id: "parel",
    name: "Parel",
    subtitle: "The closest starting point",
    description:
      "Begin near Parel and take the short, approximate corridor toward the office. This fictional neighbourhood is relative to the shared reference, not navigation or a verified pedestrian route.",
    x: 31,
    z: 12,
    route: [
      { x: 31, z: 12 },
      { x: 29, z: 9 },
      { x: 27, z: 5 },
      { x: 25, z: 0 },
      OFFICE_POINT,
    ],
  },
  {
    id: "prabhadevi",
    name: "Prabhadevi",
    subtitle: "A walk in from the west",
    description:
      "Start near Prabhadevi and walk through the southern approach to the office. The illustrated route is a fictional relative neighbourhood layout, not navigation or live map guidance.",
    x: 18,
    z: 17,
    route: [
      { x: 18, z: 17 },
      { x: 18, z: 13 },
      { x: 19, z: 9 },
      { x: 20, z: 5 },
      { x: 22, z: 1 },
      OFFICE_POINT,
    ],
  },
] as const satisfies readonly {
  id: StationId;
  name: string;
  subtitle: string;
  description: string;
  x: number;
  z: number;
  route: readonly WorldPoint[];
}[];

export function getStation(id: StationId) {
  return STATIONS.find((station) => station.id === id)!;
}
