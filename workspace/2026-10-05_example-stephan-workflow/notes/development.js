/* Development › Ideas, Notes, TODO, DevLog. All entries are fictional
   examples showing how the workflow records thinking over time. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  data.ideas = {
    lead: 'A parking lot for ideas. Each one carries a status so nothing is lost and nothing sneaks into scope.',
    meta: { status: 'Open list', confidence: 'Low', source: 'Brainstorms', decision: 'Promote via the decision table', question: 'Which idea is worth a prototype state next?', prototype: '1 promoted', updated: '2026-10-04' },
    statuses: ['Exploring', 'Parked', 'Promoted', 'Rejected'],
    items: [
      { id: 'threat-compass', title: 'Threat compass at the screen edge', status: 'Promoted', text: 'An arrow on the viewport edge pointing at off-screen threats.', link: 'D-06' },
      { id: 'banner-carrier', title: 'Banner carrier unit', status: 'Exploring', text: 'A unit that extends the General’s aura, so the hero can fight elsewhere.' },
      { id: 'ghost-formation', title: 'Ghost preview of formations', status: 'Exploring', text: 'Show translucent slots while dragging a move order, before confirming.' },
      { id: 'voice-barks', title: 'Voice barks for alerts', status: 'Parked', text: 'Short lines from the General when the keep is attacked. Needs audio budget.' },
      { id: 'night-cycle', title: 'Night reduces vision', status: 'Parked', text: 'Barrows spawn faster at night; watchtower beacons matter more.' },
      { id: 'capture-mill', title: 'Capturable windmill', status: 'Exploring', text: 'Enemies could burn the mill to cut income — a second threat type.' },
      { id: 'per-unit-bars', title: 'Per-unit health in group view', status: 'Rejected', text: 'Too many bars to read at a glance.', link: 'D-11' },
    ],
  };

  data.notes = {
    lead: 'Observations from playtests and reviews. Example notes — no real testers took part.',
    meta: { status: 'Ongoing', confidence: 'Medium', source: 'Example playtests', decision: 'Notes feed decisions', question: 'Do we need a third tester before accepting D-03?', prototype: 'Tested on HUD v0.4–0.5', updated: '2026-10-05' },
    items: [
      { id: 'n-01', date: '2026-10-01', kind: 'Observation', title: 'Rings read well on grass', text: 'Green rings stayed visible at every zoom level. Outline-only variant from the sketch was missed twice.', link: 'D-02' },
      { id: 'n-02', date: '2026-10-02', kind: 'Question', title: 'Is the right inspector hiding the keep?', text: 'With the keep selected, the inspector covers the south-east wall at small window sizes.', link: 'D-04' },
      { id: 'n-03', date: '2026-10-03', kind: 'Bug', title: 'Units walked over the keep', text: 'Move orders across the keep ignored the walls. Fixed in v0.5: units slide around the walls.' },
      { id: 'n-04', date: '2026-10-04', kind: 'Observation', title: 'Testers looked for gold at the bottom', text: 'Two of three testers searched the bottom edge for resources first, then found them top-left.', link: 'D-03' },
      { id: 'n-05', date: '2026-10-04', kind: 'Observation', title: 'Threat noticed via the edge pulse', text: 'With sound off, the red edge pulse was noticed before the banner. The minimap ping went unnoticed.', link: 'D-06' },
      { id: 'n-06', date: '2026-10-05', kind: 'Question', title: 'Is “whole army” on A too strong?', text: 'One tester pulled the archers off the walls by accident.', link: 'D-07' },
    ],
  };

  data.todo = {
    lead: 'What happens next. Ticks are saved in this browser only, so each reader keeps their own copy.',
    meta: { status: 'Active', confidence: 'High', source: 'Planning', decision: 'Prototype before content', question: 'Is sound needed before the next playtest?', prototype: 'v0.6 planned', updated: '2026-10-05' },
    groups: [
      { title: 'Now', items: [
        { id: 't-walls', text: 'Stop units walking over the keep walls (N-03)' },
        { id: 't-sound', text: 'Add a threat sound cue and re-run the sound-on/off test', link: 'D-06' },
        { id: 't-a-army', text: 'Decide A-with-empty-selection (D-07)', link: 'D-07' },
        { id: 't-bottom', text: 'Compare right vs bottom inspector with two testers', link: 'D-04' },
      ] },
      { title: 'Next', items: [
        { id: 't-compass', text: 'Prototype the threat compass (promoted idea)' },
        { id: 't-seven', text: 'Design the group view for seven or more types', link: 'D-08' },
        { id: 't-orders-pause', text: 'Try orders while paused', link: 'D-09' },
      ] },
      { title: 'Later', items: [
        { id: 't-siege', text: 'Siege engines so the barrow can be razed' },
        { id: 't-levels', text: 'Unit levels from combat experience' },
        { id: 't-barks', text: 'Voice barks for alerts' },
      ] },
    ],
    done: ['t-walls'],
  };

  data.devlog = {
    lead: 'A fictional five-day log showing how the prototype moved from research to a tested HUD.',
    meta: { status: 'Example log', confidence: 'High', source: 'This workspace', decision: '—', question: 'What should Day 06 test?', prototype: 'HUD v0.5', updated: '2026-10-05' },
    items: [
      { id: 'day-01', day: 'Day 01', title: 'Research', date: '2026-10-01', text: 'Studied RTS interfaces. Wrote four competitor notes and the first comparison matrix.', changed: ['Competitors', 'References'], stage: 'Research' },
      { id: 'day-02', day: 'Day 02', title: 'First HUD', date: '2026-10-02', text: 'Created the initial HUD concept: bottom console, permanent panel. Felt heavy immediately.', changed: ['UX Patterns', 'D-01 drafted'], stage: 'Design' },
      { id: 'day-03', day: 'Day 03', title: 'Selection system', date: '2026-10-03', text: 'Added unit and building selection, rings, box select and the contextual inspector.', changed: ['D-01', 'D-02', 'HUD v0.3'], stage: 'Prototype' },
      { id: 'day-04', day: 'Day 04', title: 'Prototype', date: '2026-10-04', text: 'Created the first interactive HTML prototype with all twelve demo states. First playtest notes.', changed: ['HUD v0.4', 'N-01 – N-05'], stage: 'Test' },
      { id: 'day-05', day: 'Day 05', title: 'Iteration', date: '2026-10-05', text: 'Reduced HUD density and improved contextual information. Gold moved beside the General portrait after N-04. Units now slide around the keep walls.', changed: ['D-03 testing', 'D-05', 'HUD v0.5'], stage: 'Iterate' },
    ],
  };
})();
