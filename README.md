# Arrey Waah portfolio

A Next.js company portfolio with a full-screen, playable 3D Mumbai neighbourhood. Visitors choose Parel or Prabhadevi as a starting point before walking toward the office; the company content remains server-rendered behind the introduction.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. The scene needs JavaScript and WebGL. `next/font` downloads Google Fonts during development/build.

## Starting the walk

Choose **Parel** or **Prabhadevi**, then select **Start near …**. The 3D scene marks an approximate corridor from the selected station toward the office. **Follow corridor** walks that route automatically; movement controls remain available for free roaming and optional detours.

The station and office placements are relative to the user-supplied reference image. They are not a geospatial map, verified pedestrian directions, live traffic data or a source of walking-time estimates.

## Play controls

- **WASD / arrow keys:** freely roam the street in screen-relative directions, including diagonally.
- **Shift:** sprint. Touch visitors can toggle **Run**.
- **Space / Hop:** a small visual hop. This is not a physics-based obstacle-jumping game.
- **E / contextual action:** collect a nearby keepsake or walk into the office. Entry follows a collision-aware approach and continues through the open doors with the normal walking gait; the portfolio appears after the character reaches the interior.
- **Click / tap the ground:** walk there using an obstacle-aware route. Clicking a keepsake walks over and collects it; clicking the office beacon walks over and enters.
- **Drag:** steer in the drag direction; release to stop.
- **Scroll:** zoom the elevated camera in/out.
- **Directional pad:** hold touch buttons to walk.
- **Follow corridor:** follow the approximate route from the chosen station to the office entrance. The guide stops there; choose **Enter the office** to continue.
- **Help > Reset / replay:** restart the walk and restore the keepsakes.
- **Skip to site / Escape:** open the company portfolio at any time.
- Anchor URLs such as `/#work` bypass the introduction.

## Optional discoveries

Five geometric keepsakes sit near the storefronts: chai, a record, a clapperboard, a brand idea and an artist’s palette. Collecting one pauses movement and opens an accessible paper-style note with company information. Close it to continue walking; the checklist updates as discoveries are found. No discoveries are required to enter the office.

The neighbourhood is a stylized, approximate relative layout—not an accurate map of the company’s real office or surrounding pedestrian network. No map tiles or external navigation services are used.

## Design and accessibility

The neighbourhood uses continuous ground, distinct station shelters, separated street and sidewalk segments, and surrounding instanced buildings rather than a floating diorama. Two local trains run on fenced eastern tracks, six vehicles use separate road lanes, and three pedestrian NPCs have individual promenades. Their reserved swept footprints remain outside the visitor's movement domain. A close bird’s-eye camera follows the traveller; the compact HUD leaves the scenery visible edge to edge. GSAP animates discovery notes in the React UI; Three.js owns the world and character motion.

The interface follows the system light/dark preference. Reduced-motion mode keeps ambient actors static and disables hops, pickup bobbing, particles and limb animation; the camera uses instant zone cuts instead of continuous panning. Loading/WebGL errors offer retry, and skipping stays available.

The post-game interior is a new production-studio portfolio with silver/graphite system light/dark themes, vermilion actions, Figtree typography and the existing Yatra wordmark. A filterable project index lets visitors select real projects and read their credits; service disclosures, Waah Art, a typographic team roster, the studio story and Instagram contact retain the existing section anchors and company facts. Hero entrances begin only after the game completes (or is skipped); section reveals use IntersectionObserver and Web Animations with cleanup and a reduced-motion fallback. The mobile menu closes after selecting a section or pressing Escape.

**No images are currently used in the interior, as requested.** Old local collages have been removed, and old-site videos are no longer embedded. Nine deliberately empty media placements reserve their final aspect ratios: one hero photograph, one still for each of the six projects (displayed in a shared selected-project frame), one Waah Art image and one studio photograph. See `IMAGE-PLACEMENTS.md` for sizes, placement IDs and integration notes. These areas are labeled placeholders, not fabricated project imagery. The team has no stock portraits.

## Where to edit

- `app/_components/walk/world.ts`: geometry, storefronts, instanced surrounding scenery, traveller and keepsakes.
- `app/_components/walk/journey.ts`: rendering, elevated camera, collision regions, grid routing, animated office entry, collection, movement and cleanup.
- `app/_components/walk/ambient.ts`: train, vehicle and articulated pedestrian models and deterministic poses.
- `app/_components/walk/ambient-layout.ts`: separated traffic, railway and NPC movement domains.
- `app/_components/walk/gameplay.ts`: shared discovery positions, copy, game snapshots and controller contract.
- `app/_components/walk/stations.ts`: station starts, approximate route waypoints and honest route descriptions.
- `app/_components/walk/discovery-modal.tsx`: accessible paper-note modal and its GSAP lifecycle.
- `app/_components/walk/experience.tsx`: deferred loading, input, discovery checklist, game HUD and portfolio transition.
- `app/globals.css`: game/HUD styles and the active studio stylesheet import.
- `app/_data/content.ts`: company services, work, team and contact details. Blank email/phone values are not shown.
- `app/_components/site/`: redesigned server-rendered sections and scoped `studio.css`, with small client leaves for project selection, mobile navigation and post-game reveal motion.
- `app/_components/site/media-slot.tsx`: deliberately empty image frames, with explicit placement IDs.
- `IMAGE-PLACEMENTS.md`: the nine reserved image placements and recommended original asset dimensions.

No external models, texture services or game accounts are required. The earlier SVG scene files are not imported.

## Manual verification

```sh
npm run lint
npx tsc --noEmit
npm run build
```

No build, lint, tests, diagnostics or browser preview were run for this change, per the requested manual-verification workflow.
