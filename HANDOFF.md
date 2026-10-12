# Whiteboard Studio — Claude Code handoff

## Goal

Build a browser-based whiteboard video editor inspired by VideoScribe. The user wants to create long whiteboard stories by placing drawings and text on a large canvas, choosing camera views, and exporting videos with a visible marker hand. The local folder is ready for Claude Code to continue development.

## Open and run

1. Clone `https://github.com/jessenorthup24-cloud/whiteboard-studio` and open the folder in Claude Code.
2. Use Node.js and run `npm run dev` (or `node serve.cjs`). No dependency installation is required.
3. Open `http://127.0.0.1:4173` in a browser.
4. To load the user's projects, use **My projects → Import backup** with a backup JSON. The user's backups are stored in the private repository `jessenorthup24-cloud/whiteboard-studio-projects` (`backups/`); download the newest into `project-backups/`, which Git ignores. See `CLAUDE.md` for the steps. The 2026-10-12 backup contains one project, **Your first story**, with one scene.
5. Run `npm run check` to check JavaScript syntax after code changes.

## Live site

The live site is [jessenorthup24-cloud.github.io/whiteboard-studio](https://jessenorthup24-cloud.github.io/whiteboard-studio/), served free by GitHub Pages from the public repository. Every push to `main` runs `.github/workflows/pages.yml`, which runs `npm run check` and publishes `dist/`. Deployment status is in the repository's **Actions** tab. The site is static: projects stay in each visitor's browser, so the live site's projects are separate from local ones and move between them with backups.

Projects live in browser IndexedDB under the `whiteboard-studio` database. The hosted site's storage and the local site's storage are separate. **Download backup** and **Import backup** in **My projects** move projects between them. The JSON includes embedded uploads and any project audio, so protect it like user content. Importing a backup into a browser that already has a project with the same ID creates an additional imported copy.

## Current state

The editor is a dependency-free static web app. It has scenes; a timeline and audio editor (see below); draw, fade, slide, and pop entrances; transparent image uploads; audio upload and microphone recording; undo/redo; project backup and restore; a large pannable canvas; draggable and resizable images and camera frames; camera view previews; Preview, Pause and Stop controls (Stop, or Escape, ends the preview and rewinds so the next Play starts from the beginning); left, center and right text alignment; and browser video export.

The Drawings library has three tabs with search and categories, showing 96 results at a time. **Illustrations** holds the 260 bundled whiteboard drawings (40 black-outline, 120 colored Bible-era, 80 colored everyday, and 20 colored arrows and digits), **18 backdrops** (set pieces drawn for this project by `tools/draw-backdrops.cjs` into `artwork/backdrops/`: classroom, office, kitchen, living room, bedroom, meeting room, stage, street, store, park, farm, beach, mountains, night sky, desert camp, ancient village, temple courtyard, sea), **33 Open Doodles** (sketchy people by Pablo Stanley, CC0) and **1,523 color illustrations** from Microsoft Fluent Emoji Flat, whose 310 people also come in five skin tones (chosen with the skin-tone row; files `<name>--<tone>.svg`). A new backdrop goes first in the scene so it sits behind everything and is drawn first. **Characters** is a builder for Open Peeps (Pablo Stanley, CC0), vendored in `dist/vendor/open-peeps` by `tools/fetch-open-peeps.cjs`: expression, hair, facial hair, glasses and skin, hair and shirt colors; a placed character keeps its recipe (`item.character`) so its expression can be changed from the inspector. **Icons** holds the 9 hand-drawn basics plus **4,808 line icons** from Tabler Icons (brand logos left out). Both open-source sets are MIT licensed: videos made with them need no credit, and their license files stay beside the art (`dist/assets/icons/LICENSE`, `dist/assets/illustrations/fluent/LICENSE`). They load the first time their tab opens (`illustrations/index.json`, `tabler-icons.json`). Fluent illustrations are flat, so `outlinedIllustration` adds a dark outline around each shape and along strong color edges before tracing, to match the bundled art; then they are added as traced images like the other color drawings. Tabler icons are added as `icon` items with `iconPaths` (24-unit view box) and drawn line by line in the chosen color. The eight everyday source sheets and 100 individual transparent PNGs are in `artwork/everyday-illustrations/`. All 28 PNG source sheets used by the app are in `dist/assets/sheets/`; arrows and digits are generated in code. The app's marker hand versions are in `dist/assets/`, with `marker-hand-v3.png` active.

Text offers 36 smooth fonts and nine single-line pen fonts in a visual picker grouped by style (`FONT_GROUPS`: neat handwriting, casual and marker, cursive and script, bold and playful, chalk and sketch, classic and formal, single-line pen), each shown in its own lettering with a short description. The smooth fonts are Google Fonts under the Open Font License (free in videos, no credit). Text uses with left, center and right alignment. Letters are placed with the font's kerning (each starts where the text before it ends). Dancing Script, Satisfy, Homemade Apple, Pacifico, Kaushan Script, Yellowtail, Great Vibes and Sacramento are connected cursive fonts (`CONNECTED_FONTS`): each letter starts on its entry stroke and finishes along its exit stroke, the pen carries on into the next letter without lifting (`penPlan` treats strokes that meet as one continuous movement and only slows where the pen touches down or lifts), and each dot or crossbar (guide strokes marked `^`) is added right after its letter before the pen moves on. The pen fonts' glyphs are straight segments on a coarse grid; `smoothPenPath` draws them as smooth curves through the same points (each curve point eased slightly toward its neighbours, then Catmull-Rom), keeping sharp corners where a stroke turns by more than about 60 degrees. The Hershey script stroke fonts join the same way: `scriptGlyph` places each letter so its entry meets the previous letter's exit, with its dots and crossbars right after the letter's body. Single-stroke fonts follow bundled Hershey-style glyph paths. Smooth fonts are rendered with Google Fonts, then the app derives pen strokes from each letter's pixels and uses them to reveal the matching rendered letter. Spaces advance the pen without drawing. Each letter is traced once per font at a fixed 160px size (`GLYPH_TRACE_SIZE`) and cached.

**Stroke order.** `STROKE_GUIDES` describes how each letter, digit and common punctuation mark is written by hand: strokes with their start, direction and pen lifts, as waypoints in the letter's ink box (for example "o" counter-clockwise from the top, "a" bowl then stem, "e" crossbar first, "t" stem then crossbar). `guidedGlyphStrokes` thins the letter to a one-pixel centerline and routes each guide stroke along it: every waypoint picks one of its nearest centerline pixels so that waypoint offsets (weighted ×4) plus centerline distance are smallest, and the pen follows the centerline between them. Free ends and turnarounds are carried on to the letter's edge, following faint tapered ink. If a font's letter does not fit its guide (a waypoint is more than 30% of the letter away, or the route misses over 15% of the centerline), the other case's guide is tried (Permanent Marker's lowercase are small capitals), then the generic tracer, which:

- builds a graph of ends, junctions and segments and prunes thinning spurs;
- chains segments into continuous strokes, going as straight as possible at junctions and retracing short peaks such as the points of "M";
- orders strokes top-left first, draws closed bowls counter-clockwise from the top, and puts dots after the letter body.

Guides fit 54–72 of the 74 guided characters depending on the font (most misses are letters that font shapes unusually, such as Caveat's cursive "M" and "N").

**Pen motion.** `penPlan` turns the strokes into a timeline: each stroke starts and ends slowly and moves fastest in the middle, and between strokes the hand lifts and travels through the air to the next start.

**Reveal.** The reveal is driven per letter, not by masking the whole text with wide strokes (which uncovered nearby parts of the letter and neighbouring letters ahead of the pen). `letterReveal` renders each letter on its own and builds a time map. It walks the pen path every half pixel in writing order and seeds each position with its share of the letter's stroke length; times then spread outward through the letter's own ink (then to the remaining pixels), so every pixel gets the moment the pen reaches its part of the letter. Where the pen passes again over ink an earlier pass already covered (judged by a marker as wide as the letter at that point), it adds no seed, so retraces and crossings do not leave hidden lines. Each later stroke of a letter starts slightly later in the map (`STROKE_GAP`), so finishing one stroke never uncovers the start of the next. `handwritingMarkup` shows finished letters whole, hides later ones, and uncovers the current letter by thresholding its time map (stored in alpha) with an SVG `feComponentTransfer` filter inside an alpha mask. Measured on "Make ideas come alive.", ink appearing four or more frames before the pen reaches it fell from 0.6–5% of the ink (depending on font) to 0–0.7%.

The per-letter images and maps (`it.letters`) are rebuilt from the text when a project opens and are left out of saved projects and backups (`storedProject`); `handwritingSrc` and `letterPaths` are still saved. Text carries a version signature in `textSignature` (currently `letter-guided-4`, which also covers alignment), and older projects are re-traced automatically when opened.

The earlier private hosted site is [Whiteboard Studio](https://whiteboard-studio-jesse-2026.jessenorthup25.chatgpt.site/). Its Sites project ID is in `.openai/hosting.json`, and its last published source commit was `574274090b7342fc12ea34d9b261352fb6cf3e9e`. That site is not updated by this repository; the GitHub Pages site above is the current one. No deployment credential is stored in this folder.

## Illustration drawing

Artwork with a transparent background (library drawings, color illustrations, PNG and SVG uploads) is drawn like an illustrator would: `planIllustration` analyses the image at 256px, finds the dark line work (luminance below 62, or the shape's edge when there is none), thins it to centerlines and orders the line strokes so each starts near where the pen is. It then splits the rest into color areas (merging small shading patches into the largest neighbouring area) and colors each with back-and-forth marker strokes at a slight angle, biggest areas first. Every pixel gets the moment a marker as wide as the line, or the coloring band, first covers it; the time map (`illustration.map`) and pen path (`illustration.pen`) are saved with the item, and `illustrationMarkup` reveals the image through the thresholded map while the hand follows the path. Older projects are planned once when opened (`ILLUSTRATION_VERSION`). Photos without transparency keep the generic contour-and-scanline tracing.

## Timeline

Tiles are as wide as their duration (`TIMELINE_PX` per second, with a minimum width), followed by a striped tail for the pause. Dragging a tile reorders it live: the others slide aside, the strip scrolls near its edges, Escape cancels, and dropping on a scene in the scene list moves the item to the end of that scene. Scenes reorder the same way (`sortable`). The handle at a tile's right edge changes its duration, and the one at the end of its tail changes the pause, in tenths of a second. The ruler above the tiles scrubs, and the playhead follows playback, switching to the scene being played. Playback only updates the clock and playhead (`renderTimelineClock`); the strips are rebuilt (`renderTimelineStrips`) only when the project changes. Alt+Left/Right moves the selected item earlier or later.

The editing toolbar in the timeline header (`renderEditTools`, `editAction`) has undo and redo, split at the playhead (S), trim start or end to the playhead ([ and ]), duplicate (Ctrl+D), delete, a razor (C: click an audio clip to cut it there; Escape leaves it), snap on or off, and split scene at the playhead (drawings that start at or after the playhead move to a new scene, with their linked narration). Split and trims act on the selected audio clip if it is under the playhead, otherwise on every clip under it. Right-clicking an audio clip opens the same actions at the clicked point.

## Audio

Audio is a set of clips (`project.audioClips`) on two lanes, Music and Narration, across the whole video. Each clip plays a stretch (`offset`, `length`) of a file in `project.audioFiles` at its `volume` with optional `fadeIn`/`fadeOut`, starting at `start` seconds; splitting or duplicating a clip shares the file. A narration clip linked to its scene (`clip.scene`) keeps its distance from the scene start (`clip.sceneOffset`), so split pieces keep their places and every piece follows the scene; moving or trimming it updates the offset. The audio editor below the drawing tiles shows each clip with its waveform on a ruler with scene markers and the video end: drag a clip to move it (it snaps to the playhead, scene starts and other clips, and can change lane), drag its edges to trim, and select it to set volume, fades, start and length, or to split, duplicate or delete it. Record at playhead plays the video while recording and places the narration where it began. `startClips` schedules the clips with the Web Audio API for preview (whose clock then follows the audio clock) and for export (mixed into the recording). Older projects' single `audio` track becomes one music clip at 0 s. The timeline panel can be resized from its top edge.

## Scripts and narration

Each scene has a script box in its settings, with a voice (28 Kokoro voices) and speaking speed for the project. **▶ Preview** speaks the script and plays it without touching the timeline, and **Try voice** plays a short sample of the chosen voice; spoken audio is cached by voice, speed and text, so **Add narration to timeline** reuses a previewed line. Narration is spoken with Kokoro-82M (Apache 2.0, no credit needed) in `dist/tts-worker.js`, a module worker that loads `kokoro-js` 1.2.1 from jsDelivr and the 8-bit model (about 92 MB, cached by the browser) from Hugging Face, and speaks sentence by sentence with short pauses. The result is saved as a WAV audio file and placed on the Narration lane as a clip linked to its scene (`clip.scene`); with **Fit this scene's timing to the narration** (on by default) the scene's items are stretched or shrunk so the scene lasts the narration plus half a second. `syncNarration` keeps linked clips at their offset from their scene's start whenever the project changes. The Audio panel can narrate every scene that has a script. Generation runs on the CPU (single-threaded, since GitHub Pages cannot enable cross-origin isolation), at very roughly real time to a few times slower.

## Export

**Export video** opens options: file name, resolution (720p, 1080p, 1440p, 4K, following the project's aspect ratio), frame rate (24, 30, 60), quality, range (whole video or the current scene) and audio. `exportVideo` renders every frame in full with `paintSvg` (never in real time, so nothing stutters) and encodes it with WebCodecs `VideoEncoder` as H.264 (High profile at the smallest level that fits), a keyframe every two seconds, into an MP4 written by mp4-muxer (`dist/vendor/mp4-muxer`, MIT) with its index at the start, so the file plays and scrubs in any player. The audio clips are mixed with `OfflineAudioContext` (`mixAudio`, the same `scheduleClips` used for live playback) and encoded as AAC (or Opus where AAC is unavailable). The whole file is built in memory. Browsers without WebCodecs fall back to the old real-time recorder (`recordVideoRealtime`). A 24-second 1080p30 video took about 11 seconds in testing.

## Library sources

`tools/pack-art.cjs <folder>` rebuilds the open-source library files from downloads: `tabler-nodes-outline.json`, `tabler-icons.json` and `LICENSE` from the `@tabler/icons` npm package (3.49.0, via cdn.jsdelivr.net/npm), and `assets/<emoji>/metadata.json` plus the Flat SVGs and `LICENSE` from the `microsoft/fluentui-emoji` GitHub repository (via cdn.jsdelivr.net/gh). `tools/pack-art.cjs` also takes `fluent-tones/` (the five skin tones of each person) and `doodles/` (from opendoodles.s3-us-west-1.amazonaws.com), and copies the backdrops from `artwork/backdrops/`. Keep only MIT, CC0 or similar no-attribution sources, so the user never has to credit anyone in their videos.

## Important files

| File or folder | Purpose |
| --- | --- |
| `dist/index.html` | Editor shell and inputs |
| `dist/styles.css` | Layout, controls, and font imports |
| `dist/app.js` | Editor state, rendering, timeline, library, storage, and export |
| `dist/assets/sheets/` | All original illustration sheets used by the app |
| `dist/assets/marker-hand-v3.png` | Active transparent hand image |
| `dist/assets/stroke-font.json` | Bundled single-stroke font data |
| `dist/assets/icons/` | Tabler line icons (`tabler-icons.json`) and their MIT license |
| `dist/assets/illustrations/` | Fluent Emoji Flat SVGs, their index (`fluent-index.json`) and MIT license |
| `tools/pack-art.cjs` | Rebuilds the open-source library files from downloads |
| `artwork/everyday-illustrations/` | 100 separate PNGs, manifest, and eight source sheets |
| `project-backups/` | Private backup of the hosted browser project; ignored by Git |
| `serve.cjs` | Minimal local server on port 4173 |
| `.openai/hosting.json` | Existing private Sites deployment identity |

## Code map

`SHEETS` and `FONT_OPTIONS` near the top of `dist/app.js` define the asset and font menus; `libraryPanel`, `showLibraryResults`, `addEmojiDrawing` and `addTablerIcon` run the Drawings library; `renderTimelineStrips`, `renderTimelineClock`, `sortable` and `bindTimeline` run the timeline; `scriptGlyph` joins the script stroke fonts. `separateColoredSheet` isolates colored drawings from each source sheet by connected transparent pixel regions. `generateSymbolDrawing` creates arrows and digits. `traceImage` converts uploaded and library images into contour and fill paths. `STROKE_GUIDES`, `guidedGlyphStrokes` and `traceGlyphStrokes` (with `simplifyStroke`, `relaxStroke` and `strokePathData`) and `refreshHandwriting` build the smooth-font writing paths; `letterReveal`, `penPlan` and `handwritingMarkup` uncover the letters. `elementMarkup`, `maskedDrawing`, and `renderStage` draw the editor and previews. Camera framing is handled by `cameraBox`, the editor view, and `previewCamera`. `openDb`, `saveProject`, `downloadProjectBackup`, and `importProjectBackup` handle local project data. `exportVideo` uses browser `MediaRecorder`.

## Product requirements from the user

- The whiteboard should feel very large so a story can continue through many camera pans and shots. The camera defines the visible video area and its aspect ratio.
- Any placed image or camera frame should be selectable by clicking and resizable by dragging edges or corners.
- Preview should show exactly the selected camera view when previewing that frame.
- The hand should hold a dry-erase marker, enter mostly vertically from the bottom with a slightly bent wrist, and follow drawing and lettering.
- Every visual element should be drawn. Transparent regions must remain transparent; the hand must not color them in.
- Every text style should write along its actual letters. Avoid low-resolution, angular-looking font edges, question marks in place of spaces, broad wipes, or arbitrary fills.
- The library needs varied, reusable whiteboard illustrations. Black-line people should be transparent inside their outlines; the colored collections should have simple illustration colors and generous, accurate crops.
- Preserve the current Bible-era and general-use collections and continue improving them without losing previously placed items.

## Practical limits and next work

- Video export needs WebCodecs (Chrome, Edge, recent Safari and Firefox) for the frame-by-frame MP4; other browsers record in real time. Very long 4K exports may need a lot of memory because the file is built in memory.
- Audio has two lanes (music and narration). Audio is not yet trimmed to the video end in the editor; clips past the end are simply cut off in export.
- Smooth handwriting fonts load from Google Fonts. They need network access the first time and are not bundled for offline use.
- The single `dist/app.js` file is large. Refactoring into modules would make drawing, project storage, and export work easier to maintain, but preserve saved-project compatibility.
- Colored image tracing uses a reduced-resolution mask. The animation should be reviewed at different sizes and speeds, particularly for complex illustrations and the smooth fonts.
- Projects currently remain in each browser's local storage. The JSON backup is the portability mechanism; cloud sync is not implemented.

## Suggested first Claude Code task

Run the app, import the included backup, and verify that the saved scene opens. Inspect a smooth handwritten phrase and an illustration during preview to confirm the hand follows the visible strokes and transparent areas stay empty. Then prioritize the next feature or fidelity change with the user. Keep this handoff document current as the code changes.

## Source and artwork notes

The hand and illustration sheets were generated for this project. The 100 everyday PNGs in `artwork/everyday-illustrations/individual/` were isolated and checked for alpha transparency and safe crop margins. Smooth font CSS references Google Fonts. `stroke-font.json` is derived from Hershey Text JS font data, which the prior project documentation identifies as public domain.
