import type { StationId } from "./stations";

export const DISCOVERIES = [
  {
    id: "chai",
    name: "Chai",
    x: -19,
    z: 4.3,
    prompt: "Have a chai",
    message: "Chai collected. Now you’re ready for the creative street.",
  },
  {
    id: "music",
    name: "Music",
    x: -12,
    z: 4.3,
    prompt: "Pick up the record",
    message:
      "Music discovered. We make music videos and promotional tracks, and support new voices through music hunts.",
  },
  {
    id: "film",
    name: "Film",
    x: -4.5,
    z: 4.3,
    prompt: "Pick up the clapperboard",
    message:
      "Film discovered. Music videos, TVC ads, trailers and brand films, from idea to final cut.",
  },
  {
    id: "brand",
    name: "Brand",
    x: 3,
    z: 4.3,
    prompt: "Find the brand idea",
    message:
      "Brand discovered. Strategy and digital content sit alongside production at Arrey Waah.",
  },
  {
    id: "art",
    name: "Art",
    x: 10.5,
    z: 4.3,
    prompt: "Pick up the palette",
    message:
      "Art discovered. Waah Art creates portraits and artwork alongside the film work.",
  },
] as const;

export type DiscoveryId = (typeof DISCOVERIES)[number]["id"];
export type NearbyId = DiscoveryId | "office" | null;
export type GameSnapshot = {
  discovered: DiscoveryId[];
  nearby: NearbyId;
  prompt: string;
  message: string;
  automatic: boolean;
};
export type JourneyController = {
  move: (x: number, y: number, running?: boolean) => void;
  walkTo: (clientX: number, clientY: number) => void;
  autoWalk: (enabled: boolean) => void;
  interact: () => void;
  jump: () => void;
  zoom: (delta: number) => void;
  startAt: (station: StationId) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  dispose: () => void;
};
export type JourneyOptions = {
  onSnapshot: (snapshot: GameSnapshot) => void;
  onPosition: (x: number, z: number) => void;
  onArrive: () => void;
  onDiscovery: (id: DiscoveryId) => void;
  onError: () => void;
};
