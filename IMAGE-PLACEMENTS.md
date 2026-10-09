# Reserved image placements

No images have been downloaded, generated or added to the redesigned interior. No old-site images or video embeds are used. The previous local collages have been removed.

The new layout intentionally reserves **nine image assets across four areas**. All spaces are visibly labeled, so there is no suggestion that placeholder artwork is company work. The project explorer uses one shared 16:9 frame; selecting a project changes the label and the future asset it will display.

## Asset list

| Area | Placement ID (`data-media-slot`) | What to supply | Recommended size |
| --- | --- | --- | --- |
| Hero | `hero` | An original cinematic production photograph or approved campaign image | 1600 × 2000 px (4:5) |
| Work: Ganu | `work-1` | An approved still from the promotional track | 1920 × 1080 px (16:9) |
| Work: Ganesha - The Vighnaharta | `work-2` | An approved music-video still | 1920 × 1080 px (16:9) |
| Work: A Winter Tale at Shimla | `work-3` | An approved trailer still | 1920 × 1080 px (16:9) |
| Work: Sawan Laaye | `work-4` | An approved music-video still | 1920 × 1080 px (16:9) |
| Work: G-Art Brand Launch Film | `work-5` | An approved launch-film still | 1920 × 1080 px (16:9) |
| Work: Garnet Diwali Meet | `work-6` | An approved event-film still | 1920 × 1080 px (16:9) |
| Waah Art | `waah-art` | Original artwork or a genuine photograph of the art-making process | 1600 × 2000 px (4:5) |
| About | `studio` | The actual studio or an original behind-the-scenes production photograph | 2400 × 1050 px (16:7) |

These are target dimensions, not mandatory exact pixels. Keep important faces, artwork and details away from crop edges. Prefer WebP or AVIF for final web assets and keep source originals separately.

## Where the spaces appear

- **Hero:** to the right of “Make them say waah.” on desktop; below the copy and buttons on mobile. Defined in `app/_components/site/hero.tsx`.
- **Work:** beside the selectable project index on desktop; below the horizontally browsable project selectors on mobile. Each project has its own slot ID, but only the selected project's space is visible. Defined in `app/_components/site/work-index.tsx`.
- **Waah Art:** a tall artwork space to the left of the art introduction on desktop; above it on mobile. Defined in `app/_components/site/sections.tsx`.
- **About:** a wide studio photograph space between the name story and company description. Defined in `app/_components/site/sections.tsx`.

The team is an intentional **text-only roster**, without fictional people, stock portraits or reserved headshot spaces.

## Adding images later

The shared `MediaSlot` component lives in `app/_components/site/media-slot.tsx`. Each call declares its placement ID, description and format. Replace the relevant placeholder with an approved local image while keeping the corresponding CSS frame and aspect ratio. For the project explorer, associate each still with its project, not with the currently selected filter or its position inside a filtered list.

Use `next/image` with accurate alternative text and responsive `sizes`; reserve dimensions to avoid layout shifts. Next.js 16.4 deprecates `priority` in favor of `preload` for genuinely critical imagery. Do not eagerly preload all six project stills or any below-the-fold images. Preserve the explicit instruction not to source images from the old website.

## Design scope and validation

The game, station starts, discoveries, traffic and animated office entrance have not been changed by the interior redesign. Website motion starts after the existing completion/skip reveal. System dark mode, reduced motion and explicit mobile layouts are implemented in the active `studio.css`.

No preview, build, lint, tests, diagnostics, Lighthouse or runtime verification has been run, in accordance with the requested workflow.
