# Feature Atlas

A competitor feature library. The owner chooses competitors and describes
their features with screenshots. From the catalog they tick the features worth
combining and receive a written feature and a design built from them.

## How it is built

- **Workspace hub:** the pinned card
  [Feature Atlas](../../workspace/2026-10-05_feature-atlas/index.html). The
  **Atlas** tab shows competitors and features, filters them, keeps a checkbox
  selection and produces a brief and an agent request. **How it works** is
  the owner's guide.
- **Data:** `workspace/2026-10-05_feature-atlas/data/atlas.json`, with
  screenshots under `assets/`. Workspace cards are read-only, so the agent
  edits the data on request; nothing is entered in the card itself.
- **Generation:** through an agent chat with the owner's subscription. No API
  keys are used. The agent writes `results/<id>/spec.md` and
  `results/<id>/design.html` and registers both as card tabs.
- **Workflow:** [processes/feature-atlas.md](../../processes/feature-atlas.md)
  holds the data schema, naming, the spec template and the design rules.
- **Check:** `node projects/feature-atlas/check-atlas.mjs` validates the data,
  files and registered tabs after every change.

## Decisions

- 2026-10-05: Card plus agent rather than a separate editing application or a
  new Mr. Mak section. Revisit if manual entry in an interface becomes
  necessary; the data file can then back an editor without migration.
- 2026-10-05: Feature texts and designs are generated in the chat, not with
  API calls from the card.
- Designs are original interfaces informed by the references. They do not
  reproduce a competitor's branding, logos or copy.

## Next steps

1. Add the first competitors and their features.
2. Build the first feature and review whether the spec template and design
   format are useful. Adjust the workflow from that review.
3. Optional later: a comparison matrix of categories by competitor, and design
   output in Figma when requested.
