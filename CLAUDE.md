# Whiteboard Studio

Read `HANDOFF.md` before making changes. The working app is in `dist/`; run it with `npm run dev` (or `node serve.cjs`) and open `http://127.0.0.1:4173`.

The live site is https://jessenorthup24-cloud.github.io/whiteboard-studio/. It redeploys automatically from `main` through GitHub Pages (`.github/workflows/pages.yml`), so pushing to `main` publishes changes.

## Picking up on a new machine

When the user asks to "check the repo" or continue work on another machine:

1. Clone or pull this repository and read `HANDOFF.md`.
2. The user's projects are not in this repository. Their backups are in the **private** repository `jessenorthup24-cloud/whiteboard-studio-projects` under `backups/`. Download the newest file into this repo's `project-backups/` (Git ignores it), for example with `gh api repos/jessenorthup24-cloud/whiteboard-studio-projects/contents/backups/<file> -H "Accept: application/vnd.github.raw" > project-backups/<file>`. List the folder first to find the newest file.
3. Projects are saved per browser. Help the user open the live site and use **My projects → Import backup** with that file, once in each browser they use.
4. When the user wants to save new work, have them use **Download backup** on the site, then commit that file to `backups/` in the private repository.

## Rules

Keep the user's core requirements intact: a large pannable whiteboard, resizable artwork and camera frames, camera-locked previews, transparent illustrations, a visible hand that follows the drawing, and text that is written along the shapes of its letters. Preserve project compatibility with the backups.

Check JavaScript syntax with `npm run check` after edits and test important editor flows in a browser. This repository is **public**. Treat `project-backups/*.json` and the private projects repository as private user content: never commit backups here, never publish them to the live site, and never make the projects repository public.
