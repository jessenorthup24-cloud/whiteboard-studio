# Whiteboard Studio — Claude Code handoff

## Goal

Build a browser-based whiteboard video editor inspired by VideoScribe. The user wants to create long whiteboard stories by placing drawings and text on a large canvas, choosing camera views, and exporting videos with a visible marker hand. The local folder is ready for Claude Code to continue development.

## Open and run

1. Open this folder in Claude Code: `C:\Users\Jesse\Documents\Codex\WhiteboardStudio-Claude`.
2. Use Node.js and run `npm run dev` (or `node serve.cjs`). No dependency installation is required.
3. Open `http://127.0.0.1:4173` in a browser.
4. In **My projects**, choose **Import backup** and select `project-backups/hosted-projects-2026-10-12.json` to load the user's hosted project into the local browser. The backup contains one project, **Your first story**, with one scene. It is deliberately excluded from Git.
5. Run `npm run check` to check JavaScript syntax after code changes.

Projects live in browser IndexedDB under the `whiteboard-studio` database. The hosted site's storage and the local site's storage are separate. **Download backup** and **Import backup** in **My projects** move projects between them. The JSON includes embedded uploads and any project audio, so protect it like user content. Importing a backup into a browser that already has a project with the same ID creates an additional imported copy.

## Current state

The editor is a dependency-free static web app. It has scenes; a timeline with timing and reordering; draw, fade, slide, and pop entrances; transparent image uploads; audio upload and microphone recording; undo/redo; project backup and restore; a large pannable canvas; draggable and resizable images and camera frames; camera view previews; and browser video export.

The library has **260 individual items**: 40 black-outline drawings, 120 colored Bible-era drawings, 80 colored everyday drawings, and 20 precise colored arrows and digits. The eight everyday source sheets and 100 individual transparent PNGs are in `artwork/everyday-illustrations/`. All 28 PNG source sheets used by the app are in `dist/assets/sheets/`; arrows and digits are generated in code. The app's marker hand versions are in `dist/assets/`, with `marker-hand-v3.png` active.

Text offers ten smooth handwriting fonts and ten single-stroke fonts. Single-stroke fonts follow bundled Hershey-style glyph paths. Smooth fonts are rendered with Google Fonts, then the app derives centerline paths from each letter's pixels and uses those paths to reveal the matching rendered letter. Spaces advance the pen without drawing. This is the current implementation of the requirement that text be *written* rather than revealed with a broad wipe. It is an approximation of true pen strokes and remains a useful area for visual refinement.

The current private hosted site is [Whiteboard Studio](https://whiteboard-studio-jesse-2026.jessenorthup25.chatgpt.site/). Its Sites project ID is in `.openai/hosting.json`. The latest published source commit at handoff is `574274090b7342fc12ea34d9b261352fb6cf3e9e`. The Git remote named `codex-source` points to the previous local checkout for reference; no deployment credential is stored in this folder.

## Important files

| File or folder | Purpose |
| --- | --- |
| `dist/index.html` | Editor shell and inputs |
| `dist/styles.css` | Layout, controls, and font imports |
| `dist/app.js` | Editor state, rendering, timeline, library, storage, and export |
| `dist/assets/sheets/` | All original illustration sheets used by the app |
| `dist/assets/marker-hand-v3.png` | Active transparent hand image |
| `dist/assets/stroke-font.json` | Bundled single-stroke font data |
| `artwork/everyday-illustrations/` | 100 separate PNGs, manifest, and eight source sheets |
| `project-backups/` | Private backup of the hosted browser project; ignored by Git |
| `serve.cjs` | Minimal local server on port 4173 |
| `.openai/hosting.json` | Existing private Sites deployment identity |

## Code map

`SHEETS` and `FONT_OPTIONS` near the top of `dist/app.js` define the asset and font menus. `separateColoredSheet` isolates colored drawings from each source sheet by connected transparent pixel regions. `generateSymbolDrawing` creates arrows and digits. `traceImage` converts uploaded and library images into contour and fill paths. `traceGlyphStrokes` and `refreshHandwriting` build the smooth-font writing paths. `elementMarkup`, `maskedDrawing`, and `renderStage` draw the editor and previews. Camera framing is handled by `cameraBox`, the editor view, and `previewCamera`. `openDb`, `saveProject`, `downloadProjectBackup`, and `importProjectBackup` handle local project data. `exportVideo` uses browser `MediaRecorder`.

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

- Video export relies on the browser's `MediaRecorder`: it produces MP4 only when that browser supports it, otherwise WebM. A guaranteed MP4 pipeline is still future work.
- There is one project audio track. Multiple tracks, editing, and mixing are future work.
- Smooth handwriting fonts load from Google Fonts. They need network access the first time and are not bundled for offline use.
- The single `dist/app.js` file is large. Refactoring into modules would make drawing, project storage, and export work easier to maintain, but preserve saved-project compatibility.
- Colored image tracing uses a reduced-resolution mask. The animation should be reviewed at different sizes and speeds, particularly for complex illustrations and the smooth fonts.
- Projects currently remain in each browser's local storage. The JSON backup is the portability mechanism; cloud sync is not implemented.

## Suggested first Claude Code task

Run the app, import the included backup, and verify that the saved scene opens. Inspect a smooth handwritten phrase and an illustration during preview to confirm the hand follows the visible strokes and transparent areas stay empty. Then prioritize the next feature or fidelity change with the user. Keep this handoff document current as the code changes.

## Source and artwork notes

The hand and illustration sheets were generated for this project. The 100 everyday PNGs in `artwork/everyday-illustrations/individual/` were isolated and checked for alpha transparency and safe crop margins. Smooth font CSS references Google Fonts. `stroke-font.json` is derived from Hershey Text JS font data, which the prior project documentation identifies as public domain.
