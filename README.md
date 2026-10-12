# Whiteboard Studio

A browser-based whiteboard video editor prototype.

For the full Claude Code migration guide, including the saved project backup and artwork inventory, read [HANDOFF.md](HANDOFF.md).

**Live site:** https://jessenorthup24-cloud.github.io/whiteboard-studio/ — published automatically from `main` by GitHub Pages.

## Set up on another machine

1. Install [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/) (any current LTS version).
2. Clone the repository:
   ```bash
   git clone https://github.com/jessenorthup24-cloud/whiteboard-studio.git
   ```
3. In the `whiteboard-studio` folder, run `npm run dev` and open `http://127.0.0.1:4173`. No package installation is needed.
4. Bring your projects over. They live in the browser, not in this public repository. Backups are kept in the private repository `jessenorthup24-cloud/whiteboard-studio-projects`. Download the newest file from its `backups/` folder, then on the live site or local app use **My projects → Import backup**, once per browser. To save new work, use **Download backup** and add the file to that private repository. Local copies go in `project-backups/`, which Git ignores so private content is never published.

To work on the app with Claude Code, open the folder and start with [HANDOFF.md](HANDOFF.md). Pushing to `main` redeploys the live site within a few minutes.

## Run locally

Install Node.js, then run `node serve.cjs` in this folder and open `http://127.0.0.1:4173` in your browser. No package installation is needed.

Projects are saved in this browser's IndexedDB. Export uses your browser's MediaRecorder: it downloads MP4 where supported, otherwise WebM. Keep the tab open during export.

To move projects between the hosted site and a local copy, open **My projects**, choose **Download backup**, then use **Import backup** in the destination browser. The JSON backup includes project scenes, uploaded images, and audio stored with the projects. Keep the backup in a private folder if your content is private.

Included now: scenes, ten smooth handwriting fonts plus ten single-stroke lettering styles, 260 individually selectable library drawings, stroke-drawn shapes, traced image uploads, camera moves, timeline timing and reordering, one audio track (upload or microphone recording), preview, undo/redo, and video export. The library contains 40 black-outline drawings, 120 Bible-era colored drawings, 80 everyday colored drawings, and 20 precise colored arrows and numbers. Colored subjects are isolated by their visible pixels, so parts that extend across the sheet's grid stay with the correct illustration. Previously placed colored subjects refresh when their project opens. Click artwork or a camera frame to select it, then drag it or its edge and corner handles. Use **Pan** and the zoom buttons to move around the large whiteboard, and **Fit content** to find your work. The camera frame defines the video shot; select a camera and choose **Preview this camera frame** to crop the preview to its exact box. PNG and JPEG images are drawn by tracing contours and then filling their visible pixels with strokes. Transparent areas are skipped.

The longer-arm marker image and illustration sheets were generated for this project. Smooth handwriting styles are served through [Google Fonts](https://fonts.google.com/). The bundled single-stroke font data comes from [Hershey Text JS](https://github.com/techninja/hersheytextjs), whose JSON font data is public domain. Smooth handwriting lettering needs a network connection to load its font the first time.

Planned next: guaranteed MP4 export, multiple audio tracks, richer asset and template libraries, and shared cloud projects.
