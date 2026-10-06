/* Research › UX Patterns. Each card turns a problem into a reusable pattern
   and a decision, then links to the HUD state that demonstrates it. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  data.uxPatterns = {
    lead: 'Problems we expect players to hit, the pattern that answers each one, and the decision it led to. Every card links to a live HUD state.',
    meta: { status: 'Active', confidence: 'Medium', source: 'Competitor notes + playtest notes', decision: '7 patterns → 7 decisions', question: 'Do redundant threat signals feel noisy over a long match?', prototype: 'All patterns testable', updated: '2026-10-03' },
    items: [
      { id: 'selection-feedback', title: 'Selection feedback', problem: 'Players need immediate visual confirmation of what they selected.',
        pattern: 'Highlight selected entities with a strong but unobtrusive indicator.',
        decision: 'Use a circular ground indicator plus a contextual information panel.', decisionId: 'D-02', state: 'swordsman', seen: ['warcraft-iii', 'age-of-empires-iv'] },
      { id: 'information-density', title: 'Information density', problem: 'RTS games contain a lot of information.',
        pattern: 'Progressively reveal information based on selection.',
        decision: 'Keep the default HUD minimal.', decisionId: 'D-03', state: 'none', seen: ['age-of-empires-iv'] },
      { id: 'threat-communication', title: 'Threat communication', problem: 'Players must understand danger immediately.',
        pattern: 'Use animation + icon + colour + sound.',
        decision: 'Use multiple lightweight signals instead of one huge notification.', decisionId: 'D-06', state: 'keep-threat', seen: ['they-are-billions'] },
      { id: 'hero-visibility', title: 'Hero visibility', problem: 'The hero matters most but gets lost in a crowd.',
        pattern: 'A persistent portrait that mirrors state and selects on click.',
        decision: 'General portrait fixed top-left with a health ring.', decisionId: 'D-05', state: 'general', seen: ['warcraft-iii'] },
      { id: 'group-readability', title: 'Group readability', problem: 'Large selections turn into an unreadable wall of portraits.',
        pattern: 'Aggregate by unit type; show counts and combined health.',
        decision: 'One card per type, up to six types in two rows.', decisionId: 'D-08', state: 'group6', seen: ['total-war'] },
      { id: 'command-confirmation', title: 'Command confirmation', problem: 'After pressing a hotkey, players are unsure the game is waiting for a target.',
        pattern: 'Change the cursor and name the pending order on screen.',
        decision: 'Reticle cursor + banner naming the order and its recipients.', decisionId: 'D-07', state: 'command', seen: ['warcraft-iii'] },
      { id: 'soft-failure', title: 'Soft failure', problem: 'Losing the hero can feel like losing the game.',
        pattern: 'Make the loss visible and temporary, with a clear way back.',
        decision: 'Greyed portrait, respawn timer and a morale penalty — no game over.', decisionId: 'D-10', state: 'fallen', seen: [] },
    ],
  };
})();
