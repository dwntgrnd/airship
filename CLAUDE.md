# CLAUDE.md — Doren's Airship fork (read before editing)

Personal fork of github.com/0xnyn/airship (MIT). Goal: a visual editor that fits Doren's
own workflow (AK12-Site lanes on :8902/:8903 etc.). Not a product; no npm publish.
Upstream's contributor rules live in `CONTRIBUTING.md` and `.claude/CLAUDE.md`
(Ultracite/Biome standards); follow them so changes stay upstreamable.

## Branches

- `main` = pristine mirror of `upstream/main`. Never commit here.
  Sync: `git checkout main && git pull upstream main && git push origin main`.
- `fork` = integration branch. This file lives here. Rebase onto main after each sync:
  `git checkout fork && git rebase main`.
- `feat/<name>` = one branch per item, cut from `fork`, merged back into `fork`.
  Small generic ones can also be PR'd to upstream (cut from `main` for a clean PR).

## Running

- `./airship ...` = this checkout's CLI (rebuilds when packages change).
- `airship-dev` (symlink in /opt/homebrew/bin → ./airship) = same thing from anywhere.
- `airship` (stock 0.2.3, npm global) = untouched control.
- `pnpm install && pnpm build` after pulling; `make check` = lint + typecheck + test.

## The three items (Doren, 2026-08-23)

1. **Single resizable frame** (default mode): one frame with drag-to-resize handles, live
   width/height readout, a presets menu (Chrome-inspector style). Keep the multi-frame
   canvas as a switchable mode (bird's-eye view still valued). Likely fork-only.
   Code: `packages/overlay/src/canvas/` (frames.ts, frame-chrome.ts, device-menu.ts,
   presets, frames-panel.ts).
2. **Edit/View mode toggle shortcut**, user-configurable keymap.
   Code: `packages/overlay/src/keys/` (catalog.ts is the single source; `CONTROLS.md` is
   GENERATED from it via `make controls`). Upstreamable.
   Also (Doren, 2026-08-23): a shortcut to open/collapse the side docks (agent/chat dock and the
   edit/inspector dock). Not in 0.3.0's catalog (only double-click-header redock exists).
3. **Agent panel**: (a) model selector in the UI (CLI already has `--model`/`--claude-model`;
   wire a dropdown through); (b) follow-up suggestions multi-select: chips toggle, submit
   concatenates selected, chip row survives submit. Code: `packages/overlay/src/chat/transcript.ts`
   (`followUps`, `onFollowUp`), `packages/core/src/prompt.ts` (asks for ≤3 follow-ups),
   `packages/server/src/index.ts` (~L924 passes `followUps`). Upstreamable.

## Conventions

- Don't edit `CONTROLS.md` or `README.md` by hand (generated: `make controls`, `make readme`).
- Conventional Commits (commitlint hook enforces).
- No em dashes in anything Doren will paste into copy (his rule; code comments are fine).
