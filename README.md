# Whiteboard Studio

A browser-based whiteboard video editor prototype.

## Run locally

Install Node.js, then run `node serve.cjs` in this folder and open `http://127.0.0.1:4173` in your browser. No package installation is needed.

Projects are saved in this browser's IndexedDB. Export uses your browser's MediaRecorder: it downloads MP4 where supported, otherwise WebM. Keep the tab open during export.

Included now: scenes, text, line drawings, shapes, image uploads, camera moves, timeline timing and reordering, one audio track (upload or microphone recording), preview, undo/redo, and video export. Uploaded SVGs need plain paths to be drawn stroke by stroke; PNG and JPEG images use a reveal animation.

Planned next: guaranteed MP4 export, multiple audio tracks, richer asset and template libraries, and shared cloud projects.
