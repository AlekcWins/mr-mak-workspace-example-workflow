/* Example Stephan Workflow — workspace shell.
   Hash router (#/section/page?item=…), sidebar, search / command palette,
   context rail, tooltips and one renderer per page. Content lives in the
   data files under research/, references/, design/, prototype/ and notes/. */
(() => {
  const OW = (window.OW ||= {});
  const D = OW.data, ART = OW.art, E = D.entities, icon = ART.icon;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* Storage may be unavailable; state stays in memory. */ } },
  };

  /* ======================= Navigation model ======================= */
  const NAV = [
    { group: 'Discover', items: [['discover/overview', 'Overview', 'compass']] },
    { group: 'Research', items: [['research/competitors', 'Competitors', 'target'], ['research/references', 'References', 'image'], ['research/ux-patterns', 'UX Patterns', 'pattern'], ['research/decisions', 'Design Decisions', 'decision']] },
    { group: 'The World', items: [['world/characters', 'Characters', 'user'], ['world/factions', 'Factions', 'flag'], ['world/locations', 'Locations', 'pin'], ['world/buildings', 'Buildings', 'castle']] },
    { group: 'Game Design', items: [['design/mechanics', 'Mechanics', 'cog'], ['design/interface', 'Interface', 'layout'], ['design/controls', 'Controls', 'keyboard'], ['design/progression', 'Progression', 'trend'], ['design/storytelling', 'Storytelling', 'book']] },
    { group: 'Prototype', items: [['prototype/hud', 'HUD', 'monitor'], ['prototype/units', 'Units', 'sword'], ['prototype/buildings', 'Buildings', 'tower'], ['prototype/combat', 'Combat', 'swords']] },
    { group: 'Development', items: [['development/ideas', 'Ideas', 'bulb'], ['development/notes', 'Notes', 'note'], ['development/todo', 'TODO', 'list'], ['development/devlog', 'DevLog', 'clock']] },
  ];
  const PAGES = new Map();
  NAV.forEach(g => g.items.forEach(([route, title, ic]) => PAGES.set(route, { route, title, icon: ic, group: g.group })));
  const HOME = 'discover/overview';
  // Where each page sits in the research → iterate pipeline.
  const STAGE_OF = route => ({
    'research/competitors': 'research', 'research/references': 'references', 'research/ux-patterns': 'design', 'research/decisions': 'design',
    'development/notes': 'test', 'development/ideas': 'iterate', 'development/todo': 'iterate', 'development/devlog': 'iterate',
  }[route] || (route.startsWith('prototype/') ? 'prototype' : route.startsWith('world/') || route.startsWith('design/') ? 'design' : null));

  /* ======================= Small components ======================= */
  const href = (route, item) => `#/${route}${item ? `?item=${encodeURIComponent(item)}` : ''}`;
  const hudHref = params => `#/prototype/hud?${new URLSearchParams(params)}`;
  const TONE = { accepted: 'ok', implemented: 'ok', promoted: 'ok', testing: 'warn', partial: 'warn', exploring: 'info', open: 'info', draft: 'info', rejected: 'bad', 'not started': 'mute', parked: 'mute', bug: 'bad', question: 'info', observation: 'ok' };
  const pill = text => `<span class="pill ${TONE[String(text).toLowerCase()] || 'mute'}">${esc(text)}</span>`;
  const conf = level => { const n = { low: 1, medium: 2, high: 3 }[String(level).toLowerCase()] || 0; return `<span class="conf" data-tip="Confidence: ${esc(level)}" data-tip-body="How sure we are, from research and testing so far."><i class="${n >= 1 ? 'on' : ''}"></i><i class="${n >= 2 ? 'on' : ''}"></i><i class="${n >= 3 ? 'on' : ''}"></i><span>${esc(level)}</span></span>`; };
  const decision = id => (D.decisions.items.find(d => d.id === id.toLowerCase()) || {});
  const decLink = id => { const d = decision(id); return `<a class="chip-dec" href="${href('research/decisions', id.toLowerCase())}" ${d.decision ? `data-tip="${esc(id)} · ${esc(d.decision)}" data-tip-body="Status: ${esc(d.status)}"` : ''}>${esc(id)}</a>`; };
  const tryHud = (params, label = 'Try in HUD') => `<a class="btn sm" href="${hudHref(params)}">${icon('play')}${esc(label)}</a>`;
  const section = (id, title, body, aside = '') => `<section class="sec" id="${id}" data-toc="${esc(title)}"><div class="sec-head"><h2>${esc(title)}</h2>${aside}</div>${body}</section>`;
  const notice = (text, kind = 'example') => `<div class="notice ${kind}">${icon(kind === 'example' ? 'flag' : 'alert')}<span>${text}</span></div>`;
  const field = (label, value, cls = '') => `<div class="field ${cls}"><span class="mini-label">${esc(label)}</span><div>${value}</div></div>`;
  const metaChips = meta => `<div class="ph-meta">
      <span class="mchip"><span>Status</span>${esc(meta.status)}</span>
      <span class="mchip"><span>Confidence</span>${conf(meta.confidence)}</span>
      <span class="mchip"><span>Prototype</span>${esc(meta.prototype)}</span>
      <span class="mchip"><span>Updated</span><time>${esc(meta.updated)}</time></span></div>`;
  const header = (route, lead, meta, extra = '') => {
    const p = PAGES.get(route);
    return `<header class="ph"><div class="ph-eyebrow">${esc(p.group)} <span>/</span> ${esc(p.title)}</div>
      <h1 class="ph-title">${esc(p.route === 'prototype/hud' ? 'HUD Prototype' : p.route === 'research/decisions' ? 'Design Decisions' : p.title)}</h1>
      <p class="ph-lead">${esc(lead)}</p>${metaChips(meta)}${extra}</header>`;
  };
  const filterBar = (name, values, counts = {}) => `<div class="filters" role="group" aria-label="Filter ${esc(name)}" data-filter="${esc(name)}">
      <button class="fchip on" data-value="all" aria-pressed="true">All<span>${Object.values(counts).reduce((a, b) => a + b, 0) || ''}</span></button>
      ${values.map(v => `<button class="fchip" data-value="${esc(v)}" aria-pressed="false">${esc(v)}${counts[v] !== undefined ? `<span>${counts[v]}</span>` : ''}</button>`).join('')}</div>`;
  const countBy = (list, key) => list.reduce((m, x) => ((m[x[key]] = (m[x[key]] || 0) + 1), m), {});
  const statMax = { hp: 620, atk: 30, armor: 8, range: 150, speed: 104 };
  const statBars = u => [['HP', 'hp'], ['ATK', 'atk'], ['ARM', 'armor'], ['RNG', 'range'], ['SPD', 'speed']]
    .map(([l, k]) => `<div class="sbar"><span>${l}</span><i><b style="width:${Math.min(100, (u[k] / statMax[k]) * 100).toFixed(0)}%"></b></i><em>${u[k]}</em></div>`).join('');
  const sourceLink = id => {
    const c = D.competitors.items.find(x => x.id === id); if (c) return `<a href="${href('research/competitors', id)}">${esc(c.name)}</a>`;
    const p = D.uxPatterns.items.find(x => x.id === id); if (p) return `<a href="${href('research/ux-patterns', id)}">${esc(p.title)}</a>`;
    const n = D.notes.items.find(x => x.id === id); if (n) return `<a href="${href('development/notes', id)}">${esc(n.id.toUpperCase())} · ${esc(n.title)}</a>`;
    return esc(id);
  };
  const stateLabel = id => D.prototype.states.find(s => s.id === id)?.label || id;

  /* ======================= Page renderers ======================= */
  const PAGE = {};

  PAGE['discover/overview'] = {
    meta: () => D.workflow.meta,
    render() {
      const W = D.workflow;
      const nodes = W.pipeline.map((s, i) => `<a class="pipe-node" href="#/${s.route}" data-stage="${s.id}"><span class="pn-n">0${i + 1}</span><span class="pn-label">${esc(s.label)}</span></a>${i < W.pipeline.length - 1 ? `<span class="pipe-arrow" aria-hidden="true">${icon('arrow')}</span>` : ''}`).join('');
      const stats = [[String(PAGES.size), 'pages'], [String(D.prototype.states.length), 'HUD states'], [String(D.decisions.items.length), 'decisions'], [String(D.notes.items.length), 'playtest notes'], [String(Object.keys(E.units).length), 'unit types']];
      return `<header class="ph ph-hero">
          <div class="ph-eyebrow">Discover <span>/</span> Overview</div>
          <h1 class="ph-title">Example Stephan Workflow</h1>
          <p class="ph-sub">AI-assisted research → design → prototype</p>
          <p class="ph-lead">A complete example workspace for <b>OVERLORD</b>, a fictional dark-fantasy RTS. It shows how a developer and an AI agent can move from studying other games to a working, testable HUD prototype — with every step, reason and open question written down.</p>
          <div class="ph-actions"><a class="btn primary" href="#/prototype/hud">${icon('play')}Open the HUD prototype</a><a class="btn" href="#/research/decisions">${icon('decision')}Read the decisions</a><button class="btn" data-open-search>${icon('search')}Search everything <kbd>/</kbd></button></div>
          ${metaChips(W.meta)}</header>
        ${notice('Example project. OVERLORD is fictional; research notes, playtests and log entries illustrate the workflow and are not real findings.')}
        ${section('pipeline', 'Pipeline', `<div class="pipe">${nodes}</div><div class="pipe-loop">${icon('loop')}<span>Iterate feeds back into Design — the loop runs once per prototype version.</span></div>`)}
        ${section('stages', 'Six stages', `<div class="grid g3">${W.stages.map(s => `<article class="card stage" data-item="${slug(s.title)}">
            <div class="stage-n">${s.n} — ${esc(s.title)}</div><p>${esc(s.text)}</p>
            <dl class="kv"><dt>AI agent</dt><dd>${esc(s.ai)}</dd><dt>You</dt><dd>${esc(s.human)}</dd><dt>Output</dt><dd><a href="#/${s.route}">${esc(s.output)} →</a></dd></dl></article>`).join('')}</div>`)}
        ${section('trace', 'How one decision travels', `<p class="sec-lead">Follow a single idea from a competitor note to a change in the prototype. Every step is a link.</p>
          <ol class="trace">${W.trace.map(t => `<li><a href="#/${t.route}"><span class="mini-label">${esc(t.stage)}</span>${esc(t.title)}</a></li>`).join('')}</ol>`)}
        ${section('at-a-glance', 'Workspace at a glance', `<div class="tiles">${stats.map(([n, l]) => `<div class="tile"><b>${n}</b><span>${l}</span></div>`).join('')}</div>
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Folder</th><th>What lives there</th></tr></thead><tbody>${W.folders.map(([f, t]) => `<tr><td><code>${esc(f)}</code></td><td>${esc(t)}</td></tr>`).join('')}</tbody></table></div>`)}`;
    },
  };

  PAGE['research/competitors'] = {
    meta: () => D.competitors.meta,
    render() {
      const C = D.competitors;
      const rows = [['wellDone', 'What it does well'], ['pattern', 'UI pattern'], ['strength', 'Strength'], ['weakness', 'Weakness'], ['idea', 'Useful idea'], ['avoid', 'What we should NOT copy']];
      return `${header('research/competitors', C.lead, C.meta)}
        ${notice('<b>Example research notes</b> — short impressions written to demonstrate the workflow, not an authoritative analysis of these games.')}
        ${section('notes', 'Competitor notes', `<div class="grid g2">${C.items.map(c => `<article class="card comp" data-item="${c.id}">
            <div class="card-head"><div><h3>${esc(c.name)}</h3><span class="sub-line">${esc(c.year)} · ${esc(c.genre)}</span></div>
              <div class="card-tags"><span class="pill info" data-tip="Relevance to OVERLORD">${esc(c.relevance)} relevance</span>${conf(c.confidence)}</div></div>
            <div class="fields">${rows.map(([k, l]) => field(l, esc(c[k]), k === 'avoid' ? 'avoid' : k === 'idea' ? 'idea' : '')).join('')}</div>
            <div class="card-foot"><span class="mini-label">Source</span><span class="muted">Example research</span><span class="grow"></span>${c.decisions.map(decLink).join('')}</div></article>`).join('')}</div>`)}
        ${section('matrix', 'Comparison matrix', `<div class="tbl-wrap"><table class="tbl matrix"><thead><tr><th></th>${C.matrix.cols.map(c => `<th${c.includes('ours') ? ' class="ours"' : ''}>${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>${C.matrix.rows.map((r, i) => `<tr><th>${esc(r)}</th>${C.matrix.cells[i].map((v, j) => `<td${j === C.matrix.cols.length - 1 ? ' class="ours"' : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)}`;
    },
  };

  PAGE['research/references'] = {
    meta: () => D.references.meta,
    render() {
      const R = D.references;
      return `${header('research/references', R.lead, R.meta)}
        ${notice('Every image on this board is a <b>generated placeholder block</b> stored in <code>assets/references/</code>. None is a real screenshot or an external source. Click an image to preview or download it.')}
        ${section('board', 'Reference board', `${filterBar('category', R.categories, countBy(R.items, 'category'))}
          <div class="grid g3 refs">${R.items.map(r => `<article class="card ref" data-item="${r.id}" data-category="${esc(r.category)}">
            <figure><img src="${r.image}" alt="${esc(r.title)} — placeholder reference block" loading="lazy" width="640" height="400"><figcaption><span class="pill mute">${esc(r.category)}</span><span class="ph-tag">Placeholder</span></figcaption></figure>
            <h3>${esc(r.title)}</h3><p>${esc(r.desc)}</p>
            ${field('Source', esc(r.source))}${field('What we learn', esc(r.learn), 'idea')}</article>`).join('')}</div>`)}`;
    },
    after: root => bindFilter(root, 'category', '.ref', 'category'),
  };

  PAGE['research/ux-patterns'] = {
    meta: () => D.uxPatterns.meta,
    render() {
      const U = D.uxPatterns;
      return `${header('research/ux-patterns', U.lead, U.meta)}
        ${section('patterns', 'Patterns', `<div class="grid g2">${U.items.map(p => `<article class="card pattern" data-item="${p.id}">
            <div class="card-head"><h3>${esc(p.title)}</h3>${decLink(p.decisionId)}</div>
            <div class="pps"><div class="pp"><span class="mini-label">Problem</span><p>${esc(p.problem)}</p></div>
              <div class="pp"><span class="mini-label">Pattern</span><p>${esc(p.pattern)}</p></div>
              <div class="pp decision"><span class="mini-label">Decision</span><p>${esc(p.decision)}</p></div></div>
            <div class="card-foot"><span class="mini-label">Seen in</span>${p.seen.length ? p.seen.map(sourceLink).join('<span class="dot">·</span>') : '<span class="muted">Our own idea</span>'}<span class="grow"></span>${tryHud({ state: p.state }, `HUD: ${stateLabel(p.state)}`)}</div></article>`).join('')}</div>`)}`;
    },
  };

  PAGE['research/decisions'] = {
    meta: () => D.decisions.meta,
    render() {
      const R = D.decisions, statuses = ['Accepted', 'Testing', 'Open', 'Rejected'];
      return `${header('research/decisions', R.lead, R.meta)}
        ${section('table', 'Decision table', `${filterBar('status', statuses, countBy(R.items, 'status'))}
          <div class="tbl-wrap"><table class="tbl decisions"><thead><tr><th>ID</th><th>Decision</th><th>Reason</th><th>Alternatives</th><th>Status</th><th><span class="sr">Prototype</span></th></tr></thead>
          <tbody>${R.items.map(d => `<tr class="drow" data-item="${d.id}" data-status="${d.status}" tabindex="0" aria-expanded="false">
              <td><code>${d.id.toUpperCase()}</code></td><td><b>${esc(d.decision)}</b></td><td>${esc(d.reason)}</td><td class="muted">${esc(d.alternatives)}</td><td>${pill(d.status)}</td>
              <td><a class="btn sm ghost" href="${hudHref({ state: d.state })}" data-tip="Open the HUD in this state" data-tip-body="${esc(stateLabel(d.state))}">${icon('play')}HUD</a></td></tr>
            <tr class="ddetail" data-for="${d.id}" data-status="${d.status}" hidden><td></td><td colspan="5"><div class="dd">
              ${field('Context', esc(d.context))}${field('Consequence', esc(d.consequence))}${field('Evidence', d.sources.map(sourceLink).join('<span class="dot">·</span>'))}</div></td></tr>`).join('')}</tbody></table></div>`)}
        ${section('legend', 'Status legend', `<div class="legend-row">${pill('Accepted')}<span>Built into the prototype and agreed.</span>${pill('Testing')}<span>Built, waiting for playtest evidence.</span>${pill('Open')}<span>Built as a guess; needs a decision.</span>${pill('Rejected')}<span>Tried and dropped; kept for history.</span></div>`)}`;
    },
    after(root) {
      const toggle = row => {
        const detail = root.querySelector(`.ddetail[data-for="${row.dataset.item}"]`);
        const open = detail.hidden;
        detail.hidden = !open; row.setAttribute('aria-expanded', String(open)); row.classList.toggle('open', open);
      };
      root.querySelectorAll('.drow').forEach(row => {
        row.addEventListener('click', e => { if (!e.target.closest('a')) toggle(row); });
        row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(row); } });
      });
      bindFilter(root, 'status', '.drow, .ddetail', 'status', (el, show) => { if (el.classList.contains('ddetail')) el.hidden = !show || !root.querySelector(`.drow[data-item="${el.dataset.for}"]`).classList.contains('open'); else el.hidden = !show; });
    },
    focus(root, item) { const row = root.querySelector(`.drow[data-item="${item}"]`); if (row && !row.classList.contains('open')) row.click(); return row; },
  };

  PAGE['world/characters'] = {
    meta: () => D.characters.meta,
    render() {
      const C = D.characters;
      return `${header('world/characters', C.lead, C.meta)}
        ${section('cast', 'Cast', `<div class="grid g3">${C.items.map(c => {
          const u = c.unit && E.units[c.unit];
          const traits = u ? u.traits : c.traits, abilities = c.abilities || (u ? u.abilities.map(a => E.abilities[a].name) : []);
          return `<article class="card char${u?.hero ? ' hero' : ''}${u && E.factions[u.faction].team === 'enemy' || !u ? ' hostile' : ''}" data-item="${c.id}">
            <div class="char-top"><div class="char-portrait">${ART.portrait(c.portrait || c.unit)}</div>
              <div><h3>${esc(c.title)}</h3><span class="sub-line">${esc(c.role || u.role)}</span><blockquote>“${esc(c.quote)}”</blockquote></div></div>
            <p>${esc(c.bio)}</p>
            ${field('Traits', `<div class="chips">${traits.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>`)}
            ${field('Abilities', `<div class="chips">${abilities.map(t => `<span class="chip acc">${esc(t)}</span>`).join('')}</div>`)}
            ${u ? `<div class="sbars">${statBars({ hp: u.hp, atk: u.atk, armor: u.armor, range: u.range, speed: u.speed })}</div>
              <div class="card-foot"><span class="mini-label">Source</span><code>prototype/entities.js</code><span class="grow"></span>${tryHud({ select: c.unit }, 'Inspect in HUD')}</div>`
              : '<div class="card-foot"><span class="pill mute">Not in prototype</span></div>'}</article>`;
        }).join('')}</div>`)}`;
    },
  };

  PAGE['world/factions'] = {
    meta: () => D.factions.meta,
    render() {
      const F = D.factions;
      return `${header('world/factions', F.lead, F.meta)}
        ${section('factions', 'Factions', `<div class="grid g3">${F.items.map(f => `<article class="card faction" data-item="${f.id}" style="--fc:${f.colour}">
            <div class="faction-top"><div class="crest">${ART.factionCrest(f.crest)}</div><div><h3>${esc(f.name)}</h3><span class="sub-line">${esc(f.role)}</span></div></div>
            <p>${esc(f.text)}</p>${field('Play style', esc(f.style))}
            ${field('Units', f.units.length ? `<div class="mini-portraits">${f.units.map(u => `<a href="${href('prototype/units', u)}" data-tip="${esc(E.units[u].name)}" data-tip-body="${esc(E.units[u].role)}">${ART.portrait(u)}</a>`).join('')}</div>` : '<span class="muted">No combat units — economy only.</span>')}
            <div class="swatch-row"><i style="background:${f.colour}"></i><code>${f.colour}</code><span class="muted">ownership colour</span></div></article>`).join('')}</div>`)}
        ${section('relations', 'Relations', `<div class="tbl-wrap"><table class="tbl matrix"><thead><tr>${F.relations[0].map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${F.relations.slice(1).map(r => `<tr><th>${esc(r[0])}</th>${r.slice(1).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)}`;
    },
  };

  PAGE['world/locations'] = {
    meta: () => D.locations.meta,
    render() {
      const L = D.locations;
      return `${header('world/locations', L.lead, L.meta)}<svg class="defs-only" aria-hidden="true"><defs>${ART.defs}</defs></svg>
        ${section('places', 'Places', `<div class="grid g3">${L.items.map(l => {
          const loc = D.map.locations.find(m => m.id === l.id);
          return `<article class="card loc" data-item="${l.id}"><div class="loc-map"><canvas data-loc="${l.id}" width="640" height="360" aria-label="Terrain crop around ${esc(loc.name)}"></canvas><svg class="loc-overlay" aria-hidden="true"></svg><span class="loc-coords">${loc.x}, ${loc.y}</span></div>
            <div class="card-head"><h3>${esc(loc.name)}</h3><span class="pill mute">${esc(l.type)}</span></div><p>${esc(l.text)}</p>
            ${field('Design note', esc(l.note))}<div class="card-foot"><span class="mini-label">Source</span><code>prototype/map.js</code><span class="grow"></span>${tryHud({ focus: l.id }, 'Show in HUD')}</div></article>`;
        }).join('')}</div>`)}`;
    },
    after(root) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        root.querySelectorAll('canvas[data-loc]').forEach(c => {
          if (!c.isConnected) return;
          const loc = D.map.locations.find(m => m.id === c.dataset.loc);
          const w = Math.max(loc.r * 2.8, 420), h = (w * 9) / 16;
          const sx = Math.max(0, Math.min(D.map.size.w - w, loc.x - w / 2)), sy = Math.max(0, Math.min(D.map.size.h - h, loc.y - h / 2));
          OW.terrain.drawInto(c, sx, sy, w, h);
          // Buildings are SVG in the HUD, not part of the terrain canvas: draw the same art over the crop.
          const inside = D.map.buildings.filter(b => b.x > sx - 160 && b.x < sx + w + 160 && b.y > sy - 160 && b.y < sy + h + 160);
          const svg = c.nextElementSibling;
          svg.setAttribute('viewBox', `${sx} ${sy} ${w} ${h}`);
          svg.innerHTML = `${inside.map(b => `<g transform="translate(${b.x} ${b.y})">${ART.building(b.type)}</g>`).join('')}
            <circle cx="${loc.x}" cy="${loc.y}" r="${loc.r * 0.8}" fill="none" stroke="#ffd27a" stroke-width="${w / 320}" stroke-dasharray="${w / 80} ${w / 106}"/>`;
        });
      }));
    },
  };

  PAGE['world/buildings'] = {
    meta: () => D.worldBuildings.meta,
    render() {
      const B = D.worldBuildings;
      return `${header('world/buildings', B.lead, B.meta)}
        ${section('holdings', 'Holdings and landmarks', `<div class="grid g3">${B.items.map(b => `<article class="card bld" data-item="${b.id}">
            <div class="char-top"><div class="char-portrait">${ART.portrait(b.portrait)}</div><div><h3>${esc(b.name)}</h3><span class="sub-line">${esc(b.role)}</span></div></div>
            <p>${esc(b.text)}</p>${field('Upgrade path', `<div class="chips">${b.upgrades.map(u => `<span class="chip">${esc(u)}</span>`).join('<span class="dot">→</span>')}</div>`)}
            <div class="card-foot">${b.inPrototype ? `${pill('Implemented')}<span class="grow"></span>${tryHud({ select: b.id }, 'Inspect in HUD')}` : pill('Not started')}</div></article>`).join('')}</div>`)}`;
    },
  };

  PAGE['design/mechanics'] = {
    meta: () => D.mechanics.meta,
    render() {
      const M = D.mechanics;
      return `${header('design/mechanics', M.lead, M.meta)}
        ${section('mechanics', 'Mechanics', `<div class="grid g2">${M.items.map(m => `<article class="card mech" data-item="${m.id}">
            <div class="card-head"><h3>${esc(m.title)}</h3>${pill(m.status)}</div>
            <ol class="flow4"><li><span class="mini-label">Concept</span>${esc(m.concept)}</li><li><span class="mini-label">Rule</span>${esc(m.rule)}</li><li><span class="mini-label">UI representation</span>${esc(m.ui)}</li><li><span class="mini-label">Prototype status</span>${pill(m.status)}</li></ol>
            <div class="card-foot"><span class="grow"></span>${m.state ? tryHud({ state: m.state }) : `<a class="btn sm" href="#/${m.route}">${icon('arrow')}Open</a>`}</div></article>`).join('')}</div>`)}`;
    },
  };

  PAGE['design/interface'] = {
    meta: () => D.interfaceSpec.meta,
    render() {
      const I = D.interfaceSpec, sym = ['○', '●', '◐'];
      return `${header('design/interface', I.lead, I.meta)}
        ${section('anatomy', 'HUD anatomy', `<div class="anatomy" aria-label="HUD zones diagram">
            <div class="az z1"><b>1</b>Command bar</div><div class="az z2"><b>2</b>Banners</div><div class="az z3"><b>3</b>System</div>
            <div class="az z6"><b>6</b>Battlefield</div><div class="az z4"><b>4</b>Minimap</div><div class="az z5"><b>5</b>Inspector</div></div>
          <p class="sec-lead">${tryHud({ state: 'none' }, 'Compare with the live HUD')}</p>`)}
        ${section('zones', 'Zones', `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Zone</th><th>Where</th><th>Content</th><th>Visible</th><th>Decision</th></tr></thead>
          <tbody>${I.zones.map(z => `<tr><td><code>${z.n}</code></td><td><b>${esc(z.name)}</b></td><td>${esc(z.where)}</td><td>${esc(z.content)}</td><td class="muted">${esc(z.visible)}</td><td>${z.decision.split(' / ').map(decLink).join(' ')}</td></tr>`).join('')}</tbody></table></div>`)}
        ${section('state-matrix', 'States × zones', `<div class="tbl-wrap"><table class="tbl matrix center"><thead><tr><th>State</th>${I.matrix.zones.map(z => `<th>${esc(z)}</th>`).join('')}</tr></thead>
          <tbody>${I.matrix.states.map((s, i) => `<tr><th>${esc(s)}</th>${I.matrix.cells[i].map(v => `<td class="sym s${v}">${sym[v]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
          <p class="foot-note">● shown · ◐ shown and changed (e.g. the active ability glows) · ○ hidden</p>`)}`;
    },
  };

  PAGE['design/controls'] = {
    meta: () => D.controls.meta,
    render() {
      const C = D.controls;
      // Render pure key combos ("Q W E R", "/ or Ctrl+K", "+ / −") as <kbd>; leave descriptions as text.
      const KEY = /^(?:[A-Z]|[+−/]|Esc|Space|Ctrl\+K)$/;
      const keys = s => {
        const t = s.split(' ');
        if (!t.every(x => KEY.test(x) || x === 'or')) return esc(s);
        return t.map((x, i) => (x === 'or' || (x === '/' && i > 0) ? x : `<kbd>${esc(x)}</kbd>`)).join(' ');
      };
      return `${header('design/controls', C.lead, C.meta)}
        ${C.groups.map(g => section(slug(g.title), g.title, `<div class="tbl-wrap"><table class="tbl controls"><thead><tr><th>Input</th><th>Action</th><th>Note</th></tr></thead>
          <tbody>${g.rows.map(([i, a, n]) => `<tr><td>${keys(i)}</td><td>${esc(a)}</td><td class="muted">${esc(n)}</td></tr>`).join('')}</tbody></table></div>`)).join('')}
        <p class="foot-note">${tryHud({ state: 'none' }, 'Practise in the HUD')}</p>`;
    },
  };

  PAGE['design/progression'] = {
    meta: () => D.progression.meta,
    render() {
      const P = D.progression;
      return `${header('design/progression', P.lead, P.meta)}
        ${section('ranks', 'Unit ranks', `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Rank</th><th>Levels</th><th>Bonus</th><th>HUD</th></tr></thead><tbody>${P.ranks.map(r => `<tr><td><b>${esc(r.name)}</b></td><td><code>${esc(r.levels)}</code></td><td>${esc(r.bonus)}</td><td class="muted">${esc(r.hud)}</td></tr>`).join('')}</tbody></table></div>`)}
        ${section('keep-tiers', 'Keep tiers', `<div class="chain">${P.keep.map((k, i) => `<span class="chain-step"><span class="mini-label">Tier ${i + 1}</span>${esc(k)}</span>`).join(`<span class="pipe-arrow">${icon('arrow')}</span>`)}</div>`)}
        ${section('general-tree', 'General skill tree', `<div class="grid g3">${P.tree.map(b => `<article class="card tree"><h3>${esc(b.branch)}</h3><ol>${b.skills.map(s => `<li>${esc(s)}</li>`).join('')}</ol></article>`).join('')}</div>`)}
        ${section('session', 'A match over time', `<ol class="timeline">${P.timeline.map(([t, x]) => `<li><time>${esc(t)}</time><p>${esc(x)}</p></li>`).join('')}</ol>`)}`;
    },
  };

  PAGE['design/storytelling'] = {
    meta: () => D.storytelling.meta,
    render() {
      const S = D.storytelling;
      return `${header('design/storytelling', S.lead, S.meta)}
        ${section('premise', 'Premise', `<blockquote class="premise">${esc(S.premise)}</blockquote><div class="chips">${S.tone.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>`)}
        ${section('acts', 'Three acts', `<div class="grid g3">${S.acts.map(a => `<article class="card act"><span class="mini-label">${esc(a.n)}</span><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></article>`).join('')}</div>`)}
        ${section('devices', 'Story through the interface', `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Device</th><th>How it tells the story</th></tr></thead><tbody>${S.devices.map(([d, t]) => `<tr><td><b>${esc(d)}</b></td><td>${esc(t)}</td></tr>`).join('')}</tbody></table></div>`)}`;
    },
  };

  PAGE['prototype/hud'] = {
    meta: () => D.prototype.pages.hud.meta,
    wide: true,
    render() {
      const P = D.prototype.pages.hud;
      const files = [['prototype/hud.js', 'Engine: selection, orders, combat, presets, HUD rendering'], ['prototype/prototype.js', 'State list, specs, decisions and open questions'], ['prototype/entities.js', 'Units, buildings, abilities and the damage formula'], ['prototype/map.js', 'World layout, spawns and locations'], ['prototype/terrain.js', 'Procedural terrain painter'], ['prototype/art.js', 'Portraits, sprites, buildings and icons'], ['prototype/hud.css', 'HUD styles']];
      return `${header('prototype/hud', P.lead, P.meta)}
        <section class="sec hud-sec" id="prototype-view" data-toc="Prototype"><div id="hud-root"></div></section>
        ${section('playtest', 'Playtest checklist', `<ol class="checklist">${D.prototype.playtest.map(t => `<li>${esc(t)}</li>`).join('')}</ol>`)}
        ${section('built-with', 'How it is built', `<p class="sec-lead">Plain HTML, CSS and JavaScript — no libraries. Change the data files to change the prototype.</p>
          <div class="tbl-wrap"><table class="tbl"><tbody>${files.map(([f, t]) => `<tr><td><code>${f}</code></td><td>${esc(t)}</td></tr>`).join('')}</tbody></table></div>`)}`;
    },
    after(root, params) {
      OW.hud.mount(root.querySelector('#hud-root'), { state: params.get('state'), select: params.get('select'), focus: params.get('focus') });
    },
  };

  PAGE['prototype/units'] = {
    meta: () => D.prototype.pages.units.meta,
    render() {
      const P = D.prototype.pages.units, rows = Object.entries(E.units);
      return `${header('prototype/units', P.lead, P.meta)}
        ${section('roster', 'Roster', `<div class="tbl-wrap"><table class="tbl units"><thead><tr><th>Unit</th><th>Faction</th><th>HP</th><th>ATK</th><th>ARM</th><th>RNG</th><th>SPD</th><th>Reload</th><th>Cost</th><th>Bonus</th><th>Abilities</th><th><span class="sr">HUD</span></th></tr></thead>
          <tbody>${rows.map(([id, u]) => `<tr data-item="${id}"><td><div class="unit-cell">${ART.portrait(id)}<div><b>${esc(u.name)}</b><span>${esc(u.role)}</span></div></div></td>
            <td>${E.factions[u.faction].team === 'own' ? pill('Crown') : '<span class="pill bad">Barrow</span>'}</td>
            <td class="num">${u.hp}</td><td class="num">${u.atk}</td><td class="num">${u.armor}</td><td class="num">${u.range}</td><td class="num">${u.speed}</td><td class="num">${u.cooldown}s</td><td class="num">${u.cost ?? '—'}</td>
            <td class="muted">${u.bonus ? Object.entries(u.bonus).map(([t, m]) => `×${m} vs ${t}`).join(', ') : u.pierce ? `pierce ${u.pierce}` : '—'}</td>
            <td>${u.abilities.map(a => `<span class="chip" data-tip="${esc(E.abilities[a].name)}" data-tip-body="${esc(E.abilities[a].desc)}">${esc(E.abilities[a].name)}</span>`).join(' ')}</td>
            <td><a class="btn sm ghost" href="${hudHref({ select: id })}">${icon('play')}Inspect</a></td></tr>`).join('')}</tbody></table></div>`)}
        ${section('abilities', 'Ability glossary', `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ability</th><th>Type</th><th>Cooldown</th><th>Effect</th><th>Used by</th></tr></thead>
          <tbody>${Object.entries(E.abilities).map(([id, a]) => {
            const users = [...Object.entries(E.units), ...Object.entries(E.buildings)].filter(([, x]) => x.abilities.includes(id)).map(([, x]) => x.name);
            return `<tr><td><span class="ab-inline">${icon(a.icon)}<b>${esc(a.name)}</b></span></td><td>${pill(a.type)}</td><td class="num">${a.cooldown ? `${a.cooldown}s` : '—'}</td><td>${esc(a.desc)}</td><td class="muted">${esc(users.join(', ') || 'Any selection')}</td></tr>`;
          }).join('')}</tbody></table></div>`)}`;
    },
  };

  PAGE['prototype/buildings'] = {
    meta: () => D.prototype.pages.buildings.meta,
    render() {
      const P = D.prototype.pages.buildings;
      const states = { keep: ['keep', 'keep-threat'], barrow: ['barrow'] };
      return `${header('prototype/buildings', P.lead, P.meta)}
        ${section('selectable', 'Selectable buildings', `<div class="grid g2">${Object.entries(E.buildings).map(([id, b]) => `<article class="card bld" data-item="${id}">
            <div class="char-top"><div class="char-portrait">${ART.portrait(id)}</div><div><h3>${esc(b.name)}</h3><span class="sub-line">${esc(b.role)} · ${esc(E.factions[b.faction].name)}</span></div></div>
            <div class="stat-row"><span><em>HP</em>${b.hp}</span><span><em>ARM</em>${b.armor}</span>${b.garrison ? `<span><em>GARRISON</em>${b.garrison}</span>` : ''}${b.income ? `<span><em>INCOME</em>+${b.income}/s</span>` : ''}${b.spawnEvery ? `<span><em>SPAWN</em>${b.spawnEvery}s</span>` : ''}</div>
            ${field('Abilities', b.abilities.map(a => `<div class="ab-line"><span class="ab-inline">${icon(E.abilities[a].icon)}<b>${esc(E.abilities[a].name)}</b></span><span class="muted">${esc(E.abilities[a].desc)}</span></div>`).join(''))}
            <p class="muted">${esc(b.note)}</p>
            <div class="card-foot"><span class="grow"></span>${(states[id] || []).map(s => tryHud({ state: s }, `HUD: ${stateLabel(s)}`)).join('') || tryHud({ select: id }, 'Inspect in HUD')}</div></article>`).join('')}</div>`)}`;
    },
  };

  PAGE['prototype/combat'] = {
    meta: () => D.prototype.pages.combat.meta,
    render() {
      const P = D.prototype.pages.combat, opts = sel => Object.entries(E.units).map(([id, u]) => `<option value="${id}"${id === sel ? ' selected' : ''}>${esc(u.name)}</option>`).join('');
      const bonusRows = Object.entries(E.units).filter(([, u]) => u.bonus || u.pierce);
      return `${header('prototype/combat', P.lead, P.meta)}
        ${section('formula', 'Damage formula', `<pre class="formula">damage = max(1, round(attack × bonus × modifiers − max(0, armour + armourBuffs − pierce)))</pre>
          <div class="grid g3 small-cards"><div class="card"><span class="mini-label">Bonus</span><p>Type matchups, e.g. Spearman ×1.75 vs cavalry.</p></div><div class="card"><span class="mini-label">Modifiers</span><p>Banner aura +10%, fallen General −15%, Fire Arrows +40% vs buildings.</p></div><div class="card"><span class="mini-label">Armour buffs</span><p>Shield Wall +4, Hold the Line +3 for infantry near the General.</p></div></div>`)}
        ${section('duel', 'Duel calculator', `<div class="duel">
            <div class="duel-in"><label><span class="mini-label">Attacker</span><select data-duel="a">${opts('swordsman')}</select></label>
              <label><span class="mini-label">Defender</span><select data-duel="d">${opts('wight')}</select></label>
              <label class="check"><input type="checkbox" data-duel="banner"> Attacker near the General (+10%)</label>
              <label class="check"><input type="checkbox" data-duel="wall"> Defender in Shield Wall (+4 armour)</label></div>
            <div class="duel-out" aria-live="polite"></div></div>
          <p class="foot-note">Uses <code>OW.data.entities.damage()</code> — the same function as the HUD simulation. Assumes both units are in range and hit on every reload.</p>`)}
        ${section('matchups', 'Type bonuses', `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Unit</th><th>Bonus</th></tr></thead><tbody>${bonusRows.map(([, u]) => `<tr><td><b>${esc(u.name)}</b></td><td>${u.bonus ? Object.entries(u.bonus).map(([t, m]) => `×${m} against ${t}`).join(', ') : ''}${u.pierce ? `${u.bonus ? '; ' : ''}ignores ${u.pierce} armour` : ''}</td></tr>`).join('')}</tbody></table></div>`)}`;
    },
    after(root) {
      const get = k => root.querySelector(`[data-duel="${k}"]`);
      const out = root.querySelector('.duel-out');
      const calc = () => {
        const a = get('a').value, d = get('d').value, ua = E.units[a], ud = E.units[d];
        const ad = E.damage(a, d, { mult: get('banner').checked ? 1.1 : 1, armorBonus: get('wall').checked ? 4 : 0 });
        const da = E.damage(d, a);
        const hitsA = Math.ceil(ud.hp / ad), hitsD = Math.ceil(ua.hp / da);
        const tA = hitsA * ua.cooldown, tD = hitsD * ud.cooldown;
        const win = tA === tD ? 'Draw' : tA < tD ? `${ua.name} wins` : `${ud.name} wins`;
        out.innerHTML = `<div class="duel-side"><span class="mini-label">${esc(ua.name)} → ${esc(ud.name)}</span><b>${ad}</b><span>per hit · ${hitsA} hits · ${tA.toFixed(1)} s to kill</span></div>
          <div class="duel-side"><span class="mini-label">${esc(ud.name)} → ${esc(ua.name)}</span><b>${da}</b><span>per hit · ${hitsD} hits · ${tD.toFixed(1)} s to kill</span></div>
          <div class="duel-win ${tA <= tD ? 'ok' : 'bad'}">${icon(tA <= tD ? 'check' : 'alert')}<b>${esc(win)}</b><span>${Math.abs(tA - tD).toFixed(1)} s margin</span></div>`;
      };
      root.querySelectorAll('[data-duel]').forEach(i => i.addEventListener('input', calc));
      calc();
    },
  };

  PAGE['development/ideas'] = {
    meta: () => D.ideas.meta,
    render() {
      const I = D.ideas;
      return `${header('development/ideas', I.lead, I.meta)}
        ${section('ideas', 'Idea board', `${filterBar('status', I.statuses, countBy(I.items, 'status'))}<div class="grid g3">${I.items.map(i => `<article class="card idea" data-item="${i.id}" data-status="${i.status}">
            <div class="card-head"><h3>${esc(i.title)}</h3>${pill(i.status)}</div><p>${esc(i.text)}</p>${i.link ? `<div class="card-foot"><span class="mini-label">Linked</span>${decLink(i.link)}</div>` : ''}</article>`).join('')}</div>`)}`;
    },
    after: root => bindFilter(root, 'status', '.idea', 'status'),
  };

  PAGE['development/notes'] = {
    meta: () => D.notes.meta,
    render() {
      const N = D.notes;
      return `${header('development/notes', N.lead, N.meta)}
        ${notice('Example notes — written to show how observations feed decisions. No real playtest took place.')}
        ${section('log', 'Playtest notes', `<ol class="notes-list">${N.items.map(n => `<li class="note" data-item="${n.id}"><div class="note-meta"><code>${n.id.toUpperCase()}</code><time>${esc(n.date)}</time>${pill(n.kind)}</div>
            <div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p>${n.link ? `<div class="note-link"><span class="mini-label">Feeds</span>${decLink(n.link)}</div>` : ''}</div></li>`).join('')}</ol>`)}`;
    },
  };

  PAGE['development/todo'] = {
    meta: () => D.todo.meta,
    render() {
      const T = D.todo;
      return `${header('development/todo', T.lead, T.meta)}
        <div class="todo-page"><div class="todo-progress"><div class="bar-lg"><i></i></div><span class="todo-count"></span><button class="btn sm ghost" data-todo-reset>${icon('reset')}Reset ticks</button></div>
        ${T.groups.map(g => section(slug(g.title), g.title, `<ul class="todo">${g.items.map(t => `<li data-item="${t.id}"><label><input type="checkbox" data-todo="${t.id}"><span>${esc(t.text)}</span></label>${t.link ? decLink(t.link) : ''}</li>`).join('')}</ul>`)).join('')}</div>`;
    },
    after(main) {
      const root = main.querySelector('.todo-page');
      const key = 'ow-todo-v1', all = D.todo.groups.flatMap(g => g.items.map(i => i.id));
      let done = new Set(store.get(key, D.todo.done));
      const paint = () => {
        root.querySelectorAll('[data-todo]').forEach(i => { i.checked = done.has(i.dataset.todo); i.closest('li').classList.toggle('done', i.checked); });
        const n = all.filter(id => done.has(id)).length;
        root.querySelector('.bar-lg i').style.width = `${(n / all.length) * 100}%`;
        root.querySelector('.todo-count').textContent = `${n} of ${all.length} done`;
      };
      root.addEventListener('change', e => { const i = e.target.closest('[data-todo]'); if (!i) return; i.checked ? done.add(i.dataset.todo) : done.delete(i.dataset.todo); store.set(key, [...done]); paint(); });
      root.querySelector('[data-todo-reset]').addEventListener('click', () => { done = new Set(D.todo.done); store.set(key, [...done]); paint(); });
      paint();
    },
  };

  PAGE['development/devlog'] = {
    meta: () => D.devlog.meta,
    render() {
      const L = D.devlog;
      return `${header('development/devlog', L.lead, L.meta)}
        ${notice('Fictional example entries. They show the rhythm of the workflow, not a real development history.')}
        ${section('entries', 'Entries', `<ol class="devlog">${L.items.map(d => `<li data-item="${d.id}"><div class="dl-day"><b>${esc(d.day)}</b><time>${esc(d.date)}</time></div>
            <article class="card"><div class="card-head"><h3>${esc(d.day)} — ${esc(d.title)}</h3><span class="pill info">${esc(d.stage)}</span></div><p>${esc(d.text)}</p>
            <div class="chips">${d.changed.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div></article></li>`).join('')}</ol>`)}`;
    },
  };

  /* ---------- Filters ---------- */
  function bindFilter(root, name, selector, attr, apply) {
    const bar = root.querySelector(`[data-filter="${name}"]`);
    if (!bar) return;
    bar.addEventListener('click', e => {
      const b = e.target.closest('.fchip');
      if (!b) return;
      bar.querySelectorAll('.fchip').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
      const v = b.dataset.value;
      root.querySelectorAll(selector).forEach(el => { const show = v === 'all' || el.dataset[attr] === v; apply ? apply(el, show) : (el.hidden = !show); });
    });
  }

  /* ======================= Shell ======================= */
  const $ = s => document.querySelector(s);
  let current = null, liveOff = null;

  function buildShell() {
    const app = $('#app');
    app.innerHTML = `
      <header class="topbar">
        <button class="icon-btn nav-toggle" data-act="nav" aria-label="Open navigation">${icon('menu')}</button>
        <a class="tb-brand" href="#/discover/overview">${ART.emblem('tb-emblem')}<span>Example Stephan Workflow</span></a>
        <nav class="crumbs" aria-label="Breadcrumb"></nav>
        <span class="grow"></span>
        <button class="search-trigger" data-open-search aria-label="Search or run a command">${icon('search')}<span>Search the project…</span><kbd>/</kbd></button>
        <button class="icon-btn ctx-toggle" data-act="ctx" aria-label="Toggle context panel" data-tip="Context panel" data-tip-body="On this page, metadata and workflow stage.">${icon('panel')}</button>
      </header>
      <aside class="sidebar" aria-label="Project navigation">
        <a class="brand" href="#/discover/overview">${ART.emblem('brand-emblem')}<span class="brand-name">OVERLORD</span><span class="brand-sub">Example game</span></a>
        <nav class="nav">${NAV.map(g => `<div class="nav-group"><div class="nav-label">${esc(g.group)}</div>${g.items.map(([r, t, ic]) => `<a class="nav-item" href="#/${r}" data-route="${r}">${icon(ic)}<span>${esc(t)}</span>${r === 'prototype/hud' ? '<em>live</em>' : ''}</a>`).join('')}</div>`).join('')}</nav>
        <div class="side-foot"><span class="mini-label">Example project</span><p>Fictional game and data. Built to show a research → prototype workflow in Mr. Mak.</p><a href="#/prototype/hud">${icon('monitor')}Jump to the prototype</a></div>
      </aside>
      <main class="content" id="content" tabindex="-1"></main>
      <aside class="context" aria-label="Context">
        <div class="ctx-sec"><div class="mini-label">On this page</div><nav class="toc" aria-label="On this page"></nav></div>
        <div class="ctx-sec live" hidden><div class="mini-label">Live prototype <span class="live-dot">live</span></div><dl class="kv mono" data-live></dl></div>
        <div class="ctx-sec"><div class="mini-label">Page metadata</div><dl class="meta-block"></dl></div>
        <div class="ctx-sec"><div class="mini-label">Workflow stage</div><ol class="stage-mini"></ol></div>
      </aside>
      <div class="scrim" data-act="close-drawers"></div>
      <div class="palette" hidden role="dialog" aria-modal="true" aria-label="Search and commands">
        <div class="pal-box"><div class="pal-input">${icon('search')}<input type="text" placeholder="Search pages, notes, decisions… or type a HUD state" aria-label="Search" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div>
          <ul class="pal-results" role="listbox"></ul><div class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div></div></div>`;
  }

  function parse() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query = ''] = raw.split('?');
    return { route: PAGES.has(path) ? path : null, params: new URLSearchParams(query) };
  }

  function render() {
    const { route, params } = parse();
    if (!route) { history.replaceState(null, '', `#/${HOME}`); return render(); }
    if (current === 'prototype/hud') { OW.hud.unmount(); liveOff?.(); liveOff = null; }
    current = route;
    const page = PAGES.get(route), def = PAGE[route], main = $('#content');
    main.innerHTML = def.render(params);
    document.title = `${page.title} · OVERLORD — Example Stephan Workflow`;
    document.body.classList.toggle('wide-page', !!def.wide);
    document.querySelectorAll('.nav-item').forEach(a => { const on = a.dataset.route === route; a.classList.toggle('active', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    $('.crumbs').innerHTML = `<span>${esc(page.group)}</span><span class="sep">/</span><b>${esc(page.title)}</b>`;
    def.after?.(main, params);
    renderContext(route, def.meta());
    closeDrawers();
    const item = params.get('item');
    if (item) requestAnimationFrame(() => focusItem(main, def, item));
    else main.scrollTop = 0;
  }

  function focusItem(main, def, item) {
    const el = def.focus?.(main, item) || main.querySelector(`[data-item="${CSS.escape(item)}"]`);
    if (!el) return;
    el.hidden = false;
    el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }

  function renderContext(route, meta) {
    const main = $('#content');
    const toc = [...main.querySelectorAll('[data-toc]')];
    $('.toc').innerHTML = toc.length ? toc.map(s => `<a href="#${s.id}" data-target="${s.id}">${esc(s.dataset.toc)}</a>`).join('') : '<span class="muted">Browse within this article.</span>';
    const rows = [['Status', esc(meta.status)], ['Confidence', conf(meta.confidence)], ['Source', esc(meta.source)], ['Decision', esc(meta.decision)], ['Open question', esc(meta.question)], ['Prototype status', esc(meta.prototype)], ['Last updated', `<time>${esc(meta.updated)}</time>`]];
    $('.meta-block').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd${k === 'Open question' ? ' class="q"' : ''}>${v}</dd>`).join('');
    const stage = STAGE_OF(route);
    $('.stage-mini').innerHTML = D.workflow.pipeline.map(s => `<li class="${s.id === stage ? 'on' : ''}"><a href="#/${s.route}">${esc(s.label)}</a></li>`).join('');
    const live = $('.ctx-sec.live');
    live.hidden = route !== 'prototype/hud';
    if (route === 'prototype/hud') {
      const paint = s => { if (!s) return; $('[data-live]').innerHTML = [['State', s.label], ['Selection', s.selection], ['Army', `${s.own} vs ${s.enemy}`], ['Gold', s.gold], ['Clock', s.time], ['Camera', s.camera], ['Paused', s.paused ? 'yes' : 'no'], ['Threat', s.threat ? 'active' : 'none']].map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join(''); };
      liveOff = OW.hud.onChange(paint);
      paint(OW.hud.snapshot());
    }
    spy();
  }

  // Highlight the section currently in view.
  function spy() {
    const main = $('#content'), links = [...document.querySelectorAll('.toc a')];
    if (!links.length) return;
    const top = main.getBoundingClientRect().top + 90;
    let active = links[0];
    for (const a of links) { const s = document.getElementById(a.dataset.target); if (s && s.getBoundingClientRect().top <= top) active = a; }
    links.forEach(a => a.classList.toggle('on', a === active));
  }

  /* ---------- Drawers (narrow screens) ---------- */
  function closeDrawers() { document.body.classList.remove('nav-open', 'ctx-open'); }
  function toggleContext() {
    if (matchMedia('(max-width: 1360px)').matches || document.body.classList.contains('wide-page') && matchMedia('(max-width: 1680px)').matches) {
      document.body.classList.toggle('ctx-open'); document.body.classList.remove('nav-open');
    } else {
      document.body.classList.toggle('ctx-hidden');
      store.set('ow-ctx-hidden', document.body.classList.contains('ctx-hidden'));
    }
  }

  /* ======================= Search / command palette ======================= */
  let index = [], results = [], cursor = 0;
  function buildIndex() {
    const add = (label, sub, route, kind = 'page', keywords = '') => index.push({ label, sub, route, kind, hay: `${label} ${sub} ${keywords}`.toLowerCase() });
    for (const p of PAGES.values()) add(p.title === 'HUD' ? 'HUD Prototype' : p.title, p.group, `#/${p.route}`, 'page', p.route);
    D.competitors.items.forEach(c => add(c.name, 'Competitors', href('research/competitors', c.id), 'item', `${c.genre} ${c.idea}`));
    D.references.items.forEach(r => add(r.title, 'References', href('research/references', r.id), 'item', r.category));
    D.uxPatterns.items.forEach(p => add(p.title, 'UX Patterns', href('research/ux-patterns', p.id), 'item', p.problem));
    D.decisions.items.forEach(d => add(`${d.id.toUpperCase()} · ${d.decision}`, `Decision · ${d.status}`, href('research/decisions', d.id), 'item', d.reason));
    D.characters.items.forEach(c => add(c.title, 'Characters', href('world/characters', c.id), 'item'));
    D.factions.items.forEach(f => add(f.name, 'Factions', href('world/factions', f.id), 'item'));
    D.map.locations.forEach(l => add(l.name, 'Locations', href('world/locations', l.id), 'item'));
    D.worldBuildings.items.forEach(b => add(b.name, 'Buildings', href('world/buildings', b.id), 'item'));
    D.mechanics.items.forEach(m => add(m.title, 'Mechanics', href('design/mechanics', m.id), 'item', m.rule));
    Object.entries(E.units).forEach(([id, u]) => add(u.name, 'Units · stats', href('prototype/units', id), 'item', u.role));
    Object.values(E.abilities).forEach(a => add(a.name, 'Ability', '#/prototype/units', 'item', a.desc));
    D.ideas.items.forEach(i => add(i.title, `Idea · ${i.status}`, href('development/ideas', i.id), 'item'));
    D.notes.items.forEach(n => add(`${n.id.toUpperCase()} · ${n.title}`, `Note · ${n.kind}`, href('development/notes', n.id), 'item', n.text));
    D.devlog.items.forEach(d => add(`${d.day} — ${d.title}`, 'DevLog', href('development/devlog', d.id), 'item', d.text));
    D.prototype.states.forEach(s => add(`HUD: ${s.label}`, `Command · ${s.group}`, hudHref({ state: s.id }), 'command', 'state prototype'));
    index.push({ label: 'Reset prototype scenario', sub: 'Command', kind: 'command', hay: 'reset restart scenario prototype command', run: () => { go('#/prototype/hud'); OW.hud.restart(); } });
    index.push({ label: 'Toggle context panel', sub: 'Command', kind: 'command', hay: 'toggle context panel metadata command', run: toggleContext });
  }

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return [index.find(i => i.route === '#/prototype/hud'), index.find(i => i.route === '#/discover/overview'), index.find(i => i.route === '#/research/decisions'), ...index.filter(i => i.kind === 'command').slice(0, 5)].filter(Boolean);
    const words = q.split(/\s+/);
    return index.map(i => {
      if (!words.every(w => i.hay.includes(w))) return null;
      const l = i.label.toLowerCase();
      return { i, score: (l.startsWith(q) ? 0 : l.includes(q) ? 1 : 2) + (i.kind === 'page' ? 0 : 0.5) };
    }).filter(Boolean).sort((a, b) => a.score - b.score).slice(0, 14).map(x => x.i);
  }

  function paintResults() {
    const ul = $('.pal-results');
    if (!results.length) { ul.innerHTML = '<li class="pal-empty">No matches. Try “threat”, “D-05” or “archer”.</li>'; return; }
    ul.innerHTML = results.map((r, i) => `<li role="option" id="pal-${i}" class="${i === cursor ? 'on' : ''}" data-i="${i}" aria-selected="${i === cursor}">${icon(r.kind === 'command' ? 'command' : r.kind === 'page' ? 'folder' : 'arrow')}<span class="pal-label">${esc(r.label)}</span><span class="pal-sub">${esc(r.sub)}</span></li>`).join('');
    $('.pal-input input').setAttribute('aria-activedescendant', `pal-${cursor}`);
    ul.querySelector('.on')?.scrollIntoView({ block: 'nearest' });
  }

  function openPalette() {
    const pal = $('.palette');
    pal.hidden = false; document.body.classList.add('palette-open');
    const input = pal.querySelector('input');
    input.value = ''; cursor = 0; results = search(''); paintResults();
    input.focus();
  }
  function closePalette() { $('.palette').hidden = true; document.body.classList.remove('palette-open'); }
  function go(target) { if (location.hash === target) render(); else location.hash = target; }
  function runResult(r) {
    if (!r) return;
    closePalette();
    if (r.run) r.run(); else go(r.route);
  }

  /* ======================= Tooltips ======================= */
  const tip = document.createElement('div');
  tip.className = 'tip'; tip.setAttribute('role', 'tooltip');
  let tipTarget = null, tipTimer = 0;
  function showTip(t) {
    if (!t.isConnected) return;
    tip.innerHTML = `<div class="tip-head"><b>${esc(t.dataset.tip)}</b>${t.dataset.tipKey ? `<kbd>${esc(t.dataset.tipKey)}</kbd>` : ''}</div>${t.dataset.tipBody ? `<span>${esc(t.dataset.tipBody)}</span>` : ''}`;
    tip.classList.add('on');
    const r = t.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    let top = r.top - h - 8; if (top < 6) top = r.bottom + 8;
    const left = Math.max(6, Math.min(innerWidth - w - 6, r.left + r.width / 2 - w / 2));
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }
  function hideTip() { clearTimeout(tipTimer); tipTarget = null; tip.classList.remove('on'); }

  /* ======================= Boot ======================= */
  function boot() {
    buildShell();
    document.body.append(tip);
    if (store.get('ow-ctx-hidden', false)) document.body.classList.add('ctx-hidden');
    buildIndex();

    document.addEventListener('click', e => {
      const a = e.target.closest('[data-act], [data-open-search]');
      if (a?.hasAttribute('data-open-search')) { openPalette(); return; }
      if (!a) {
        // In-page TOC links scroll the main column instead of changing the route.
        const t = e.target.closest('.toc a');
        if (t) { e.preventDefault(); document.getElementById(t.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); closeDrawers(); }
        if (e.target.closest('.nav-item, .brand, .tb-brand') && location.hash === e.target.closest('a').getAttribute('href')) { e.preventDefault(); render(); }
        return;
      }
      switch (a.dataset.act) {
        case 'nav': document.body.classList.toggle('nav-open'); document.body.classList.remove('ctx-open'); break;
        case 'ctx': toggleContext(); break;
        case 'close-drawers': closeDrawers(); break;
      }
    });

    const pal = $('.palette'), input = pal.querySelector('input');
    input.addEventListener('input', () => { cursor = 0; results = search(input.value); paintResults(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); cursor = Math.min(results.length - 1, cursor + 1); paintResults(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); cursor = Math.max(0, cursor - 1); paintResults(); }
      else if (e.key === 'Enter') { e.preventDefault(); runResult(results[cursor]); }
      else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    });
    pal.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) runResult(results[+li.dataset.i]); else if (e.target === pal) closePalette(); });
    pal.addEventListener('mousemove', e => { const li = e.target.closest('li[data-i]'); if (li && +li.dataset.i !== cursor) { cursor = +li.dataset.i; pal.querySelectorAll('li[data-i]').forEach(x => x.classList.toggle('on', +x.dataset.i === cursor)); } });

    document.addEventListener('keydown', e => {
      const typing = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openPalette(); return; }
      if (e.key === 'Escape' && document.body.classList.contains('palette-open')) { closePalette(); return; }
      if (e.key === 'Escape' && (document.body.classList.contains('nav-open') || document.body.classList.contains('ctx-open'))) closeDrawers();
    });

    document.addEventListener('pointerover', e => {
      const t = e.target.closest?.('[data-tip]');
      if (t === tipTarget) return;
      hideTip();
      if (!t) return;
      tipTarget = t; tipTimer = setTimeout(() => showTip(t), 260);
    });
    document.addEventListener('pointerout', e => { if (tipTarget && !tipTarget.contains(e.relatedTarget)) hideTip(); });
    document.addEventListener('focusin', e => { const t = e.target.closest?.('[data-tip]'); if (t && e.target.matches(':focus-visible')) { hideTip(); tipTarget = t; showTip(t); } });
    document.addEventListener('focusout', hideTip);
    document.addEventListener('pointerdown', hideTip);
    document.addEventListener('scroll', hideTip, true);
    setInterval(() => { if (tipTarget && !tipTarget.isConnected) hideTip(); }, 400);

    $('#content').addEventListener('scroll', () => requestAnimationFrame(spy), { passive: true });
    window.addEventListener('hashchange', render);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
