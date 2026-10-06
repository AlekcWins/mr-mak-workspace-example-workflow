# How the Example Stephan Workflow works

This card is a complete example of an AI-assisted game research workspace for
**OVERLORD**, a fictional dark-fantasy RTS. It shows one path from research to a
working prototype:

**Research → References → Design decisions → UI specification → Interactive
prototype → Notes and next steps**

Everything in it is an example. The game, the research notes, the playtests and
the DevLog are fictional. The reference images are generated placeholder blocks,
labelled as placeholders.

## Use the workspace

Open the **Workspace** tab. The left sidebar lists 22 pages in six groups. Each
page lists its sections on the right, along with status, confidence, source,
decision, open question, prototype status and last-updated date.

- **Overview** explains the six stages and follows one decision from a competitor
  note to a change in the prototype.
- **Research** holds competitor notes, the reference board, UX patterns and the
  decision table. Click a decision row to see its context and evidence.
- **The World** and **Game Design** describe what the HUD has to communicate.
- **Prototype › HUD** is the interactive prototype.
- **Development** holds ideas, playtest notes, a TODO list and the DevLog.

Press `/` or `Ctrl+K` to search every page, note and
decision. You can also type a HUD state, such as "threat", to open the prototype
in that state.

## Try the HUD prototype

The **HUD demo — states** panel switches between the twelve specified states. You
can also play directly:

| Input | Action |
| --- | --- |
| Click, Shift-click, drag | Select units or a building; box-select |
| Click empty ground, `Esc` | Clear the selection |
| Right-click | Move, or attack an enemy |
| `A` then click | Attack-move (whole army if nothing is selected) |
| `Q` `W` `E` `R` | Abilities of the selected unit or building |
| `Space` | Pause and open settings |
| `F` / `H` / `J` | General / keep / current threat |
| Minimap, arrow keys, wheel | Move and zoom the camera |

Settings include an **Inspector position** switch, so the open question about
right versus bottom placement can be tested directly.

## Where things live

The brief asked for this structure:

```text
Example Stephan Workflow/
├── workspace.json
└── example-stephan-workflow/
    ├── index.html · style.css · script.js
    └── research/ references/ design/ prototype/ notes/ assets/
```

In Mr. Mak, the registry is the shared `workspace/workspace.json`. The project
folder is this card's dated folder, `workspace/2026-10-05_example-stephan-workflow/`:

| Path | Contents |
| --- | --- |
| `index.html`, `style.css`, `script.js` | Workspace shell, navigation, search and page renderers |
| `research/` | Competitors, UX patterns and the decision record |
| `references/` | Reference board data |
| `design/` | Workflow, world and game-design content |
| `prototype/` | HUD engine, map, unit data, art kit, state specs and HUD styles |
| `notes/` | Ideas, playtest notes, TODO and DevLog |
| `assets/` | Emblem and generated placeholder images |

The content files are plain JavaScript data. Pages read them at load time, so the
card also works when opened directly from disk. No libraries are used.

## Change it with an agent

Ask in a Mr. Mak chat, for example:

```text
Example Stephan Workflow: add Northgard as a competitor and link it to D-08.
Example Stephan Workflow: make the Barrow Wight slower and check the Combat page.
Example Stephan Workflow: add a HUD state for "Group — 7+ types".
```

After a change, run the consistency check and open the card:

```sh
node projects/example-stephan-workflow/check-workflow.mjs
```

The project brief is in `projects/example-stephan-workflow/README.md`.
