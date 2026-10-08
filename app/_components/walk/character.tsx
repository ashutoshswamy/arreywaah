import { CHAR_H, CHAR_W } from "./config";

const SKIN = "#C98B5B";
const JACKET = "#E8336D";
const JACKET_DARK = "#B3224F";
const PANTS = "#4C58C8";
const PANTS_DARK = "#3A44A0";

/** Side-on traveller, facing right. Limbs are animated from CSS via [data-walking]. */
export function Character() {
  return (
    <svg
      viewBox={`0 0 ${CHAR_W} ${CHAR_H}`}
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      <ellipse cx={37} cy={128} rx={22} ry={4} fill="#0A0720" opacity={0.45} />
      <g className="aw-body">
        {/* back arm */}
        <g className="aw-arm aw-arm-b">
          <rect x={33} y={46} width={9} height={34} rx={4.5} fill={JACKET_DARK} />
          <circle cx={37.5} cy={82} r={4.5} fill={SKIN} />
        </g>
        {/* back leg */}
        <g className="aw-leg aw-leg-b">
          <rect x={31} y={78} width={12} height={40} rx={5} fill={PANTS_DARK} />
          <path d="M31 116 h16 q6 0 6 5 v3 h-22 z" fill="#CFCBEA" />
        </g>
        {/* backpack */}
        <rect x={14} y={42} width={20} height={36} rx={7} fill="#27C2B0" />
        <rect x={17} y={52} width={14} height={9} rx={3} fill="#1B8F82" />
        {/* torso */}
        <rect x={25} y={38} width={25} height={46} rx={11} fill={JACKET} />
        <rect x={25} y={74} width={25} height={6} fill="#FFB81C" />
        {/* head */}
        <rect x={34} y={30} width={7} height={9} fill={SKIN} />
        <circle cx={38} cy={21} r={14} fill={SKIN} />
        <path d="M24 20 q0 -16 15 -16 q13 0 14 12 q-8 -5 -16 -2 q-8 2 -9 12 q-3 -2 -4 -6 z" fill="#1B1340" />
        <circle cx={45} cy={22} r={1.8} fill="#1B1340" />
        <path d="M43 29 q4 1.5 7 -0.5" stroke="#8A4E2D" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        {/* front leg */}
        <g className="aw-leg aw-leg-f">
          <rect x={31} y={78} width={12} height={40} rx={5} fill={PANTS} />
          <path d="M31 116 h16 q6 0 6 5 v3 h-22 z" fill="#FFF4D6" />
        </g>
        {/* front arm */}
        <g className="aw-arm aw-arm-f">
          <rect x={33} y={46} width={9} height={34} rx={4.5} fill={JACKET} />
          <circle cx={37.5} cy={82} r={4.5} fill={SKIN} />
        </g>
      </g>
    </svg>
  );
}
