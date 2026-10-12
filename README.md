# Whiteboard Studio

A browser-based whiteboard video editor prototype.

## Run locally

Install Node.js, then run `node serve.cjs` in this folder and open `http://127.0.0.1:4173` in your browser. No package installation is needed.

Projects are saved in this browser's IndexedDB. Export uses your browser's MediaRecorder: it downloads MP4 where supported, otherwise WebM. Keep the tab open during export.

Included now: scenes, single-stroke marker lettering, line drawings, stroke-drawn shapes, traced image uploads, camera moves, timeline timing and reordering, one audio track (upload or microphone recording), preview, undo/redo, and video export. Uploaded SVGs need plain paths; PNG and JPEG images are drawn by tracing contours and then filling the remaining image with strokes.

The marker-hand image was generated for this project. The bundled single-stroke font data comes from [Hershey Text JS](https://github.com/techninja/hersheytextjs), whose JSON font data is public domain.

Planned next: guaranteed MP4 export, multiple audio tracks, richer asset and template libraries, and shared cloud projects.
