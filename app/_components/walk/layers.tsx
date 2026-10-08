import type { ReactNode } from "react";
import { DOOR_X, LAYER_W, PAVEMENT_Y, VIEW_H, WORLD_W } from "./config";

/* Palette: Indian dusk. Indigo ink, marigold, gulal pink, a little teal. */
const INK = "#17123F";
const MARIGOLD = "#FFB81C";
const GULAL = "#E8336D";
const TEAL = "#27C2B0";
const WARM = "#FFD27A";
const PAVE = "#2A2058";

const DISPLAY = "var(--font-yatra), 'Noto Sans Devanagari', sans-serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

/** Small deterministic PRNG so server and client render identical scenery. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function Layer({ w, children }: { w: number; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${w} ${VIEW_H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMinYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Shared gradients (ids are document-global, so they carry an aw- prefix) */
/* ------------------------------------------------------------------ */

export function SharedDefs() {
  return (
    <svg
      width="0"
      height="0"
      className="absolute"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="aw-glow">
          <stop offset="0" stopColor={WARM} stopOpacity="0.55" />
          <stop offset="1" stopColor={WARM} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aw-spill" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={WARM} stopOpacity="0.5" />
          <stop offset="1" stopColor={WARM} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aw-sun">
          <stop offset="0" stopColor="#FFE3A3" stopOpacity="1" />
          <stop offset="0.45" stopColor="#FFB05A" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FF7A59" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="aw-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE2A0" />
          <stop offset="1" stopColor="#FFB45E" />
        </linearGradient>
        <linearGradient id="aw-interior" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF1C9" />
          <stop offset="1" stopColor="#FFC868" />
        </linearGradient>
        <linearGradient id="aw-office" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B2270" />
          <stop offset="1" stopColor="#1B1550" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sky                                                                  */
/* ------------------------------------------------------------------ */

export function SkyLayer() {
  const r = rng(7);
  const stars = Array.from({ length: 70 }, (_, i) => ({
    i,
    x: r() * LAYER_W.sky,
    y: r() * 300,
    s: 0.8 + r() * 1.4,
    o: 0.35 + r() * 0.65,
  }));
  return (
    <Layer w={LAYER_W.sky}>
      {stars.map((s) => (
        <circle
          key={s.i}
          cx={s.x}
          cy={s.y}
          r={s.s}
          fill="#FFF4D6"
          opacity={s.o}
        />
      ))}
      <circle cx={1150} cy={430} r={260} fill="url(#aw-sun)" />
      <ellipse
        cx={500}
        cy={250}
        rx={170}
        ry={14}
        fill="#FF8E72"
        opacity={0.28}
      />
      <ellipse
        cx={640}
        cy={272}
        rx={120}
        ry={9}
        fill="#FF8E72"
        opacity={0.22}
      />
      <ellipse
        cx={1500}
        cy={210}
        rx={210}
        ry={16}
        fill="#FFB27A"
        opacity={0.2}
      />
    </Layer>
  );
}

/* ------------------------------------------------------------------ */
/* Skylines                                                             */
/* ------------------------------------------------------------------ */

export function FarLayer() {
  const r = rng(21);
  const blocks: ReactNode[] = [];
  let x = -20;
  let i = 0;
  while (x < LAYER_W.far) {
    const w = 46 + r() * 70;
    const h = 130 + r() * 190;
    blocks.push(
      <rect
        key={`b${i}`}
        x={x}
        y={540 - h}
        width={w}
        height={h + 10}
        fill="#2F2468"
      />,
    );
    if (r() > 0.7) {
      blocks.push(
        <rect
          key={`t${i}`}
          x={x + w * 0.3}
          y={540 - h - 16}
          width={w * 0.4}
          height={16}
          fill="#2F2468"
        />,
      );
    }
    x += w + (r() > 0.6 ? 6 : 0);
    i++;
  }
  return (
    <Layer w={LAYER_W.far}>
      <rect x={0} y={520} width={LAYER_W.far} height={80} fill="#2F2468" />
      {blocks}
    </Layer>
  );
}

export function MidLayer() {
  const r = rng(99);
  const nodes: ReactNode[] = [];
  let x = -20;
  let i = 0;
  while (x < LAYER_W.mid) {
    const w = 70 + r() * 80;
    const h = 150 + r() * 170;
    const top = 540 - h;
    nodes.push(
      <rect
        key={`b${i}`}
        x={x}
        y={top}
        width={w}
        height={h + 10}
        fill={i % 3 === 0 ? "#271D5C" : "#221955"}
      />,
    );
    if (r() > 0.65) {
      // rooftop water tank, a very Indian skyline detail
      nodes.push(
        <g key={`wt${i}`} fill="#1C1448">
          <rect
            x={x + w * 0.25}
            y={top - 22}
            width={w * 0.34}
            height={22}
            rx={3}
          />
          <rect x={x + w * 0.3} y={top - 8} width={3} height={8} />
          <rect x={x + w * 0.5} y={top - 8} width={3} height={8} />
        </g>,
      );
    }
    const cols = Math.max(2, Math.floor((w - 14) / 18));
    const rows = Math.floor((h - 24) / 24);
    for (let ry = 0; ry < rows; ry++) {
      for (let cx = 0; cx < cols; cx++) {
        if (r() > 0.78) {
          nodes.push(
            <rect
              key={`w${i}-${ry}-${cx}`}
              x={x + 9 + cx * 18}
              y={top + 14 + ry * 24}
              width={9}
              height={12}
              fill={WARM}
              opacity={0.55 + r() * 0.4}
            />,
          );
        }
      }
    }
    x += w + 4;
    i++;
  }
  return (
    <Layer w={LAYER_W.mid}>
      <rect x={0} y={510} width={LAYER_W.mid} height={90} fill="#221955" />
      {nodes}
    </Layer>
  );
}

/* ------------------------------------------------------------------ */
/* Foreground: overhead wires with bunting                              */
/* ------------------------------------------------------------------ */

export function ForeLayer() {
  const seg = 400;
  const count = Math.ceil(LAYER_W.fore / seg);
  const wires: ReactNode[] = [];
  const flags: ReactNode[] = [];
  const colors = [MARIGOLD, GULAL, TEAL, "#FFF4D6"];
  for (let s = 0; s < count; s++) {
    const x0 = s * seg;
    const y0 = 14;
    const yc = 120;
    wires.push(
      <path
        key={`w${s}`}
        d={`M${x0} ${y0} Q${x0 + seg / 2} ${yc} ${x0 + seg} ${y0}`}
        fill="none"
        stroke="#0B0826"
        strokeWidth={2}
      />,
    );
    for (let k = 1; k < 10; k++) {
      const t = k / 10;
      const px = x0 + t * seg;
      const py = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * yc + t * t * y0;
      const c = colors[(s * 3 + k) % colors.length];
      flags.push(
        <path
          key={`f${s}-${k}`}
          d={`M${px - 7} ${py} L${px + 7} ${py} L${px} ${py + 20} Z`}
          fill={c}
          opacity={0.92}
        />,
      );
    }
  }
  return (
    <Layer w={LAYER_W.fore}>
      {wires}
      {flags}
    </Layer>
  );
}

/* ------------------------------------------------------------------ */
/* World: station, street, shops, office                                */
/* ------------------------------------------------------------------ */

function LampPost({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <circle cx={0} cy={PAVEMENT_Y - 236} r={150} fill="url(#aw-glow)" />
      <rect
        x={-3.5}
        y={PAVEMENT_Y - 230}
        width={7}
        height={230}
        fill="#0F0B2E"
      />
      <rect
        x={-9}
        y={PAVEMENT_Y - 8}
        width={18}
        height={8}
        rx={2}
        fill="#0F0B2E"
      />
      <path
        d={`M0 ${PAVEMENT_Y - 228} q0 -18 22 -18`}
        stroke="#0F0B2E"
        strokeWidth={5}
        fill="none"
      />
      <rect
        x={14}
        y={PAVEMENT_Y - 246}
        width={26}
        height={9}
        rx={4}
        fill="#0F0B2E"
      />
      <rect
        x={17}
        y={PAVEMENT_Y - 238}
        width={20}
        height={4}
        rx={2}
        fill={WARM}
      />
      <ellipse
        cx={27}
        cy={PAVEMENT_Y + 22}
        rx={60}
        ry={10}
        fill="url(#aw-spill)"
      />
    </g>
  );
}

function Tree({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${PAVEMENT_Y}) scale(${s})`}>
      <rect x={-6} y={-120} width={12} height={120} fill="#241A54" />
      <circle cx={0} cy={-170} r={64} fill="#17594F" />
      <circle cx={-48} cy={-136} r={44} fill="#1B6657" />
      <circle cx={50} cy={-140} r={46} fill="#17594F" />
      <circle cx={8} cy={-208} r={40} fill="#1B6657" />
      {[
        [-30, -190],
        [24, -214],
        [44, -150],
        [-60, -140],
        [0, -150],
        [18, -176],
      ].map(([bx, by], i) => (
        <circle
          key={i}
          cx={bx}
          cy={by}
          r={4.5}
          fill={i % 2 ? MARIGOLD : GULAL}
        />
      ))}
    </g>
  );
}

type ShopProps = {
  x: number;
  w?: number;
  body: string;
  accent: string;
  sign: string;
  children: ReactNode;
};

function Shop({ x, w = 300, body, accent, sign, children }: ShopProps) {
  const top = 272;
  const stripes = Math.floor(w / 25);
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={0} y={top} width={w} height={PAVEMENT_Y - top} fill={body} />
      <rect x={-8} y={top - 14} width={w + 16} height={16} fill="#0F0B2E" />
      {/* upper floor windows */}
      <rect
        x={30}
        y={top + 14}
        width={36}
        height={30}
        fill="#0F0B2E"
        opacity={0.55}
      />
      <rect
        x={w - 66}
        y={top + 14}
        width={36}
        height={30}
        fill="#0F0B2E"
        opacity={0.55}
      />
      {/* sign board */}
      <rect
        x={18}
        y={top + 52}
        width={w - 36}
        height={52}
        rx={6}
        fill={accent}
      />
      <rect
        x={18}
        y={top + 52}
        width={w - 36}
        height={52}
        rx={6}
        fill="none"
        stroke="#0F0B2E"
        strokeOpacity={0.35}
        strokeWidth={2}
      />
      <text
        x={w / 2}
        y={top + 88}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontSize={27}
        fill={INK}
        letterSpacing={1}
      >
        {sign}
      </text>
      {/* awning */}
      {Array.from({ length: stripes }, (_, i) => (
        <rect
          key={i}
          x={i * (w / stripes)}
          y={top + 112}
          width={w / stripes + 0.5}
          height={28}
          fill={i % 2 ? "#FFF4D6" : accent}
        />
      ))}
      {Array.from({ length: stripes }, (_, i) => (
        <circle
          key={i}
          cx={i * (w / stripes) + w / stripes / 2}
          cy={top + 140}
          r={w / stripes / 2}
          fill={i % 2 ? "#FFF4D6" : accent}
        />
      ))}
      {/* shop window */}
      <rect
        x={22}
        y={top + 164}
        width={w - 104}
        height={PAVEMENT_Y - top - 164 - 14}
        fill="url(#aw-window)"
      />
      <rect
        x={22}
        y={top + 164}
        width={w - 104}
        height={PAVEMENT_Y - top - 164 - 14}
        fill="none"
        stroke="#0F0B2E"
        strokeWidth={5}
      />
      {children}
      <rect
        x={14}
        y={PAVEMENT_Y - 14}
        width={w - 88}
        height={14}
        fill="#0F0B2E"
        opacity={0.7}
      />
      {/* door */}
      <rect
        x={w - 70}
        y={top + 156}
        width={50}
        height={PAVEMENT_Y - top - 156}
        fill="#0F0B2E"
      />
      <rect
        x={w - 64}
        y={top + 164}
        width={38}
        height={PAVEMENT_Y - top - 164}
        fill="url(#aw-window)"
        opacity={0.85}
      />
      <circle cx={w - 34} cy={top + 214} r={2.5} fill="#0F0B2E" />
      {/* light spilling onto the pavement */}
      <ellipse
        cx={w / 2 - 20}
        cy={PAVEMENT_Y + 26}
        rx={w * 0.45}
        ry={12}
        fill="url(#aw-spill)"
      />
    </g>
  );
}

/* Window glyphs: centred around the window's middle. */
const GLYPH_Y = 272 + 164 + 36;

function MusicGlyph({ cx }: { cx: number }) {
  return (
    <g transform={`translate(${cx} ${GLYPH_Y})`}>
      <circle r={30} fill="#0F0B2E" />
      <circle r={22} fill="none" stroke="#3A2E80" strokeWidth={1.5} />
      <circle r={12} fill={GULAL} />
      <circle r={2.5} fill="#0F0B2E" />
      <path
        d="M34 -26 L8 -4"
        stroke="#0F0B2E"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M-62 14 v-34 l22 -6 v34"
        fill="none"
        stroke="#0F0B2E"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <circle cx={-62} cy={16} r={7} fill="#0F0B2E" />
      <circle cx={-40} cy={10} r={7} fill="#0F0B2E" />
    </g>
  );
}

function FilmGlyph({ cx }: { cx: number }) {
  return (
    <g transform={`translate(${cx} ${GLYPH_Y})`}>
      <rect x={-34} y={-12} width={68} height={42} rx={3} fill="#0F0B2E" />
      <g transform="rotate(-12 -34 -12)">
        <rect x={-34} y={-30} width={68} height={16} rx={2} fill="#0F0B2E" />
        {[-26, -10, 6, 22].map((sx) => (
          <path
            key={sx}
            d={`M${sx} -30 l10 0 l-8 16 l-10 0 z`}
            fill="#FFF4D6"
          />
        ))}
      </g>
      <rect x={-26} y={2} width={52} height={3} fill={MARIGOLD} />
      <rect
        x={-26}
        y={11}
        width={34}
        height={3}
        fill={MARIGOLD}
        opacity={0.6}
      />
    </g>
  );
}

function BrandGlyph({ cx }: { cx: number }) {
  return (
    <g transform={`translate(${cx} ${GLYPH_Y})`}>
      <circle cx={-44} cy={0} r={20} fill={GULAL} />
      <rect x={-18} y={-20} width={40} height={40} rx={4} fill="#0F0B2E" />
      <path
        d="M62 20 L40 -22 L84 -22 Z"
        transform="translate(-4 0)"
        fill={TEAL}
      />
      <circle cx={2} cy={0} r={8} fill={MARIGOLD} />
    </g>
  );
}

function DigitalGlyph({ cx }: { cx: number }) {
  return (
    <g transform={`translate(${cx} ${GLYPH_Y})`}>
      <rect x={-70} y={-26} width={78} height={52} rx={4} fill="#0F0B2E" />
      <path d="M-40 -12 l24 12 l-24 12 z" fill={MARIGOLD} />
      <rect x={20} y={-34} width={30} height={64} rx={6} fill="#0F0B2E" />
      <rect x={25} y={-26} width={20} height={36} rx={2} fill={TEAL} />
      <circle cx={35} cy={20} r={3} fill="#FFF4D6" />
    </g>
  );
}

function ArtGlyph({ cx }: { cx: number }) {
  return (
    <g transform={`translate(${cx} ${GLYPH_Y})`}>
      <rect x={-56} y={-32} width={52} height={64} fill="#0F0B2E" />
      <rect x={-51} y={-27} width={42} height={54} fill={GULAL} />
      <circle cx={-30} cy={-8} r={9} fill="#0F0B2E" />
      <path d="M-46 27 q16 -34 32 0 z" fill="#0F0B2E" />
      <rect x={12} y={-22} width={44} height={54} fill="#0F0B2E" />
      <rect x={17} y={-17} width={34} height={44} fill={TEAL} />
      <circle cx={34} cy={-2} r={7} fill="#0F0B2E" />
      <path d="M21 27 q13 -26 26 0 z" fill="#0F0B2E" />
    </g>
  );
}

function ChaiStall({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* string lights */}
      <path
        d="M-10 300 Q110 350 230 300"
        stroke="#0F0B2E"
        strokeWidth={2}
        fill="none"
      />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const t = (i + 0.5) / 7;
        const px = -10 + t * 240;
        const py =
          (1 - t) * (1 - t) * 300 + 2 * t * (1 - t) * 350 + t * t * 300;
        return (
          <g key={i}>
            <circle cx={px} cy={py + 8} r={22} fill="url(#aw-glow)" />
            <circle cx={px} cy={py + 6} r={4} fill={i % 2 ? MARIGOLD : WARM} />
          </g>
        );
      })}
      {/* poles + tarp roof */}
      <rect x={0} y={330} width={6} height={190} fill="#0F0B2E" />
      <rect x={210} y={330} width={6} height={190} fill="#0F0B2E" />
      <path d="M-18 336 L108 304 L234 336 Z" fill={GULAL} />
      <path d="M-18 336 L234 336 L234 348 L-18 348 Z" fill="#B3224F" />
      {/* counter */}
      <rect x={14} y={450} width={188} height={70} fill="#3B2C86" />
      <rect x={10} y={444} width={196} height={10} fill="#0F0B2E" />
      <text
        x={108}
        y={494}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontSize={30}
        fill={MARIGOLD}
      >
        चाय
      </text>
      {/* stove + kettle */}
      <rect x={34} y={430} width={52} height={14} fill="#0F0B2E" />
      <path d="M40 430 q-4 -34 20 -34 q24 0 20 34 z" fill="#C9CCE8" />
      <path
        d="M78 410 q18 -4 24 -22"
        stroke="#C9CCE8"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <rect x={52} y={388} width={16} height={8} rx={3} fill="#9EA2CC" />
      <g
        className="aw-steam"
        fill="none"
        stroke="#FFF4D6"
        strokeWidth={3}
        strokeLinecap="round"
      >
        <path className="aw-steam-1" d="M104 380 q-8 -12 0 -22 q8 -10 0 -22" />
        <path className="aw-steam-2" d="M96 382 q-8 -12 0 -22 q8 -10 0 -22" />
      </g>
      {/* glasses */}
      {[130, 148, 166].map((gx) => (
        <g key={gx}>
          <rect
            x={gx}
            y={424}
            width={11}
            height={20}
            rx={2}
            fill="#FFF4D6"
            opacity={0.85}
          />
          <rect x={gx} y={432} width={11} height={12} rx={2} fill="#C97A2B" />
        </g>
      ))}
      {/* stools */}
      <rect x={-34} y={488} width={30} height={8} rx={3} fill={MARIGOLD} />
      <rect x={-28} y={496} width={4} height={24} fill="#0F0B2E" />
      <rect x={-14} y={496} width={4} height={24} fill="#0F0B2E" />
      <ellipse
        cx={108}
        cy={PAVEMENT_Y + 24}
        rx={130}
        ry={12}
        fill="url(#aw-spill)"
      />
    </g>
  );
}

function AutoRickshaw({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* canopy */}
      <path d="M20 400 Q70 372 130 394 L134 410 L16 412 Z" fill="#0F0B2E" />
      <path
        d="M24 408 L24 450 M128 408 L128 440"
        stroke="#0F0B2E"
        strokeWidth={5}
      />
      {/* body */}
      <path
        d="M8 470 L12 436 Q60 424 126 440 L150 470 L156 500 L8 500 Z"
        fill={MARIGOLD}
      />
      <rect x={8} y={470} width={148} height={30} fill="#0F0B2E" />
      <rect
        x={34}
        y={444}
        width={48}
        height={22}
        rx={3}
        fill={INK}
        opacity={0.85}
      />
      <path d="M126 440 L150 470 L132 470 Z" fill="#FFF4D6" opacity={0.7} />
      {/* wheels */}
      <circle cx={34} cy={PAVEMENT_Y - 14} r={17} fill="#0F0B2E" />
      <circle cx={34} cy={PAVEMENT_Y - 14} r={7} fill="#5A5F9E" />
      <circle cx={128} cy={PAVEMENT_Y - 14} r={17} fill="#0F0B2E" />
      <circle cx={128} cy={PAVEMENT_Y - 14} r={7} fill="#5A5F9E" />
      <circle cx={156} cy={486} r={6} fill={WARM} />
      <circle cx={156} cy={486} r={26} fill="url(#aw-glow)" />
    </g>
  );
}

function Train() {
  const doors = [90, 330, 570];
  const windows: ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const wx = 40 + i * 60;
    if (doors.some((d) => wx > d - 40 && wx < d + 50)) continue;
    windows.push(
      <rect
        key={i}
        x={wx}
        y={342}
        width={42}
        height={56}
        rx={4}
        fill="url(#aw-window)"
      />,
    );
  }
  return (
    <g className="aw-train">
      <rect x={20} y={320} width={740} height={176} rx={14} fill="#E9E4F5" />
      <rect x={20} y={410} width={740} height={26} fill={GULAL} />
      <rect x={20} y={436} width={740} height={8} fill={MARIGOLD} />
      <rect x={20} y={320} width={740} height={10} rx={5} fill="#BDB6DC" />
      {windows}
      {doors.map((d) => (
        <g key={d}>
          <rect x={d - 20} y={340} width={64} height={146} fill="#2A2058" />
          <rect
            x={d - 14}
            y={346}
            width={24}
            height={134}
            fill="url(#aw-window)"
          />
          <rect
            x={d + 14}
            y={346}
            width={24}
            height={134}
            fill="url(#aw-window)"
          />
        </g>
      ))}
      {/* bogies */}
      {[80, 280, 480, 680].map((bx) => (
        <g key={bx}>
          <rect x={bx} y={490} width={70} height={14} fill="#0F0B2E" />
          <circle cx={bx + 14} cy={502} r={10} fill="#0F0B2E" />
          <circle cx={bx + 56} cy={502} r={10} fill="#0F0B2E" />
        </g>
      ))}
      {/* roof pantograph */}
      <path
        d="M380 320 l16 -26 l16 26"
        stroke="#0F0B2E"
        strokeWidth={4}
        fill="none"
      />
      <path d="M340 294 h112" stroke="#0F0B2E" strokeWidth={4} />
      <text
        x={400}
        y={428}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={11}
        fill="#FFF4D6"
        letterSpacing={3}
      >
        LOCAL · FAST
      </text>
    </g>
  );
}

function Station() {
  const postXs = [250, 620, 990, 1170];
  return (
    <g>
      {/* rails behind the platform */}
      <rect x={0} y={498} width={1300} height={22} fill="#1A1448" />
      <rect x={0} y={506} width={1300} height={3} fill="#4A3C8F" />
      <Train />
      {/* platform front + safety line */}
      <rect x={0} y={PAVEMENT_Y} width={1300} height={10} fill="#3A2E80" />
      <rect x={0} y={PAVEMENT_Y + 12} width={1300} height={5} fill={MARIGOLD} />
      {/* canopy */}
      {postXs.map((px) => (
        <rect
          key={px}
          x={px - 5}
          y={266}
          width={10}
          height={PAVEMENT_Y - 266}
          fill="#0F0B2E"
        />
      ))}
      <path d="M110 262 L1300 262 L1300 232 L150 232 Z" fill="#0F0B2E" />
      <rect x={110} y={262} width={1190} height={6} fill="#3A2E80" />
      {[200, 520, 840, 1160].map((lx) => (
        <g key={lx}>
          <rect x={lx - 16} y={270} width={32} height={6} rx={3} fill={WARM} />
          <ellipse
            cx={lx}
            cy={PAVEMENT_Y + 22}
            rx={110}
            ry={10}
            fill="url(#aw-spill)"
          />
        </g>
      ))}
      {/* station name board */}
      <rect x={560} y={268} width={3} height={18} fill="#0F0B2E" />
      <rect x={680} y={268} width={3} height={18} fill="#0F0B2E" />
      <rect x={470} y={284} width={310} height={78} rx={4} fill={MARIGOLD} />
      <rect
        x={476}
        y={290}
        width={298}
        height={66}
        rx={2}
        fill="none"
        stroke={INK}
        strokeWidth={2}
      />
      <text
        x={625}
        y={324}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontSize={32}
        fill={INK}
        letterSpacing={2}
      >
        ARREY WAAH ROAD
      </text>
      <text
        x={625}
        y={348}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontSize={17}
        fill={INK}
      >
        अरे वाह रोड
      </text>
      {/* clock */}
      <rect x={338} y={268} width={3} height={22} fill="#0F0B2E" />
      <circle
        cx={340}
        cy={316}
        r={26}
        fill="#FFF4D6"
        stroke="#0F0B2E"
        strokeWidth={5}
      />
      <path
        d="M340 316 V300 M340 316 L352 322"
        stroke="#0F0B2E"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* exit sign */}
      <rect x={1048} y={268} width={3} height={18} fill="#0F0B2E" />
      <rect x={1160} y={268} width={3} height={18} fill="#0F0B2E" />
      <rect x={1010} y={284} width={190} height={46} rx={4} fill={TEAL} />
      <text
        x={1090}
        y={316}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontSize={24}
        fill={INK}
        letterSpacing={2}
      >
        EXIT
      </text>
      <path
        d="M1148 307 h30 m-9 -9 l9 9 l-9 9"
        stroke={INK}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* bench */}
      <g>
        <rect x={832} y={478} width={150} height={9} rx={3} fill={MARIGOLD} />
        <rect x={832} y={456} width={150} height={9} rx={3} fill={MARIGOLD} />
        <rect x={840} y={487} width={6} height={33} fill="#0F0B2E" />
        <rect x={968} y={487} width={6} height={33} fill="#0F0B2E" />
        <rect x={840} y={456} width={6} height={32} fill="#0F0B2E" />
        <rect x={968} y={456} width={6} height={32} fill="#0F0B2E" />
      </g>
      {/* waiting commuter, back turned */}
      <g transform="translate(915 0)" fill="#0F0B2E">
        <circle cx={0} cy={424} r={9} />
        <rect x={-11} y={434} width={22} height={50} rx={9} />
        <rect x={-8} y={480} width={16} height={4} />
      </g>
    </g>
  );
}

function Office() {
  const x0 = 4000;
  const w = 650;
  const rows = [150, 215, 280];
  const cols = [0, 1, 2, 3, 4, 5, 6, 7];
  const r = rng(5);
  return (
    <g>
      {/* roof details */}
      <rect x={x0 + 70} y={96} width={4} height={40} fill="#0F0B2E" />
      <circle cx={x0 + 72} cy={92} r={5} fill={GULAL} />
      <rect x={x0 + 500} y={108} width={70} height={30} fill="#0F0B2E" />
      {/* tower */}
      <rect
        x={x0}
        y={134}
        width={w}
        height={PAVEMENT_Y - 134}
        fill="url(#aw-office)"
      />
      <rect x={x0 - 10} y={124} width={w + 20} height={14} fill="#0F0B2E" />
      {/* sign: neon outline with a wide soft glow underneath */}
      <rect
        x={x0 + 70}
        y={148}
        width={w - 140}
        height={78}
        rx={8}
        fill="#0F0B2E"
        opacity={0.55}
      />
      <text
        x={x0 + w / 2}
        y={202}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontSize={62}
        letterSpacing={3}
        fill="none"
        stroke={MARIGOLD}
        strokeOpacity={0.28}
        strokeWidth={12}
      >
        ARREY WAAH
      </text>
      <text
        x={x0 + w / 2}
        y={202}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontSize={62}
        letterSpacing={3}
        fill={MARIGOLD}
      >
        ARREY WAAH
      </text>
      <text
        x={x0 + w / 2}
        y={222}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={11}
        letterSpacing={9}
        fill="#FFF4D6"
      >
        ENTERTAINMENT
      </text>
      {/* windows */}
      {rows.map((ry, ri) =>
        cols.map((c) => {
          const lit = r() > 0.35;
          const wx = x0 + 30 + c * 76;
          if (ri === 2 && c >= 3 && c <= 4) return null;
          return (
            <g key={`${ri}-${c}`}>
              <rect
                x={wx}
                y={ry + 90}
                width={52}
                height={44}
                rx={3}
                fill={lit ? "url(#aw-window)" : "#120E3A"}
                opacity={lit ? 0.9 : 1}
              />
              {lit && r() > 0.5 ? (
                <circle
                  cx={wx + 20}
                  cy={ry + 118}
                  r={6}
                  fill="#0F0B2E"
                  opacity={0.55}
                />
              ) : null}
            </g>
          );
        }),
      )}
      {/* entrance canopy */}
      <rect
        x={DOOR_X - 130}
        y={348}
        width={260}
        height={14}
        rx={3}
        fill={MARIGOLD}
      />
      {[-110, -55, 0, 55, 110].map((dx) => (
        <circle key={dx} cx={DOOR_X + dx} cy={368} r={3.5} fill={WARM} />
      ))}
      <ellipse
        cx={DOOR_X}
        cy={PAVEMENT_Y + 30}
        rx={210}
        ry={22}
        fill="url(#aw-spill)"
      />
      {/* door frame + lit interior */}
      <defs>
        <clipPath id="aw-door-clip">
          <rect x={DOOR_X - 80} y={384} width={160} height={PAVEMENT_Y - 384} />
        </clipPath>
      </defs>
      <rect
        x={DOOR_X - 88}
        y={376}
        width={176}
        height={PAVEMENT_Y - 376}
        fill="#0F0B2E"
      />
      <rect
        x={DOOR_X - 80}
        y={384}
        width={160}
        height={PAVEMENT_Y - 384}
        fill="url(#aw-interior)"
      />
      <g opacity={0.5} fill="#0F0B2E">
        <rect x={DOOR_X - 58} y={452} width={34} height={68} rx={4} />
        <rect x={DOOR_X + 24} y={440} width={30} height={80} rx={4} />
      </g>
      {/* sliding glass panels */}
      <g clipPath="url(#aw-door-clip)">
        <g className="aw-door aw-door-l">
          <rect
            x={DOOR_X - 80}
            y={384}
            width={80}
            height={PAVEMENT_Y - 384}
            fill="#7FD6E8"
            opacity={0.28}
          />
          <rect
            x={DOOR_X - 80}
            y={384}
            width={80}
            height={PAVEMENT_Y - 384}
            fill="none"
            stroke="#0F0B2E"
            strokeWidth={4}
          />
          <rect
            x={DOOR_X - 14}
            y={440}
            width={5}
            height={40}
            rx={2}
            fill="#0F0B2E"
          />
        </g>
        <g className="aw-door aw-door-r">
          <rect
            x={DOOR_X}
            y={384}
            width={80}
            height={PAVEMENT_Y - 384}
            fill="#7FD6E8"
            opacity={0.28}
          />
          <rect
            x={DOOR_X}
            y={384}
            width={80}
            height={PAVEMENT_Y - 384}
            fill="none"
            stroke="#0F0B2E"
            strokeWidth={4}
          />
          <rect
            x={DOOR_X + 9}
            y={440}
            width={5}
            height={40}
            rx={2}
            fill="#0F0B2E"
          />
        </g>
      </g>
      {/* WA AH banner */}
      <g transform={`translate(${x0 + 120} 0)`}>
        <rect x={0} y={384} width={70} height={136} rx={3} fill={GULAL} />
        <text
          x={35}
          y={440}
          textAnchor="middle"
          fontFamily={DISPLAY}
          fontSize={36}
          fill="#FFF4D6"
        >
          WA
        </text>
        <text
          x={35}
          y={484}
          textAnchor="middle"
          fontFamily={DISPLAY}
          fontSize={36}
          fill="#FFF4D6"
        >
          AH
        </text>
      </g>
      {/* potted plants */}
      {[DOOR_X - 130, DOOR_X + 130].map((px) => (
        <g key={px}>
          <rect
            x={px - 14}
            y={496}
            width={28}
            height={24}
            rx={3}
            fill="#0F0B2E"
          />
          <path
            d={`M${px} 496 q-30 -20 -22 -52 q16 18 22 52 q6 -34 24 -48 q6 30 -24 48`}
            fill="#17594F"
          />
        </g>
      ))}
      {/* neighbouring wall so the street ends cleanly */}
      <rect
        x={x0 + w}
        y={300}
        width={WORLD_W - (x0 + w)}
        height={PAVEMENT_Y - 300}
        fill="#221955"
      />
    </g>
  );
}

export function WorldLayer() {
  return (
    <Layer w={WORLD_W}>
      <rect
        x={0}
        y={PAVEMENT_Y}
        width={WORLD_W}
        height={VIEW_H - PAVEMENT_Y}
        fill={PAVE}
      />
      <rect x={0} y={PAVEMENT_Y} width={WORLD_W} height={5} fill="#4A3C8F" />
      {Array.from({ length: Math.floor(WORLD_W / 140) }, (_, i) => (
        <path
          key={i}
          d={`M${i * 140} ${PAVEMENT_Y + 6} l-18 ${VIEW_H - PAVEMENT_Y}`}
          stroke="#352A74"
          strokeWidth={2}
        />
      ))}

      <Station />

      <Tree x={1330} s={1.05} />
      <LampPost x={1280} />

      <Shop x={1440} body="#3B2C86" accent={MARIGOLD} sign="WAAH MUSIC">
        <MusicGlyph cx={138} />
      </Shop>
      <Shop x={1830} body="#2E2570" accent={GULAL} sign="FILMS & TVC">
        <FilmGlyph cx={120} />
      </Shop>
      <LampPost x={1760} />

      <ChaiStall x={2250} />
      <LampPost x={2560} />

      <Shop x={2600} body="#34288A" accent={TEAL} sign="BRAND STUDIO">
        <BrandGlyph cx={112} />
      </Shop>
      <Shop x={2990} body="#3B2C86" accent={MARIGOLD} sign="DIGITAL CONTENT">
        <DigitalGlyph cx={130} />
      </Shop>
      <LampPost x={2930} />
      <Shop x={3380} body="#2E2570" accent={GULAL} sign="WAAH ART">
        <ArtGlyph cx={120} />
      </Shop>
      <LampPost x={3320} />

      <AutoRickshaw x={3730} />
      <Tree x={3950} s={1.1} />

      <Office />
    </Layer>
  );
}
