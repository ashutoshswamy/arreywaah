# Arrey Waah portfolio

A Next.js company portfolio with a full-screen, playable 3D neighbourhood. The company content remains server-rendered behind the introduction.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. The scene needs JavaScript and WebGL. `next/font` downloads Google Fonts during development/build.

## Play controls

- **WASD / arrow keys:** freely roam the street in screen-relative directions, including diagonally.
- **Shift:** sprint. Touch visitors can toggle **Run**.
- **Space / Hop:** a small visual hop. This is not a physics-based obstacle-jumping game.
- **E / contextual action:** collect a nearby keepsake or enter the office.
- **Click / tap the ground:** walk there using an obstacle-aware route. Clicking a keepsake walks over and collects it; clicking the office beacon walks over and enters.
- **Drag:** steer in the drag direction; release to stop.
- **Scroll:** zoom the elevated camera in/out.
- **Directional pad:** hold touch buttons to walk.
- **Guide me:** find a route to the office entrance. The guide stops there; choose **Enter the office** to continue.
- **Help > Reset / replay:** restart the walk and restore the keepsakes.
- **Skip to site / Escape:** open the company portfolio at any time.
- Anchor URLs such as `/#work` bypass the introduction.

## Optional discoveries

Five geometric keepsakes sit near the storefronts: chai, a record, a clapperboard, a brand idea and an artist’s palette. Collecting one reveals a short piece of company information and updates the real discovery checklist. No discoveries are required to enter the office.

The walk is a fictional creative neighbourhood, not a map of the company's real office. Movement stays within the street and office approach, with collision bounds for nearby street furniture.

## Design and accessibility

The neighbourhood uses continuous ground and surrounding instanced buildings rather than a floating diorama. A close bird’s-eye camera follows the traveller; the compact HUD leaves the scenery visible edge to edge.

The interface follows the system light/dark preference. Reduced-motion mode disables hops, pickup bobbing, particles, train motion and limb animation; the camera uses instant zone cuts instead of continuous panning. Loading/WebGL errors offer retry, and skipping stays available.

## Where to edit

- `app/_components/walk/world.ts`: geometry, storefronts, instanced surrounding scenery, traveller and keepsakes.
- `app/_components/walk/journey.ts`: rendering, elevated camera, collision regions, grid routing, collection, movement and cleanup.
- `app/_components/walk/gameplay.ts`: shared discovery positions, copy, game snapshots and controller contract.
- `app/_components/walk/experience.tsx`: deferred loading, input, discovery checklist, game HUD and portfolio transition.
- `app/globals.css`: HUD and existing portfolio styles.
- `app/_data/content.ts`: company services, work, team and contact details. Blank email/phone values are not shown.
- `app/_components/site/`: server-rendered company sections.

No external models, texture services or game accounts are required. The earlier SVG scene files are not imported.

## Manual verification

```sh
npm run lint
npx tsc --noEmit
npm run build
```

No build, lint, tests, diagnostics or browser preview were run for this change, per the requested manual-verification workflow.
