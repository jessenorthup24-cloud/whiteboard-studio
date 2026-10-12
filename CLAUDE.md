# Whiteboard Studio

Read `HANDOFF.md` before making changes. This folder is the local, self-contained handoff of the Whiteboard Studio web app. The working app is in `dist/`; run it with `npm run dev` (or `node serve.cjs`) and open `http://127.0.0.1:4173`.

Keep the user's core requirements intact: a large pannable whiteboard, resizable artwork and camera frames, camera-locked previews, transparent illustrations, a visible hand that follows the drawing, and text that is written along the shapes of its letters. Preserve project compatibility with the backup in `project-backups/`.

Check JavaScript syntax with `npm run check` after edits and test important editor flows in a browser. Treat `project-backups/*.json` as private user content; it is ignored by Git. Do not include it in commits or deployments.
