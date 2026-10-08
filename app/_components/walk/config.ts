// Shared constants for the station-to-office walk.
// Horizontal values are "world units": the SVG design space, which is 600 units tall.

export const WORLD_W = 4700;
export const VIEW_H = 600;
/** The scene is scaled so at least this many world units fit across the screen. */
export const MIN_VIEW_W = 520;

/** Pavement top edge, and the line the character's feet stand on. */
export const PAVEMENT_Y = 520;
export const FEET_Y = 566;

/** Character size in world units. */
export const CHAR_W = 74;
export const CHAR_H = 132;

export const START_X = 560;
export const MIN_X = 150;
export const DOOR_X = 4325;
/** The door starts sliding open when the character is this close. */
export const DOOR_OPEN_RANGE = 260;

export const WALK_SPEED = 250;
export const RUN_SPEED = 400;
export const AUTO_SPEED = 300;

/** Parallax factors, relative to the world layer (1.0). */
export const PARALLAX = {
  sky: 0.03,
  far: 0.12,
  mid: 0.35,
  fore: 1.28,
} as const;

export const LAYER_W = {
  sky: 1800,
  far: 2400,
  mid: 3400,
  world: WORLD_W,
  fore: 6400,
} as const;

/** Caption shown while the character is at or beyond `from`. */
export const CAPTIONS = [
  { from: 0, text: "Arrey Waah Road station. The office is a short walk east." },
  { from: 1380, text: "Music: videos, promo tracks, music hunts." },
  { from: 1850, text: "Films, trailers and TVC ads." },
  { from: 2260, text: "Chai first. The ideas come after." },
  { from: 2520, text: "Brand strategy, before a single frame is shot." },
  { from: 2960, text: "Digital content, made for every screen." },
  { from: 3400, text: "Waah Art: portraits and artwork." },
  { from: 3980, text: "That's the office. Keep walking." },
] as const;
