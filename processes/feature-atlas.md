# Feature Atlas

Use this workflow when a request starts with "Feature Atlas" or concerns the
competitor feature library. Project brief: `projects/feature-atlas/README.md`.
Card folder (below, `ATLAS`): `workspace/2026-10-05_feature-atlas/`.

The card is read-only. All changes go through `ATLAS/data/atlas.json`, files in
`ATLAS/assets/` and `ATLAS/results/`, and the card's entry in
`workspace/workspace.json`. Run the check after every change:

```sh
node projects/feature-atlas/check-atlas.mjs
```

Store content in English unless the owner asks otherwise. Keep the owner's
meaning when translating and ask when a description is ambiguous. Do not invent
features, numbers or claims about a competitor; record only what the owner
described or what a cited source shows.

## Data schema

IDs are lowercase kebab-case and never change once used, because selections
and built features refer to them. A feature ID starts with its competitor ID.

```json
{
  "competitors": [
    {
      "id": "linear",
      "name": "Linear",
      "url": "https://linear.app",
      "summary": "Issue tracker for product teams.",
      "logo": "assets/linear/logo.png"
    }
  ],
  "features": [
    {
      "id": "linear-command-menu",
      "competitor": "linear",
      "title": "Command menu",
      "category": "Navigation",
      "summary": "Ctrl+K opens a searchable list of every action.",
      "description": "Paragraphs separated by a blank line.",
      "highlights": ["Works from any screen", "Shows the shortcut next to each action"],
      "images": [{ "src": "assets/linear/command-menu.png", "caption": "Menu open over an issue" }],
      "source": "https://linear.app/docs",
      "added": "2026-10-05"
    }
  ],
  "results": [
    {
      "id": "quick-actions",
      "title": "Quick actions",
      "summary": "One sentence about the built feature.",
      "created": "2026-10-05",
      "from": ["linear-command-menu"],
      "spec": "results/quick-actions/spec.md",
      "design": "results/quick-actions/design.html",
      "preview": "results/quick-actions/preview.png"
    }
  ]
}
```

Required: competitor `id`, `name`; feature `id`, `competitor`, `title`; result
`id`, `title`, `from`, `spec`, `design`. Everything else is optional. Paths are
relative to `ATLAS`. Reuse existing category names; check the current list
before inventing a new one. Keep `summary` to one sentence.

## Add a competitor or feature

1. Read `atlas.json`. Reuse an existing competitor or feature when the request
   refers to one; ask before merging two similar features.
2. For screenshots, take the paths the owner gave (pasted chat images are in
   `inbox/attachments/<date>/`). Copy, do not move, each file to
   `ATLAS/assets/<competitor-id>/<feature-id>[-2].<ext>`. Keep PNG, JPEG or
   WebP. Look at each image and write a caption that says what it shows.
3. Edit `atlas.json`, set `added` to today's date and update the card's
   `updated` date in `workspace/workspace.json`.
4. Run the check and report what was added. Do not delete inbox files.

## Build a feature

The owner pastes a request from the card:

```text
Feature Atlas: build a new feature from these references.
Name: ...
Goal: ...
References: feature-id, feature-id
```

1. Read each referenced feature, its description and every screenshot.
   Choose the name if the request says "suggest one"; confirm the result ID
   is unused.
2. Write `ATLAS/results/<id>/spec.md` with these sections:
   - **Summary**: what the feature is, in two or three sentences.
   - **Problem and audience**: who needs it and why; use the stated goal.
   - **What we take from each reference**: one entry per reference, naming
     the competitor and the exact idea, and what is deliberately left out.
   - **User flow**: numbered steps for the main path.
   - **Requirements**: functional requirements as a numbered list.
   - **States and edge cases**: empty, loading, error, permissions, limits.
   - **Acceptance criteria**: testable statements.
   - **Open questions**: decisions for the owner.
3. Write `ATLAS/results/<id>/design.html`, a single self-contained page:
   - `<html lang="en" data-mak-report="document" data-mak-theme="custom">`,
     inline CSS, no network requests except Google Fonts if needed;
   - the main screen and its key states (empty, filled, error or success),
     shown at desktop width and a narrow mobile width where relevant;
   - realistic copy, no lorem ipsum; short annotations that link design
     decisions to the spec;
   - an original design: never copy a competitor's logo, brand colours,
     illustrations or text. Screenshots inform behaviour and layout only.
   If the design uses images, include `../../../_shared/report.js` so they
   open full size with a download.
4. Optionally capture `preview.png` of the design with a local headless
   browser. Skip it rather than fail when no browser is available.
5. Add the result to `atlas.json`. Add two steps to the card in
   `workspace/workspace.json`: `Feature · <title>` for `spec.md` and
   `Design · <title>` for `design.html`. Update `updated`.
6. Run the check, open both tabs at wide and narrow widths, and report what
   was produced and checked.

For a revision, edit the same files for small changes. For a substantial
redesign, keep the previous file, write `design-v2.html` (or `spec-v2.md`) and
add a step named `Design v2 · <title>`. Point `spec` and `design` in
`atlas.json` at the current versions.

## Optional outputs

Use Figma, image generation or other paid tools only when the owner asks. State
the cost or account used before starting, and keep job IDs as the repository
rules require.
