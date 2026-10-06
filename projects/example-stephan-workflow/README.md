# Example Stephan Workflow

An example project that demonstrates a research-and-prototyping workflow inspired
by Stefan's AI game-development workflow. It is not a real game. The fictional
dark-fantasy RTS **OVERLORD** is used to show how an AI-first workspace moves
from research to references, design decisions, a UI specification, an
interactive prototype and notes.

Card: [Workspace › Example Stephan Workflow](../../workspace/2026-10-05_example-stephan-workflow/index.html)
(`workspace/2026-10-05_example-stephan-workflow/`, registry ID
`example-stephan-workflow`). Reader guide: the card's **How it works** tab
(`guide.md`).

## Scope

- 22 linked pages in six groups: Discover, Research, The World, Game Design,
  Prototype and Development.
- Page metadata on every page: status, confidence, source, decision, open
  question, prototype status and last updated.
- An interactive HUD prototype with twelve specified states, selection, orders,
  a light combat simulation, abilities, training, threats, settings and a
  minimap.
- Example content only. Research notes are labelled as example notes;
  reference images are generated placeholder blocks; playtests and the DevLog
  are fictional.

## Editing rules

- Content lives in plain data files. Change data before changing renderers:
  - `research/competitors.js`, `research/ux-patterns.js`, `research/decisions.js`
  - `references/board.js` (images in `assets/references/`)
  - `design/workflow.js`, `design/world.js`, `design/game-design.js`
  - `notes/development.js`
  - `prototype/entities.js` (all unit, building and ability numbers and the
    damage formula), `prototype/map.js`, `prototype/prototype.js` (HUD state
    specs and the playtest checklist)
- `script.js` maps each route to a renderer in its `PAGE` table; add a route to
  `NAV` and a renderer together.
- `prototype/hud.js` implements each state ID from `prototype/prototype.js` in
  its `PRESETS` table. Add both when introducing a state.
- Keep IDs stable: decisions (`d-01`), notes (`n-01`), competitors and HUD
  states are linked from several pages.
- Keep the card dependency-free and its stored content in English. Do not
  present placeholders or fictional notes as real sources.

## Verification

```sh
node projects/example-stephan-workflow/check-workflow.mjs
```

The check loads the data files and verifies cross-links: decision, state, note
and source IDs, unit and ability references, locations, routes, preset coverage
and image files. Then open the card at wide and narrow widths and exercise the
HUD states, as described in `processes/workspace-authoring.md`.
