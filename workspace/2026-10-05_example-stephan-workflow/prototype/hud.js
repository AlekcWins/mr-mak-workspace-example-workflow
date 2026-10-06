/* OVERLORD HUD prototype engine.
   Owns the battlefield simulation (units, orders, a light combat model), the
   HUD overlay (command bar, inspector, banners, minimap, settings sheet) and
   the demo state presets listed in prototype.js. script.js mounts it on the
   #/prototype/hud route:  OW.hud.mount(container, { state, select, focus }).
   State survives navigation; the loop stops while the page is not shown. */
(() => {
  const OW = (window.OW ||= {});
  const D = OW.data, MAP = D.map, E = D.entities, ART = OW.art;
  const W = MAP.size.w, H = MAP.size.h, NS = 'http://www.w3.org/2000/svg';
  const AGGRO = { aggressive: 220, defensive: 140, hold: 0 };
  const ENEMY_AGGRO = 170, LEASH = 380, RESPAWN = 30, MAX_Z = 1.7;
  const RANK = { knight: 0, swordsman: 1, spearman: 1, general: 2, crossbow: 3, archer: 3, priest: 4 };
  const GROUP3 = ['swordsman', 'spearman', 'archer'];
  const GROUP6 = ['swordsman', 'spearman', 'archer', 'crossbow', 'knight', 'priest'];
  const SLOT_KEYS = ['Q', 'W', 'E', 'R'];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const alive = x => !!x && !x.dead;
  const icon = ART.icon;

  /* ======================= Simulation state ======================= */
  let S = null;
  let root = null, els = {}, mounted = false, raf = 0, last = 0, uiClock = 0, emitClock = 0;
  let drag = null, camAnim = null, ro = null, hoverEl = null, inspectorSig = '', bannerSig = '';
  const keys = new Set();
  const listeners = new Set();

  function newState(prev) {
    S = {
      units: [], buildings: [], byId: new Map(), counters: {}, sel: [], command: null, paused: false,
      settings: prev?.settings || { healthBars: false, inspector: 'right', reduceMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, aggro: false },
      gold: 4500, time: 0, fallen: null, cooldowns: new Map(), toggles: new Set(), training: [], barrowTimer: 40,
      cam: prev?.cam || null, events: [], pings: [], threat: false, breached: false, formation: 'line', formDir: -Math.PI / 2,
    };
    for (const b of MAP.buildings) addBuilding(b);
    for (const [type, x, y] of MAP.units) addUnit(type, x, y);
    log('Scenario ready: 30 soldiers at Varnhold Keep, the Barrow Host waits to the north-east.');
  }

  function addBuilding({ id, type, x, y }) {
    const def = E.buildings[type];
    const b = { kind: 'building', id, type, team: E.factions[def.faction].team, x, y, hp: def.hp, max: def.hp, radius: def.radius };
    S.buildings.push(b); S.byId.set(id, b);
    if (mounted) drawBuilding(b);
    return b;
  }

  function addUnit(type, x, y, extra = {}) {
    const def = E.units[type];
    S.counters[type] = (S.counters[type] || 0) + 1;
    const u = {
      kind: 'unit', id: `u${S.byId.size + 1}-${type}`, type, n: S.counters[type], team: E.factions[def.faction].team,
      x, y, hp: def.hp, max: def.hp, heading: E.factions[def.faction].team === 'own' ? 0 : 200, order: { kind: 'idle' },
      home: { x, y }, cd: Math.random(), stance: 'defensive', level: def.level, buffs: {}, ...extra,
    };
    S.units.push(u); S.byId.set(u.id, u);
    if (mounted) drawUnit(u);
    return u;
  }

  const def = e => (e.kind === 'unit' ? E.units[e.type] : E.buildings[e.type]);
  const nameOf = e => (e.kind === 'building' || def(e).hero ? def(e).name : `${e.militia ? 'Militia ' : ''}${def(e).name} #${e.n}`);
  const living = (team, type) => S.units.filter(u => !u.dead && (!team || u.team === team) && (!type || u.type === type));
  const general = () => living('own', 'general')[0];
  const keep = () => S.byId.get('keep');
  const selected = () => S.sel.map(id => S.byId.get(id)).filter(alive);
  const ownSelectedUnits = () => selected().filter(e => e.kind === 'unit' && e.team === 'own');

  function log(text, tone = '') {
    S.events.unshift({ t: S.time, text, tone });
    S.events.length = Math.min(S.events.length, 40);
    if (mounted) renderLog();
  }

  /* ======================= Geometry ======================= */
  // Distance from a point to a building's edge (the keep is a rectangle).
  function edgeDist(b, x, y) {
    if (b.type === 'keep') {
      const dx = Math.max(Math.abs(x - b.x) - 132, 0), dy = Math.max(y < b.y ? b.y - y - 114 : y - b.y - 134, 0);
      return Math.hypot(dx, dy);
    }
    return Math.hypot(x - b.x, y - b.y) - b.radius;
  }
  const insideKeep = (x, y, pad = 0) => { const k = keep(); return Math.abs(x - k.x) < 132 + pad && y > k.y - 114 - pad && y < k.y + 134 + pad; };
  // Smallest push that moves a point inside the keep walls to just outside them.
  function outsideKeep(x, y, pad) {
    const k = keep();
    const pushes = [[k.x - 132 - pad - x, 0], [k.x + 132 + pad - x, 0], [0, k.y - 114 - pad - y], [0, k.y + 134 + pad - y]];
    const [px, py] = pushes.sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]))[0];
    return { x: x + px, y: y + py };
  }

  function formationOffsets(kind, n) {
    const out = [];
    if (kind === 'column') for (let i = 0; i < n; i++) out.push([(i % 2 - 0.5) * 22, Math.floor(i / 2) * 22]);
    else if (kind === 'wedge') { for (let row = 0, i = 0; i < n; row++) for (let j = 0; j <= row && i < n; j++, i++) out.push([(j - row / 2) * 24, row * 21]); }
    else {
      const gap = kind === 'loose' ? 38 : 22, cols = Math.max(3, Math.ceil(Math.sqrt(n * 2.4)));
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / cols), inRow = Math.min(cols, n - row * cols), col = i % cols;
        const jitter = kind === 'loose' ? [((i * 37) % 11) - 5, ((i * 53) % 9) - 4] : [0, 0];
        out.push([(col - (inRow - 1) / 2) * gap + jitter[0], row * gap + jitter[1]]);
      }
    }
    return out;
  }

  // Assign formation positions; front rows face `dir` and sit at point p.
  function formationSlots(units, p, dir) {
    const slots = new Map();
    if (units.length === 1) { slots.set(units[0], p); return slots; }
    const c = centroid(units);
    const ang = dir ?? (Math.hypot(p.x - c.x, p.y - c.y) > 30 ? Math.atan2(p.y - c.y, p.x - c.x) : S.formDir);
    S.formDir = ang;
    const fx = Math.cos(ang), fy = Math.sin(ang), rx = -fy, ry = fx;
    const order = [...units].sort((a, b) => (RANK[a.type] ?? 2) - (RANK[b.type] ?? 2) || a.n - b.n);
    formationOffsets(S.formation, order.length).forEach(([lat, depth], i) =>
      slots.set(order[i], { x: clamp(p.x + rx * lat - fx * depth, 20, W - 20), y: clamp(p.y + ry * lat - fy * depth, 20, H - 20) }));
    return slots;
  }
  const centroid = list => ({ x: list.reduce((s, u) => s + u.x, 0) / list.length, y: list.reduce((s, u) => s + u.y, 0) / list.length });

  /* ======================= Orders ======================= */
  function orderMove(units, p, kind = 'move') {
    if (!units.length) return;
    if (insideKeep(p.x, p.y, 10)) p = outsideKeep(p.x, p.y, 40);
    for (const [u, s] of formationSlots(units, p)) {
      const t = insideKeep(s.x, s.y, 8) ? outsideKeep(s.x, s.y, 16) : s;
      u.order = { kind, x: t.x, y: t.y };
    }
    marker(p, kind === 'move' ? 'move' : 'attack');
    log(`${kind === 'move' ? 'Move' : 'Attack-move'} → ${units.length === 1 ? nameOf(units[0]) : `${units.length} units`}`);
  }
  function orderAttack(units, target) {
    if (target.type === 'barrow') {
      toast('Razing the barrow needs siege engines — not in this prototype.', 'warn');
      orderMove(units, { x: target.x - 60, y: target.y + 150 });
      return;
    }
    units.forEach(u => (u.order = { kind: 'attack', target: target.id }));
    marker(target, 'attack');
    log(`Attack → ${nameOf(target)} (${units.length} unit${units.length > 1 ? 's' : ''})`);
  }
  function stopUnits(units = ownSelectedUnits()) {
    if (!units.length) return;
    units.forEach(u => (u.order = { kind: 'idle' }));
    log(`Stop → ${units.length} unit${units.length > 1 ? 's' : ''}`);
  }
  function setFormation(kind) {
    S.formation = kind;
    const units = ownSelectedUnits();
    if (units.length > 1) {
      const c = centroid(units), depth = Math.max(...formationOffsets(kind, units.length).map(o => o[1]));
      const p = { x: c.x + Math.cos(S.formDir) * depth / 2, y: c.y + Math.sin(S.formDir) * depth / 2 };
      for (const [u, s] of formationSlots(units, p, S.formDir)) {
        const t = insideKeep(s.x, s.y, 8) ? outsideKeep(s.x, s.y, 16) : s;
        u.order = { kind: 'move', x: t.x, y: t.y };
      }
      log(`Formation → ${kind}`);
    }
    refreshInspector(true);
  }
  function setStance(stance) {
    ownSelectedUnits().forEach(u => (u.stance = stance));
    log(`Stance → ${stance}`);
    refreshInspector(true);
  }

  /* ======================= Combat model ======================= */
  const buffActive = (u, name) => u.buffs[name] && u.buffs[name].until > S.time;
  function speedOf(u) {
    let s = def(u).speed;
    for (const b of Object.values(u.buffs)) if (b.until > S.time && b.speed) s *= b.speed;
    if (u.slowUntil > S.time) s *= 0.8;
    if (S.toggles.has(`${u.id}:shield-wall`)) s *= 0.6;
    if (S.toggles.has(`${u.id}:brace`)) s *= 0.5;
    if (S.toggles.has(`${u.id}:hold-line`)) s *= 0.7;
    return s * 1.15;
  }
  function armorBonus(u) {
    if (u.kind !== 'unit') return 0;
    let a = S.toggles.has(`${u.id}:shield-wall`) ? 4 : 0;
    const g = general();
    if (u.team === 'own' && g && S.toggles.has(`${g.id}:hold-line`) && def(u).tags.includes('infantry') && Math.hypot(g.x - u.x, g.y - u.y) < 160) a += 3;
    return a;
  }
  function attackMult(u) {
    let m = 1;
    if (u.team === 'own') {
      const g = general();
      if (g && g !== u && Math.hypot(g.x - u.x, g.y - u.y) < 140) m *= 1.1;
      if (S.fallen) m *= 0.85;
    }
    return m;
  }
  const reloadOf = u => def(u).cooldown * (S.toggles.has(`${u.id}:pierce`) ? 1.25 : 1);

  function hit(u, t) {
    let mult = attackMult(u);
    const tdef = def(t), tags = tdef.tags || ['building'];
    if (t.kind === 'building' && S.toggles.has(`${u.id}:fire-arrows`)) mult *= 1.4;
    if (S.toggles.has(`${u.id}:brace`) && (tags.includes('cavalry') || tags.includes('beast'))) mult *= 1.5;
    if (u.nextDouble) { mult *= 2; u.nextDouble = false; }
    const dmg = E.damage(u.type, t.type, { mult, armorBonus: armorBonus(t), pierceBonus: S.toggles.has(`${u.id}:pierce`) ? 3 : 0 });
    if (def(u).range > 60) shot(u, t);
    damageTo(t, dmg, u);
    if (u.volley) {
      u.volley = false;
      ring(t, 40, 'volley');
      for (const o of living(t.team)) if (o !== t && Math.hypot(o.x - t.x, o.y - t.y) < 40) damageTo(o, Math.round(dmg * 0.7), u);
    }
    if (u.type === 'wight' && t.kind === 'unit') t.slowUntil = S.time + 2;
  }

  function damageTo(t, dmg, src) {
    if (t.dead) return;
    t.hp -= dmg;
    flash(t);
    if (t.kind === 'building') {
      if (t.type === 'keep' && t.hp <= t.max * 0.15) {
        t.hp = t.max * 0.15;
        if (!S.breached) { S.breached = true; log('Walls breached — the prototype holds the keep at 15%.', 'bad'); toast('Walls breached! The keep holds at 15% in this prototype.', 'bad'); }
      }
      return;
    }
    if (t.hp <= 0) kill(t, src);
  }

  function kill(u, src) {
    if (u.dead) return;
    u.dead = true; u.hp = 0;
    if (u.el) { const el = u.el; el.classList.add('dead'); setTimeout(() => el.remove(), 700); }
    if (S.sel.includes(u.id)) select(S.sel.filter(id => id !== u.id), { quiet: true });
    if (u.type === 'general') {
      S.fallen = { until: S.time + RESPAWN };
      for (const k of [...S.toggles]) if (k.startsWith(`${u.id}:`)) S.toggles.delete(k);
      log('The General has fallen. He returns to the keep in 30 s.', 'bad');
      toast('The General has fallen — army morale −15%.', 'bad');
      renderStates();
    } else if (src) {
      log(`${nameOf(u)} ${u.team === 'own' ? 'lost to' : 'slain by'} ${nameOf(src)}`, u.team === 'own' ? 'bad' : 'good');
    }
    S.units = S.units.filter(x => !x.dead || x.el?.isConnected);
  }

  function reviveGeneral(reason = 'returns') {
    if (general()) return general();
    S.fallen = null;
    const g = addUnit('general', MAP.gate.x + 6, MAP.gate.y + 20);
    ring(g, 70, 'heal');
    log(`The General ${reason} at Varnhold Keep.`, 'good');
    toast('The General returns to Varnhold Keep.', 'good');
    renderStates();
    return g;
  }

  /* ======================= Unit AI ======================= */
  function nearestFoe(u, radius) {
    let best = null, bd = radius;
    for (const o of S.units) {
      if (o.dead || o.team === u.team) continue;
      const d = Math.hypot(o.x - u.x, o.y - u.y);
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }

  function step(u, x, y, dt, stopAt = 3) {
    const dx = x - u.x, dy = y - u.y, d = Math.hypot(dx, dy);
    if (d <= stopAt) return true;
    const s = Math.min(d - stopAt, speedOf(u) * dt);
    u.x += (dx / d) * s; u.y += (dy / d) * s;
    u.heading = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return d - s <= stopAt + 0.01;
  }

  function engage(u, t, dt) {
    const reach = def(u).range + ART.radius(u.type) * 0.6;
    const gap = t.kind === 'building' ? edgeDist(t, u.x, u.y) : Math.hypot(t.x - u.x, t.y - u.y) - ART.radius(t.type);
    if (gap > reach) {
      if (u.team === 'own' && u.stance === 'hold' && u.order.kind === 'attack' && !u.order.forced) { u.order = { kind: 'idle' }; return; }
      step(u, t.x, t.y, dt, 0);
    } else {
      u.heading = (Math.atan2(t.x - u.x, -(t.y - u.y)) * 180) / Math.PI;
      if (u.cd <= 0) { hit(u, t); u.cd = reloadOf(u); }
    }
  }

  function think(u, dt) {
    u.cd = Math.max(0, u.cd - dt);
    let o = u.order;
    if (o.kind === 'attack' && !alive(S.byId.get(o.target))) o = u.order = o.resume || { kind: 'idle' };
    if (u.team === 'enemy' && !u.wave && o.kind === 'attack' && Math.hypot(u.x - u.home.x, u.y - u.home.y) > LEASH) o = u.order = { kind: 'move', x: u.home.x, y: u.home.y };

    if (o.kind === 'idle' || o.kind === 'attack-move' || o.kind === 'siege') {
      const radius = u.team === 'own'
        ? (o.kind === 'attack-move' ? Math.max(190, AGGRO[u.stance]) : AGGRO[u.stance] || def(u).range + 10)
        : (u.wave ? 120 : ENEMY_AGGRO);
      const foe = nearestFoe(u, radius);
      if (foe) {
        const resume = o.kind === 'idle' ? (u.team === 'enemy' && !u.wave ? { kind: 'move', x: u.home.x, y: u.home.y } : { kind: 'idle' }) : o;
        o = u.order = { kind: 'attack', target: foe.id, resume };
      }
    }
    switch (o.kind) {
      case 'move': case 'attack-move':
        if (step(u, o.x, o.y, dt)) u.order = { kind: 'idle' };
        break;
      case 'attack': engage(u, S.byId.get(o.target), dt); break;
      case 'siege': engage(u, S.byId.get(o.target), dt); break;
    }
    // Slide around the keep walls instead of walking over them.
    if (insideKeep(u.x, u.y, ART.radius(u.type))) Object.assign(u, outsideKeep(u.x, u.y, ART.radius(u.type)));
  }

  function separate() {
    const list = S.units.filter(u => !u.dead);
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j], dx = b.x - a.x, dy = b.y - a.y, min = (ART.radius(a.type) + ART.radius(b.type)) * 0.85;
      if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
      const d = Math.hypot(dx, dy) || 0.01;
      if (d < min) { const push = (min - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push; }
    }
  }

  function simulate(dt) {
    S.time += dt;
    const farm = S.byId.get('farmstead');
    if (alive(farm)) S.gold += E.buildings.farmstead.income * dt;
    for (const [k, v] of S.cooldowns) { if (v - dt <= 0) S.cooldowns.delete(k); else S.cooldowns.set(k, v - dt); }
    if (S.fallen && S.time >= S.fallen.until) reviveGeneral();
    if (S.training.length) {
      const t = S.training[0]; t.t += dt;
      if (t.t >= t.total) {
        S.training.shift();
        const u = addUnit(t.type, MAP.gate.x + (Math.random() - 0.5) * 40, MAP.gate.y + 30);
        u.order = { kind: 'move', x: u.x + (Math.random() - 0.5) * 60, y: u.y + 50 };
        log(`${nameOf(u)} trained at the gate.`, 'good');
      }
    }
    const k = keep();
    if (S.toggles.has('keep:repair')) {
      if (k.hp < k.max && S.gold >= 2 * dt) { k.hp = Math.min(k.max, k.hp + 12 * dt); S.gold -= 2 * dt; }
      if (k.hp >= k.max) { S.toggles.delete('keep:repair'); log('Repairs finished.'); refreshInspector(true); }
    }
    S.barrowTimer -= dt;
    if (S.barrowTimer <= 0) {
      S.barrowTimer = E.buildings.barrow.spawnEvery;
      const b = S.byId.get('barrow');
      if (living('enemy').filter(u => !u.wave).length < 12) {
        const u = addUnit('wight', b.x - 40, b.y + 70, { home: { x: b.x - 70 + Math.random() * 60, y: b.y + 110 + Math.random() * 30 } });
        u.order = { kind: 'move', ...u.home };
        log('The Old Barrow raised a Barrow Wight.', 'bad');
      }
    }
    for (const u of S.units) if (!u.dead) think(u, dt);
    separate();
    updateThreat();
  }

  function threatUnits() {
    const k = keep();
    return living('enemy').filter(u => edgeDist(k, u.x, u.y) < 210);
  }
  function updateThreat() {
    const now = threatUnits().length > 0;
    if (now && !S.threat) { S.threat = true; S.breached = false; log('Varnhold Keep is under attack!', 'bad'); refreshInspector(true); renderStates(); }
    else if (!now && S.threat) { S.threat = false; log('Threat cleared at Varnhold Keep.', 'good'); toast('Threat cleared.', 'good'); refreshInspector(true); renderStates(); }
    if (S.threat && S.time - (S.lastPing || 0) > 2.5) { S.lastPing = S.time; const c = centroid(threatUnits()); S.pings.push({ x: c.x, y: c.y, t: S.time, color: '#ff5a4f' }); }
  }

  /* ======================= Abilities ======================= */
  const EFFECTS = {
    rally(g) {
      for (const u of living('own')) if (Math.hypot(u.x - g.x, u.y - g.y) < 160) u.hp = Math.min(u.max, u.hp + u.max * 0.2);
      ring(g, 160, 'gold'); log('Rally: nearby allies healed 20%.', 'good');
    },
    charge(g) { g.buffs.charge = { speed: 2, until: S.time + 3 }; ring(g, 30, 'gold'); log('The General charges.'); },
    sprint(u) { u.buffs.sprint = { speed: 1.6, until: S.time + 3 }; log(`${nameOf(u)} sprints.`); },
    volley(u) { u.volley = true; log(`${nameOf(u)} readies a volley.`); },
    'lance-charge'(u) { u.buffs.lance = { speed: 1.8, until: S.time + 2.5 }; u.nextDouble = true; log(`${nameOf(u)} lowers the lance.`); },
    mend(u) {
      const t = living('own').filter(o => o.hp < o.max && Math.hypot(o.x - u.x, o.y - u.y) < 110).sort((a, b) => a.hp / a.max - b.hp / b.max)[0];
      if (!t) { toast('No wounded allies within reach.'); return false; }
      t.hp = Math.min(t.max, t.hp + 60); ring(t, 22, 'heal'); log(`${nameOf(u)} mends ${nameOf(t)}.`, 'good');
    },
    'ring-bell'(k) {
      for (let i = 0; i < 3; i++) {
        const u = addUnit('swordsman', MAP.gate.x - 24 + i * 24, MAP.gate.y + 16, { militia: true, level: 1 });
        u.order = { kind: 'attack-move', x: u.x, y: u.y + 40 };
      }
      ring(k, 190, 'gold'); log('The bell rings: 3 militia swordsmen answer.', 'good'); toast('Militia called to the gate.', 'good');
    },
    'light-beacon'(b) { S.pings.push({ x: b.x, y: b.y, t: S.time, color: '#ffd27a', big: true }); ring(b, 180, 'gold'); log('Beacon lit on Watch Hill.'); },
    'harvest-festival'() { S.gold += 120; log('Harvest festival: +120 gold.', 'good'); toast('+120 gold', 'good'); },
  };

  function useAbility(abId, ownerId, sourceButton) {
    const a = E.abilities[abId], owner = S.byId.get(ownerId);
    if (!a || !alive(owner) || S.paused) return;
    const key = `${ownerId}:${abId}`;
    if (a.type === 'passive') { toast(`${a.name} is passive — always on.`); return; }
    if (a.type === 'command') { abId === 'attack-move' ? armCommand() : stopUnits(); return; }
    if (owner.team !== 'own') return;
    if (a.type === 'toggle') {
      const on = !S.toggles.has(key);
      on ? S.toggles.add(key) : S.toggles.delete(key);
      log(`${a.name} ${on ? 'on' : 'off'} — ${nameOf(owner)}`);
    } else if (a.type === 'train') {
      const cost = E.units[a.unit].cost;
      if (S.gold < cost) { toast(`Not enough gold for ${E.units[a.unit].name} (${cost}).`, 'warn'); return; }
      if (S.training.length >= 5) { toast('Training queue is full (5).', 'warn'); return; }
      S.gold -= cost; S.training.push({ type: a.unit, t: 0, total: a.time });
      log(`Queued ${E.units[a.unit].name} (−${cost} gold).`);
    } else {
      if (S.cooldowns.has(key)) { toast(`${a.name} is recharging (${Math.ceil(S.cooldowns.get(key))} s).`); return; }
      if (EFFECTS[abId]?.(owner) === false) return;
      S.cooldowns.set(key, a.cooldown);
    }
    if (sourceButton) { sourceButton.classList.remove('cast'); void sourceButton.offsetWidth; sourceButton.classList.add('cast'); }
    refreshInspector(false);
  }

  function abilityOwner() {
    const items = selected();
    if (items.length !== 1 || items[0].team !== 'own') return null;
    return items[0];
  }

  /* ======================= Selection & modes ======================= */
  function select(ids, { quiet = false, center = false } = {}) {
    S.sel = [...new Set(ids)].filter(id => alive(S.byId.get(id)));
    if (mounted) {
      const set = new Set(S.sel);
      for (const e of [...S.units, ...S.buildings]) e.el?.classList.toggle('sel', set.has(e.id));
      refreshInspector(true); renderStates();
    }
    const items = selected();
    if (!quiet && items.length) log(`Selected ${items.length === 1 ? nameOf(items[0]) : `${items.length} units`}`);
    if (center && items.length) { const c = centroid(items); flyTo(c.x, c.y + (items.length > 1 ? 20 : 0)); }
  }

  function armCommand() {
    if (S.paused) return;
    const own = ownSelectedUnits();
    S.command = own.length ? { ids: own.map(u => u.id) } : { army: true };
    log(`Attack-move armed — ${own.length ? `${own.length} unit${own.length > 1 ? 's' : ''}` : 'whole army'}.`);
    renderModes();
  }
  function cancelCommand(silent) {
    if (!S.command) return;
    S.command = null;
    if (!silent) log('Command cancelled.');
    renderModes();
  }
  const commandUnits = () => (S.command?.army ? living('own') : (S.command?.ids || []).map(id => S.byId.get(id)).filter(alive));

  function openSettings() { if (S.paused) return; cancelCommand(true); S.paused = true; log('Paused — system sheet open.'); renderModes(); els.settings?.querySelector('button')?.focus({ preventScroll: true }); }
  function closeSettings() { if (!S.paused) return; S.paused = false; log('Resumed.'); renderModes(); els.vp?.focus({ preventScroll: true }); }
  const toggleSettings = () => (S.paused ? closeSettings() : openSettings());

  /* ======================= Presets (HUD demo states) ======================= */
  function ensureOwn(type) { return living('own', type)[0] || addUnit(type, MAP.gate.x + (Math.random() - 0.5) * 80, MAP.gate.y + 40); }
  function startThreat() {
    const k = keep();
    if (threatUnits().length < 4) for (const [type, x, y] of MAP.threatWave) addUnit(type, x, y, { wave: true, order: { kind: 'siege', target: 'keep' } });
    k.hp = Math.min(k.hp, k.max * 0.72);
    toast('Varnhold Keep is under attack!', 'bad');
  }
  function clearThreat() {
    for (const u of threatUnits()) { u.dead = true; u.el?.classList.add('dead'); const el = u.el; setTimeout(() => el?.remove(), 700); }
    S.units = S.units.filter(u => !u.dead);
    keep().hp = keep().max; S.breached = false;
  }

  const PRESETS = {
    none: () => { select([], { quiet: true }); },
    command: () => { if (!ownSelectedUnits().length) select(living('own', 'swordsman').map(u => u.id), { quiet: true, center: true }); armCommand(); },
    settings: () => openSettings(),
    fallen: () => {
      select([], { quiet: true });
      const g = general();
      if (g) kill(g, null); else S.fallen.until = S.time + RESPAWN;
      flyTo(keep().x, keep().y + 120);
    },
    swordsman: () => select([ensureOwn('swordsman').id], { center: true }),
    general: () => select([(general() || reviveGeneral('is recalled')).id], { center: true }),
    enemy: () => {
      const u = living('enemy', 'wight').find(w => !w.wave) || living('enemy')[0] || addUnit('wight', 1830, 360);
      select([u.id], { center: true });
    },
    group3: () => { GROUP3.forEach(ensureOwn); select(living('own').filter(u => GROUP3.includes(u.type)).map(u => u.id), { center: true }); },
    group6: () => { GROUP6.forEach(ensureOwn); select(living('own').filter(u => GROUP6.includes(u.type)).map(u => u.id), { center: true }); },
    keep: () => { clearThreat(); select(['keep'], { center: true }); },
    'keep-threat': () => { startThreat(); select(['keep'], { quiet: true }); flyTo(keep().x + 70, keep().y - 40); },
    barrow: () => select(['barrow'], { center: true }),
  };

  function preset(id) {
    if (!PRESETS[id]) return;
    if (id !== 'settings') { if (S.paused) closeSettings(); cancelCommand(true); }
    PRESETS[id]();
    const st = D.prototype.states.find(s => s.id === id);
    if (st) log(`State → ${st.label}`, 'state');
    renderStates(); refreshInspector(true); renderModes();
  }

  // Which demo state matches what is on screen now (null = a custom selection).
  function currentState() {
    if (S.paused) return 'settings';
    if (S.command) return 'command';
    const items = selected();
    if (!items.length) return S.fallen ? 'fallen' : 'none';
    if (items.length === 1) {
      const it = items[0];
      if (it.kind === 'building') return it.type === 'keep' ? (S.threat ? 'keep-threat' : 'keep') : it.type === 'barrow' ? 'barrow' : null;
      if (it.team === 'enemy') return 'enemy';
      return it.type === 'general' ? 'general' : it.type === 'swordsman' ? 'swordsman' : null;
    }
    const types = new Set(items.map(u => u.type));
    if (items.every(u => u.kind === 'unit' && u.team === 'own')) {
      if (types.size === 3 && GROUP3.every(t => types.has(t))) return 'group3';
      if (types.size === 6 && GROUP6.every(t => types.has(t))) return 'group6';
    }
    return null;
  }

  function describeCustom() {
    const items = selected();
    if (items.length === 1) {
      const it = items[0];
      return `${nameOf(it)} — ${it.kind === 'building' ? 'building inspector' : 'single-unit inspector'}. Same layout rules as the closest preset.`;
    }
    const types = new Set(items.map(u => u.type));
    return `${items.length} units of ${types.size} type${types.size > 1 ? 's' : ''}. Group view: one card per type, ${types.size > 3 ? 'wrapping into two rows' : 'one row'}.`;
  }

  /* ======================= Camera ======================= */
  const vpSize = () => ({ w: els.vp?.clientWidth || 800, h: els.vp?.clientHeight || 450 });
  const minZoom = () => { const { w, h } = vpSize(); return Math.max(w / W, h / H); };
  function clampCam(c) {
    const { w, h } = vpSize();
    c.z = clamp(c.z, minZoom(), MAX_Z);
    c.x = clamp(c.x, 0, Math.max(0, W - w / c.z)); c.y = clamp(c.y, 0, Math.max(0, H - h / c.z));
    return c;
  }
  const centerOn = (x, y, z = S.cam.z) => { const { w, h } = vpSize(); return clampCam({ x: x - w / 2 / z, y: y - h / 2 / z, z }); };
  function applyCamera() {
    clampCam(S.cam);
    const t = `translate3d(${(-S.cam.x * S.cam.z).toFixed(1)}px, ${(-S.cam.y * S.cam.z).toFixed(1)}px, 0) scale(${S.cam.z.toFixed(4)})`;
    if (els.world.style.transform !== t) els.world.style.transform = t;
  }
  function flyTo(x, y, z) {
    if (!mounted) { S.cam = null; S.pendingFocus = { x, y }; return; }
    camAnim = { from: { ...S.cam }, to: centerOn(x, y, z ?? S.cam.z), t: 0, dur: S.settings.reduceMotion ? 0.01 : 0.45 };
  }
  function homeCamera() {
    const { w } = vpSize();
    const target = S.pendingFocus || { x: 1225, y: 880 };
    S.pendingFocus = null;
    // About 1020 world px across on desktop; never smaller than 0.6× so phones still show readable units.
    S.cam = centerOn(target.x, target.y, clamp(Math.max(w / 1020, 0.6), minZoom(), MAX_Z));
  }
  function zoomAt(factor, cx, cy) {
    const r = els.vp.getBoundingClientRect();
    cx ??= r.left + r.width / 2; cy ??= r.top + r.height / 2;
    const p = toWorld(cx, cy), z = clamp(S.cam.z * factor, minZoom(), MAX_Z);
    camAnim = null;
    S.cam = clampCam({ x: p.x - (cx - r.left) / z, y: p.y - (cy - r.top) / z, z });
    applyCamera();
  }
  function toWorld(cx, cy) {
    const r = els.vp.getBoundingClientRect();
    return { x: S.cam.x + (cx - r.left) / S.cam.z, y: S.cam.y + (cy - r.top) / S.cam.z };
  }

  /* ======================= DOM: battlefield ======================= */
  function drawUnit(u) {
    const g = document.createElementNS(NS, 'g'), r = ART.radius(u.type);
    g.setAttribute('class', `u ${u.team}${u.type === 'general' ? ' hero' : ''}`);
    g.dataset.id = u.id;
    g.innerHTML = `<circle class="u-aggro" r="${u.team === 'own' ? AGGRO.defensive : ENEMY_AGGRO}"/><circle class="u-ring" r="${r + 5}"/><circle class="u-hover" r="${r + 4}"/>
      <g class="u-body">${ART.sprite(u.type)}</g><path class="u-guard" d="M0-${r + 13}l4 1.6v3c0 2.2-1.6 3.6-4 4.4-2.4-.8-4-2.2-4-4.4v-3z"/>
      <g class="u-hp" transform="translate(-11 ${-r - 9})"><rect class="u-hp-bg" width="22" height="3.6" rx="1"/><rect class="u-hp-fill" width="22" height="3.6" rx="1"/></g>
      <circle class="u-hit" r="${r + 4}"/>`;
    u.el = g; u.body = g.querySelector('.u-body'); u.hpFill = g.querySelector('.u-hp-fill');
    u.drawn = {};
    els.lUnits.append(g);
    placeUnit(u);
    if (S.sel.includes(u.id)) g.classList.add('sel');
  }

  const BUILDING_SHAPES = {
    keep: { ring: [0, 10, 176, 160], hit: '<rect class="b-hit" x="-136" y="-118" width="272" height="256"/>', hp: [-60, -150, 120] },
    watchtower: { ring: [0, -6, 44, 44], hit: '<rect class="b-hit" x="-28" y="-44" width="56" height="76"/>', hp: [-26, -56, 52] },
    farmstead: { ring: [30, 10, 150, 100], hit: '<rect class="b-hit" x="-80" y="-48" width="166" height="136"/><circle class="b-hit" cx="140" cy="-64" r="34"/>', hp: [-40, -64, 80] },
    barrow: { ring: [0, 6, 122, 94], hit: '<ellipse class="b-hit" rx="108" ry="82"/>', hp: [-50, -96, 100] },
  };
  function drawBuilding(b) {
    const s = BUILDING_SHAPES[b.type], g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `b ${b.team} b-${b.type}`);
    g.dataset.id = b.id;
    g.setAttribute('transform', `translate(${b.x} ${b.y})`);
    g.innerHTML = `<ellipse class="b-ring" cx="${s.ring[0]}" cy="${s.ring[1]}" rx="${s.ring[2]}" ry="${s.ring[3]}"/>${ART.building(b.type)}
      <g class="u-hp b-hp" transform="translate(${s.hp[0]} ${s.hp[1]})"><rect class="u-hp-bg" width="${s.hp[2]}" height="5" rx="1.5"/><rect class="u-hp-fill" width="${s.hp[2]}" height="5" rx="1.5"/></g>${s.hit}`;
    b.el = g; b.hpFill = g.querySelector('.u-hp-fill'); b.hpWidth = s.hp[2];
    els.lBuild.append(g);
  }

  function placeUnit(u) {
    const d = u.drawn, x = Math.round(u.x * 10) / 10, y = Math.round(u.y * 10) / 10, h = Math.round(u.heading);
    if (d.x !== x || d.y !== y) { u.el.setAttribute('transform', `translate(${x} ${y})`); d.x = x; d.y = y; }
    if (d.h !== h) { u.body.setAttribute('transform', `rotate(${h})`); d.h = h; }
    const ratio = clamp(u.hp / u.max, 0, 1), rq = Math.round(ratio * 50) / 50;
    if (d.hp !== rq) {
      u.hpFill.setAttribute('width', (22 * ratio).toFixed(1));
      u.el.classList.toggle('hurt', ratio < 0.999);
      u.el.dataset.hpTone = ratio > 0.6 ? 'ok' : ratio > 0.3 ? 'mid' : 'low';
      d.hp = rq;
    }
    const guard = armorBonus(u) > 0;
    if (d.guard !== guard) { u.el.classList.toggle('guarded', guard); d.guard = guard; }
    const fast = Object.values(u.buffs).some(b => b.until > S.time);
    if (d.fast !== fast) { u.el.classList.toggle('fast', fast); d.fast = fast; }
  }

  function placeBuilding(b) {
    const ratio = clamp(b.hp / b.max, 0, 1), rq = Math.round(ratio * 100) / 100;
    if (b.drawnHp === rq) return;
    b.hpFill.setAttribute('width', (b.hpWidth * ratio).toFixed(1));
    b.el.classList.toggle('hurt', ratio < 0.999);
    b.el.dataset.hpTone = ratio > 0.6 ? 'ok' : ratio > 0.3 ? 'mid' : 'low';
    b.el.classList.toggle('burning', b.type === 'keep' && (ratio < 0.85 || S.threat));
    b.drawnHp = rq;
  }

  function flash(e) {
    if (!e.el) return;
    e.el.classList.add('hit');
    clearTimeout(e.flashT); e.flashT = setTimeout(() => e.el?.classList.remove('hit'), 140);
  }
  function fx(markup, cls, life = 700) {
    if (!mounted) return;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', cls); g.innerHTML = markup; els.lFx.append(g);
    setTimeout(() => g.remove(), life);
  }
  const shot = (a, b) => fx(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`, `fx-shot ${a.team}`, 260);
  const ring = (at, r, tone) => fx(`<circle cx="${at.x}" cy="${at.y}" r="${r}"/>`, `fx-ring ${tone}`, 900);
  const marker = (at, tone) => fx(`<g transform="translate(${at.x} ${at.y})"><circle r="16"/><circle r="8"/></g>`, `fx-marker ${tone}`, 650);

  /* ======================= DOM: HUD template ======================= */
  const tip = (title, body = '', key = '') => `data-tip="${esc(title)}"${body ? ` data-tip-body="${esc(body)}"` : ''}${key ? ` data-tip-key="${esc(key)}"` : ''}`;

  function template() {
    const groups = [...new Set(D.prototype.states.map(s => s.group))];
    return `<div class="hud-layout">
      <div class="hud-stage">
        <div class="vp" tabindex="0" aria-label="Battlefield prototype. Click units to select, drag to box-select, right-click to move.">
          <div class="world"><svg class="ents" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${ART.defs}</defs>
            <g class="l-decor"><g transform="translate(1302 936)">${ART.campfire}</g></g><g class="l-build"></g><g class="l-units"></g><g class="l-fx"></g></svg>
            <div class="clouds" aria-hidden="true"><i></i><i></i><i></i></div></div>
          <div class="vp-shade" aria-hidden="true"></div><div class="vp-alert" aria-hidden="true"></div>
          <div class="box-sel" hidden></div><div class="reticle" hidden><i></i></div><div class="vp-hover" hidden></div>
          <div class="hud">
            <div class="hud-ui cmdbar">
              <button class="cmd-general" data-act="select-general" ${tip('The General', 'Select the hero. Portrait mirrors his health.', 'F')}>
                <span class="cg-portrait"></span><svg class="cg-ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29"/><circle class="cg-ring-fill" cx="32" cy="32" r="29"/></svg>
                <span class="cg-lv">5</span><span class="cg-timer" data-k="respawn-short"></span></button>
              <div class="res">
                <div ${tip('Gold', '+4 per second from Millfield Farmstead. Spend it on training at the keep.')} tabindex="0">${icon('gold')}<b data-k="gold">4 500</b><small data-k="income">+4/s</small></div>
                <div ${tip('Army', 'Soldiers you command, including the General.')} tabindex="0">${icon('helmet')}<b data-k="army">30</b></div>
                <div ${tip('Holdings', 'Keep, watchtower and farmstead. A red dot means one is under attack.')} tabindex="0">${icon('tower')}<b>3</b><i class="res-alert" data-k="hold-alert"></i></div>
              </div>
            </div>
            <div class="banners" aria-live="polite"></div>
            <div class="hud-ui sysbar">
              <span class="paused-tag" data-k="paused">Paused</span>
              <button class="gear" data-act="settings" aria-label="System menu" ${tip('System menu', 'Pause the game and change settings.', 'Space')}>${icon('cog')}</button>
            </div>
            <div class="toasts" aria-live="polite"></div>
            <div class="hud-ui minimap" ${tip('Minimap', 'Click or drag to move the camera. Red pings mark threats.')}>
              <canvas class="mm-base"></canvas><canvas class="mm-over"></canvas>
              <div class="mm-zoom"><button data-act="zoom-in" aria-label="Zoom in" ${tip('Zoom in', '', '+')}>+</button><button data-act="zoom-out" aria-label="Zoom out" ${tip('Zoom out', '', '−')}>−</button></div>
            </div>
            <div class="hud-ui inspector" aria-live="polite"></div>
            <div class="hud-ui settings" hidden role="dialog" aria-label="Paused — system menu">
              <div class="set-card">
                <div class="set-head"><span>PAUSED</span><small>Prototype v0.5 · Esc or Space to resume</small></div>
                <button class="set-resume" data-act="resume">${icon('play')} Resume <kbd>Space</kbd></button>
                <div class="set-label">Settings — applied live</div>
                <label class="set-row"><span>Always show health bars<small>Otherwise shown for selected, hovered and wounded units</small></span><input type="checkbox" data-set="healthBars"></label>
                <div class="set-row"><span>Inspector position<small>Testing decision D-04: right vs bottom</small></span>
                  <div class="seg" role="group" aria-label="Inspector position"><button data-set-inspector="right">Right</button><button data-set-inspector="bottom">Bottom</button></div></div>
                <label class="set-row"><span>Show aggro radius<small>Designer overlay: who will react to whom</small></span><input type="checkbox" data-set="aggro"></label>
                <label class="set-row"><span>Reduce motion<small>Stops pulses, clouds and animated rings</small></span><input type="checkbox" data-set="reduceMotion"></label>
                <button class="set-restart" data-act="restart">${icon('reset')} Restart scenario</button>
              </div>
            </div>
          </div>
        </div>
        <div class="hud-legend" aria-label="Controls">
          <span><kbd>Click</kbd> select</span><span><kbd>Drag</kbd> box</span><span><kbd>Right-click</kbd> move / attack</span>
          <span><kbd>A</kbd> attack-move</span><span><kbd>S</kbd> stop</span><span><kbd>Q</kbd>–<kbd>R</kbd> abilities</span><span><kbd>F</kbd> General</span>
          <span><kbd>H</kbd> keep</span><span><kbd>Space</kbd> pause</span><span><kbd>Esc</kbd> clear</span><span><kbd>Arrows</kbd> pan</span><span><kbd>Wheel</kbd> zoom (after click)</span>
        </div>
      </div>
      <aside class="hud-states" aria-label="HUD demo states">
        <div class="hs-title">HUD demo — states</div>
        ${groups.map(g => `<div class="hs-group">${esc(g)}</div>${D.prototype.states.filter(s => s.group === g).map(s =>
          `<button class="hs-btn" data-state="${s.id}" aria-pressed="false">${esc(s.label)}${s.key ? `<kbd>${esc(s.key)}</kbd>` : ''}</button>`).join('')}`).join('')}
        <div class="hs-spec" aria-live="polite"></div>
        <button class="hs-reset" data-act="restart">${icon('reset')} Reset scenario</button>
        <p class="hs-foot">All numbers are live prototype values from <code>prototype/entities.js</code>. Click a unit to drill into its card. A = attack-move · Esc = cancel / deselect.</p>
      </aside>
    </div>
    <div class="hud-below">
      <div class="hud-log-wrap" id="event-log" data-toc="Event log"><div class="mini-label">Event log <span class="live-dot">live</span></div><ol class="hud-log"></ol></div>
    </div>`;
  }

  /* ======================= DOM: HUD rendering ======================= */
  function renderStates() {
    if (!mounted) return;
    const cur = currentState();
    els.root.querySelectorAll('.hs-btn').forEach(b => { const on = b.dataset.state === cur; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    const st = D.prototype.states.find(s => s.id === cur);
    els.spec.innerHTML = st
      ? `<b>${esc(st.label)}</b> — ${esc(st.spec)}<div class="hs-meta">${st.decisions.map(d => `<a class="chip-dec" href="#/research/decisions?item=${d.toLowerCase()}">${d}</a>`).join('')}</div><div class="hs-q"><span>Open question</span>${esc(st.question)}</div>`
      : `<b>Custom selection</b> — ${esc(describeCustom())}`;
    emit();
  }

  function renderModes() {
    if (!mounted) return;
    els.vp.classList.toggle('cmd', !!S.command);
    els.vp.classList.toggle('paused', S.paused);
    els.settings.hidden = !S.paused;
    els.reticle.hidden = !S.command;
    els.root.querySelector('.gear').classList.toggle('on', S.paused);
    syncSettingsForm();
    renderBanners(true);
    renderStates();
  }

  function syncSettingsForm() {
    const st = S.settings;
    els.settings.querySelectorAll('[data-set]').forEach(i => (i.checked = !!st[i.dataset.set]));
    els.settings.querySelectorAll('[data-set-inspector]').forEach(b => b.classList.toggle('on', b.dataset.setInspector === st.inspector));
    els.vp.classList.toggle('hb-always', st.healthBars);
    els.vp.classList.toggle('insp-bottom', st.inspector === 'bottom');
    els.vp.classList.toggle('show-aggro', st.aggro);
    els.vp.classList.toggle('calm', st.reduceMotion);
  }

  function renderBanners(force) {
    const threat = S.threat, cmd = S.command;
    const sig = `${!!S.fallen}|${threat}|${cmd ? (cmd.army ? 'army' : cmd.ids.length) : ''}`;
    if (!force && sig === bannerSig) return;
    bannerSig = sig;
    let html = '';
    if (S.fallen) html += `<div class="banner b-fallen">${icon('skull')}<span><b>The General has fallen</b> Returns in <span data-k="respawn">0:30</span> · Army morale −15%</span></div>`;
    if (threat) html += `<button class="banner b-threat" data-act="jump" ${tip('Jump to threat', 'Moves the camera to the attackers.', 'J')}>${icon('alert')}<span><b>Varnhold Keep is under attack</b> <span data-k="threat-count"></span> · north-east</span><kbd>J</kbd></button>`;
    if (cmd) {
      const n = commandUnits().length;
      html += `<div class="banner b-cmd">${icon('swords')}<span><b>Attack-move</b> · ${cmd.army ? `whole army (${n}) — nothing selected` : `${n} unit${n > 1 ? 's' : ''}`} · click ground or an enemy</span><kbd>Esc</kbd></div>`;
    }
    els.banners.innerHTML = html;
    els.vp.classList.toggle('threat', threat);
    updateBannerValues();
  }
  function updateBannerValues() {
    const r = els.banners.querySelector('[data-k="respawn"]');
    if (r && S.fallen) r.textContent = clock(Math.max(0, S.fallen.until - S.time));
    const t = els.banners.querySelector('[data-k="threat-count"]');
    if (t) { const n = threatUnits().length; t.textContent = `${n} hostile${n === 1 ? '' : 's'}`; }
  }

  function toast(text, tone = '') {
    if (!mounted) return;
    const t = document.createElement('div');
    t.className = `toast ${tone}`; t.textContent = text;
    els.toasts.append(t);
    while (els.toasts.children.length > 3) els.toasts.firstChild.remove();
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3000);
  }

  function renderLog() {
    if (!els.log) return;
    els.log.innerHTML = S.events.slice(0, 9).map(e => `<li class="${e.tone}"><time>${clock(e.t)}</time>${esc(e.text)}</li>`).join('');
  }

  /* ---------- Inspector ---------- */
  function abilityButton(abId, owner, slot) {
    const a = E.abilities[abId], key = SLOT_KEYS[slot] || '';
    const hostile = owner.team !== 'own';
    const cost = a.type === 'train' ? E.units[a.unit].cost : null;
    const body = `${a.desc}${a.cooldown ? ` Cooldown ${a.cooldown} s.` : ''}${a.type === 'toggle' ? ' Toggle.' : ''}${cost ? ` Costs ${cost} gold.` : ''}`;
    if (a.type === 'passive' || hostile) {
      return `<div class="ab passive${hostile ? ' hostile' : ''}" tabindex="0" ${tip(`${a.name}${hostile ? ' — enemy ability' : ' — passive'}`, a.desc)}>${icon(a.icon)}<span class="ab-name">${esc(a.name)}</span></div>`;
    }
    return `<button class="ab" data-ab="${abId}" data-owner="${owner.id}" ${tip(a.name, body, key)}><span class="ab-key">${key}</span>${icon(a.icon)}<span class="ab-cd"></span>${cost ? `<span class="ab-cost">${cost}</span>` : ''}<span class="ab-name">${esc(a.name)}</span></button>`;
  }
  const commandButtons = () => `<button class="ab cmd-ab" data-ab="attack-move" data-owner="_" ${tip('Attack-move', E.abilities['attack-move'].desc, 'A')}><span class="ab-key">A</span>${icon('swords')}<span class="ab-name">Attack</span></button>
    <button class="ab cmd-ab" data-ab="stop" data-owner="_" ${tip('Stop', E.abilities.stop.desc, 'S')}><span class="ab-key">S</span>${icon('stop')}<span class="ab-name">Stop</span></button>`;

  const stat = (k, label, val) => `<div class="st-cell"><span>${label}</span><b data-k="${k}">${val}</b></div>`;
  const hpBar = (cls = '') => `<div class="bar hp ${cls}"><i data-k="hpbar"></i><span data-k="hptext"></span></div>`;
  const threatPips = n => `<span class="pips" ${tip('Threat level', ['Low', 'Medium', 'High'][n - 1] + ' — how dangerous this is to your army.')}>${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

  function inspectorHTML() {
    const items = selected();
    if (!items.length) return '';
    if (items.length > 1) return groupHTML(items);
    const it = items[0], d = def(it);
    if (it.kind === 'building') return buildingHTML(it, d);
    if (it.team === 'enemy') {
      return `<div class="insp-card hostile"><div class="insp-flag">${icon('eye')} Hostile · inspect only ${threatPips(d.threat || 1)}</div>
        <div class="insp-head"><div class="insp-portrait">${ART.portrait(it.type)}<span class="lv">LV ${it.level}</span></div>
        <div class="insp-title"><strong>${esc(nameOf(it))}</strong><small>${esc(d.role)} · Barrow Host</small>${hpBar('enemy')}</div></div>
        <div class="insp-stats">${stat('atk', 'ATK', d.atk)}${stat('arm', 'ARM', d.armor)}${stat('rng', 'RNG', d.range)}${stat('spd', 'SPD', d.speed)}</div>
        <div class="insp-status" data-k="status"></div>
        <div class="abil">${d.abilities.map((a, i) => abilityButton(a, it, i)).join('')}</div>
        <div class="insp-note"><b>Counter</b> ${esc(d.counter || '')}</div></div>`;
    }
    const hero = !!d.hero;
    return `<div class="insp-card own${hero ? ' hero' : ''}"><div class="insp-flag">${hero ? `${icon('banner')} Hero · Commander` : `${icon('helmet')} Your unit`}</div>
      <div class="insp-head"><div class="insp-portrait">${ART.portrait(it.type)}<span class="lv">LV ${it.level}</span></div>
      <div class="insp-title"><strong>${esc(nameOf(it))}</strong><small>${esc(d.role)}</small>${hpBar()}
      ${hero ? '<div class="bar xp" data-tip="Experience" data-tip-body="62% to level 6: unlocks Tactics II."><i style="width:62%"></i><span>XP 62%</span></div>' : ''}</div></div>
      <div class="insp-stats">${stat('atk', 'ATK', d.atk)}${stat('arm', 'ARM', d.armor)}${stat('rng', 'RNG', d.range)}${stat('spd', 'SPD', d.speed)}</div>
      <div class="insp-status" data-k="status"></div>
      <div class="abil">${d.abilities.map((a, i) => abilityButton(a, it, i)).join('')}<span class="abil-gap"></span>${commandButtons()}</div>
      <div class="insp-traits">${d.traits.map(t => `<span>${esc(t)}</span>`).join('')}</div></div>`;
  }

  function buildingHTML(b, d) {
    if (b.team === 'enemy') {
      return `<div class="insp-card hostile"><div class="insp-flag">${icon('eye')} Hostile building · inspect only ${threatPips(d.threat)}</div>
        <div class="insp-head"><div class="insp-portrait wide">${ART.portrait('barrow')}</div>
        <div class="insp-title"><strong>${esc(d.name)}</strong><small>${esc(d.role)} · Barrow Host</small>${hpBar('enemy')}</div></div>
        <div class="insp-spawn"><div class="mini-label">Next Barrow Wight rises in <b data-k="spawn-t"></b></div><div class="bar spawn"><i data-k="spawn-bar"></i></div></div>
        <div class="insp-stats">${stat('garrison', 'GUARD', '')}${stat('arm', 'ARM', d.armor)}${stat('every', 'EVERY', `${d.spawnEvery}s`)}${stat('cap', 'CAP', 12)}</div>
        <div class="abil">${d.abilities.map((a, i) => abilityButton(a, b, i)).join('')}</div>
        <div class="insp-note"><b>Note</b> ${esc(d.note)}</div></div>`;
    }
    const threat = b.type === 'keep' && S.threat;
    const extra = b.type === 'keep'
      ? `${stat('garrison', 'GARRISON', d.garrison)}${stat('arm', 'ARM', d.armor)}${stat('income', 'INCOME', '+4/s')}${stat('queue', 'QUEUE', `${S.training.length}/5`)}`
      : b.type === 'farmstead' ? `${stat('income', 'INCOME', `+${d.income}/s`)}${stat('arm', 'ARM', d.armor)}${stat('workers', 'WORKERS', 6)}${stat('fields', 'FIELDS', 4)}`
        : `${stat('garrison', 'GARRISON', d.garrison)}${stat('arm', 'ARM', d.armor)}${stat('vision', 'VISION', d.range)}${stat('road', 'WATCHES', 'Ford')}`;
    const queue = b.type === 'keep' ? `<div class="queue" aria-label="Training queue">${Array.from({ length: 5 }, (_, i) => { const q = S.training[i]; return `<div class="q-slot${q ? ' full' : ''}" ${q ? tip(`Training ${E.units[q.type].name}`, i === 0 ? 'In progress' : `Position ${i + 1}`) : ''}>${q ? ART.portrait(q.type) : ''}${i === 0 && q ? '<i data-k="q-bar"></i>' : ''}</div>`; }).join('')}</div>` : '';
    const threatBox = threat ? `<div class="threat-box"><div class="tb-head">${icon('alert')} Under attack</div><div data-k="threat-list"></div>
      <button class="tb-jump" data-act="jump">${icon('focus')} Jump to threat <kbd>J</kbd></button></div>` : '';
    return `<div class="insp-card own building${threat ? ' alarm' : ''}"><div class="insp-flag">${threat ? `${icon('alert')} Main keep — under threat` : `${icon('castle')} ${esc(d.role)}`}</div>
      <div class="insp-head"><div class="insp-portrait wide">${ART.portrait(b.type)}</div>
      <div class="insp-title"><strong>${esc(d.name)}</strong><small>${b.type === 'keep' ? 'Walls' : 'Structure'} · Crown of Varn</small>${hpBar(threat ? 'enemy' : '')}</div></div>
      ${threatBox}
      <div class="insp-stats">${extra}</div>${queue}
      <div class="abil">${d.abilities.map((a, i) => abilityButton(a, b, i)).join('')}</div>
      <div class="insp-note"><b>Note</b> ${esc(d.note)}</div></div>`;
  }

  function groupHTML(items) {
    const own = items.filter(u => u.team === 'own' && u.kind === 'unit');
    const byType = new Map();
    for (const u of own) { if (!byType.has(u.type)) byType.set(u.type, []); byType.get(u.type).push(u); }
    const types = [...byType.keys()].sort((a, b) => (RANK[a] ?? 2) - (RANK[b] ?? 2));
    const stance = own.every(u => u.stance === own[0].stance) ? own[0].stance : '';
    const forms = [['line', 'Line'], ['column', 'Column'], ['wedge', 'Wedge'], ['loose', 'Loose']];
    return `<div class="insp-card own group"><div class="insp-flag">${icon('swords')} Group · <span data-k="g-types">${types.length}</span> types · <span data-k="g-count">${own.length}</span> units</div>
      ${hpBar('group')}
      <div class="gt-grid${types.length > 3 ? ' two-rows' : ''}">${types.map(t => `<button class="gt" data-type-filter="${t}" ${tip(`Select only ${E.units[t].name}s`, `${byType.get(t).length} in this group.`)}>
        ${ART.portrait(t)}<span class="gt-count" data-k="gc-${t}">×${byType.get(t).length}</span><span class="gt-name">${esc(E.units[t].name)}</span><i class="gt-hp" data-k="gh-${t}"></i></button>`).join('')}</div>
      <div class="ctl-row"><span class="ctl-label">Formation</span><div class="seg">${forms.map(([k, l]) => `<button data-formation="${k}" class="${S.formation === k ? 'on' : ''}" ${tip(`${l} formation`, 'Idle units regroup immediately; moving units use it at the next order.')}>${icon(`f-${k}`)}<span>${l}</span></button>`).join('')}</div></div>
      <div class="ctl-row"><span class="ctl-label">Stance</span><div class="seg">${[['aggressive', 'Aggressive', 'Chase enemies within 220.'], ['defensive', 'Defensive', 'Engage enemies within 140.'], ['hold', 'Hold', 'Never leave position; attack only in range.']].map(([k, l, b]) => `<button data-stance="${k}" class="${stance === k ? 'on' : ''}" ${tip(l, b)}><span>${l}</span></button>`).join('')}</div></div>
      <div class="abil">${commandButtons()}</div></div>`;
  }

  function inspectorSignature() {
    const items = selected();
    return [S.sel.join(','), S.threat, S.training.length, S.formation, items.map(u => u.stance).join(''), S.settings.inspector, items.length > 1 ? [...new Set(items.map(u => u.type))].join() : ''].join('|');
  }

  function refreshInspector(force) {
    if (!mounted) return;
    const sig = inspectorSignature();
    if (force || sig !== inspectorSig) {
      inspectorSig = sig;
      const html = inspectorHTML();
      els.insp.innerHTML = html;
      els.insp.classList.toggle('open', !!html);
    }
    updateInspector();
  }

  function setBar(scope, ratio, text) {
    const bar = scope.querySelector('[data-k="hpbar"]');
    if (!bar) return;
    bar.style.width = `${clamp(ratio, 0, 1) * 100}%`;
    bar.parentElement.dataset.tone = ratio > 0.6 ? 'ok' : ratio > 0.3 ? 'mid' : 'low';
    scope.querySelector('[data-k="hptext"]').textContent = text;
  }
  const setText = (k, v) => { const el = els.insp.querySelector(`[data-k="${k}"]`); if (el && el.textContent !== String(v)) el.textContent = v; return el; };
  const statTone = (k, base, now) => { const el = setText(k, now); if (el) el.className = now > base ? 'up' : now < base ? 'down' : ''; };

  function statusText(u) {
    const o = u.order, t = o.target && S.byId.get(o.target);
    const what = { idle: 'Idle', move: 'Moving', 'attack-move': 'Attack-moving', attack: t ? `Fighting ${nameOf(t)}` : 'Fighting', siege: 'Besieging Varnhold Keep' }[o.kind] || 'Idle';
    const extras = [];
    if (u.team === 'own') extras.push(`${u.stance[0].toUpperCase()}${u.stance.slice(1)} stance`);
    for (const [k, b] of Object.entries(u.buffs)) if (b.until > S.time) extras.push(`${k === 'lance' ? 'Lance charge' : k[0].toUpperCase() + k.slice(1)} ${(b.until - S.time).toFixed(1)} s`);
    if (u.slowUntil > S.time) extras.push('Chilled');
    if (u.volley) extras.push('Volley ready');
    if (u.team === 'own' && S.fallen) extras.push('Morale −15%');
    return [what, ...extras].join(' · ');
  }

  function updateInspector() {
    const items = selected();
    if (!items.length || !els.insp.firstElementChild) return;
    const card = els.insp;
    if (items.length > 1) {
      const own = items.filter(u => u.kind === 'unit');
      const hp = own.reduce((s, u) => s + u.hp, 0), max = own.reduce((s, u) => s + u.max, 0);
      setBar(card, hp / max, `${Math.round(hp)} / ${max}`);
      setText('g-count', own.length);
      for (const t of new Set(own.map(u => u.type))) {
        const list = own.filter(u => u.type === t), h = list.reduce((s, u) => s + u.hp / u.max, 0) / list.length;
        setText(`gc-${t}`, `×${list.length}`);
        const bar = card.querySelector(`[data-k="gh-${t}"]`); if (bar) bar.style.width = `${h * 100}%`;
      }
    } else {
      const it = items[0], d = def(it);
      setBar(card, it.hp / it.max, `${Math.ceil(it.hp)} / ${it.max}`);
      if (it.kind === 'unit') {
        statTone('atk', d.atk, Math.round(d.atk * attackMult(it)));
        statTone('arm', d.armor, d.armor + armorBonus(it));
        statTone('spd', d.speed, Math.round(speedOf(it) / 1.15));
        setText('status', statusText(it));
      } else if (it.type === 'barrow') {
        setText('spawn-t', clock(Math.max(0, S.barrowTimer)));
        const bar = card.querySelector('[data-k="spawn-bar"]'); if (bar) bar.style.width = `${(1 - S.barrowTimer / d.spawnEvery) * 100}%`;
        setText('garrison', living('enemy').filter(u => !u.wave && Math.hypot(u.x - it.x, u.y - it.y) < 260).length);
      } else if (it.type === 'keep') {
        setText('queue', `${S.training.length}/5`);
        const q = card.querySelector('[data-k="q-bar"]'); if (q && S.training[0]) q.style.width = `${(S.training[0].t / S.training[0].total) * 100}%`;
        const list = card.querySelector('[data-k="threat-list"]');
        if (list) {
          const counts = {};
          for (const u of threatUnits()) counts[u.type] = (counts[u.type] || 0) + 1;
          const html = Object.entries(counts).map(([t, n]) => `<span>${esc(E.units[t].name)} ×${n}</span>`).join('') || '<span>Clearing…</span>';
          if (list.innerHTML !== html) list.innerHTML = html;
        }
      }
    }
    // Ability buttons: cooldown sweep, toggles, affordability.
    card.querySelectorAll('button.ab[data-ab]').forEach(btn => {
      const ab = btn.dataset.ab, a = E.abilities[ab], key = `${btn.dataset.owner}:${ab}`;
      const cd = S.cooldowns.get(key) || 0;
      btn.classList.toggle('is-cd', cd > 0);
      if (cd > 0) { btn.style.setProperty('--p', `${(cd / a.cooldown) * 360}deg`); btn.querySelector('.ab-cd').textContent = Math.ceil(cd); }
      btn.classList.toggle('is-active', S.toggles.has(key) || (ab === 'attack-move' && !!S.command));
      const poor = a.type === 'train' && (S.gold < E.units[a.unit].cost || S.training.length >= 5);
      btn.classList.toggle('is-disabled', poor);
      btn.setAttribute('aria-disabled', String(poor));
      btn.classList.toggle('is-suggested', ab === 'ring-bell' && S.threat && cd <= 0);
    });
  }

  /* ---------- Command bar, minimap ---------- */
  function updateCmdbar() {
    const g = general();
    const gold = Math.floor(S.gold).toLocaleString('en-US').replace(',', ' ');
    const goldEl = els.root.querySelector('[data-k="gold"]');
    if (goldEl.textContent !== gold) goldEl.textContent = gold;
    els.root.querySelector('[data-k="army"]').textContent = living('own').length;
    els.root.querySelector('[data-k="hold-alert"]').classList.toggle('on', S.threat);
    els.root.querySelector('[data-k="income"]').textContent = S.toggles.has('keep:repair') ? '+2/s' : '+4/s';
    els.root.querySelector('[data-k="paused"]').classList.toggle('on', S.paused);
    const btn = els.root.querySelector('.cmd-general');
    btn.classList.toggle('fallen', !g);
    btn.classList.toggle('sel', !!g && S.sel.includes(g.id));
    const ratio = g ? g.hp / g.max : S.fallen ? 1 - (S.fallen.until - S.time) / RESPAWN : 0;
    els.root.querySelector('.cg-ring-fill').style.strokeDashoffset = `${182.2 * (1 - clamp(ratio, 0, 1))}`;
    els.root.querySelector('[data-k="respawn-short"]').textContent = !g && S.fallen ? Math.ceil(S.fallen.until - S.time) : '';
  }

  function initMinimap() {
    const dpr = Math.min(2, devicePixelRatio || 1), w = els.mmBase.clientWidth || 200, h = els.mmBase.clientHeight || 125;
    for (const c of [els.mmBase, els.mmOver]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const g = OW.terrain.drawInto(els.mmBase);
    g.fillStyle = 'rgba(14,16,10,.22)'; g.fillRect(0, 0, els.mmBase.width, els.mmBase.height);
  }

  function drawMinimap() {
    const c = els.mmOver, g = c.getContext('2d'), s = c.width / W, dpr = c.width / (els.mmOver.clientWidth || 200);
    g.clearRect(0, 0, c.width, c.height);
    for (const b of S.buildings) {
      const sz = (b.type === 'keep' ? 7 : 4.5) * dpr;
      g.fillStyle = b.team === 'own' ? '#a9c4ff' : '#ff5a4f';
      g.fillRect(b.x * s - sz / 2, b.y * s - sz / 2, sz, sz);
      g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = dpr; g.strokeRect(b.x * s - sz / 2, b.y * s - sz / 2, sz, sz);
    }
    const sel = new Set(S.sel);
    for (const u of S.units) {
      if (u.dead) continue;
      g.fillStyle = sel.has(u.id) ? '#ffffff' : u.team === 'own' ? (u.type === 'general' ? '#ffd56a' : '#6f9cff') : '#ff4a3f';
      g.beginPath(); g.arc(u.x * s, u.y * s, (u.type === 'general' ? 2.3 : 1.5) * dpr, 0, Math.PI * 2); g.fill();
    }
    S.pings = S.pings.filter(p => S.time - p.t < 1.6);
    for (const p of S.pings) {
      const k = (S.time - p.t) / 1.6;
      g.strokeStyle = p.color; g.globalAlpha = 1 - k; g.lineWidth = 1.5 * dpr;
      g.beginPath(); g.arc(p.x * s, p.y * s, (p.big ? 26 : 6 + k * 16) * dpr * (p.big ? k : 1), 0, Math.PI * 2); g.stroke();
      g.globalAlpha = 1;
    }
    const { w, h } = vpSize();
    g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 1.2 * dpr;
    g.strokeRect(S.cam.x * s, S.cam.y * s, (w / S.cam.z) * s, (h / S.cam.z) * s);
  }

  /* ======================= Loop ======================= */
  function frame(now) {
    raf = requestAnimationFrame(frame);
    // rAF timestamps can precede the performance.now() taken at mount, so never step backwards.
    const dt = clamp((now - last) / 1000 || 0, 0, 0.05);
    last = now;
    if (keys.size && !S.paused) {
      const v = 640 * dt / S.cam.z;
      S.cam.x += (keys.has('ArrowRight') - keys.has('ArrowLeft')) * v;
      S.cam.y += (keys.has('ArrowDown') - keys.has('ArrowUp')) * v;
      camAnim = null;
    }
    if (camAnim) {
      camAnim.t = Math.min(1, camAnim.t + dt / camAnim.dur);
      const k = camAnim.t < 0.5 ? 4 * camAnim.t ** 3 : 1 - (-2 * camAnim.t + 2) ** 3 / 2;
      for (const p of ['x', 'y', 'z']) S.cam[p] = camAnim.from[p] + (camAnim.to[p] - camAnim.from[p]) * k;
      if (camAnim.t >= 1) camAnim = null;
    }
    applyCamera();
    if (!S.paused) simulate(dt);
    for (const u of S.units) if (!u.dead && u.el) placeUnit(u);
    for (const b of S.buildings) placeBuilding(b);
    if (now - uiClock > 100) {
      uiClock = now;
      refreshInspector(false); updateCmdbar(); renderBanners(); updateBannerValues(); drawMinimap();
      if (S.lastState !== currentState()) { S.lastState = currentState(); renderStates(); }
    }
    if (now - emitClock > 300) { emitClock = now; emit(); }
  }

  /* ======================= Input ======================= */
  const entityAt = target => { const id = target?.closest?.('[data-id]')?.dataset.id; return id ? S.byId.get(id) : null; };

  function onPointerDown(e) {
    if (e.target.closest('.hud-ui, .banners, .toasts')) return;
    els.vp.focus({ preventScroll: true });
    if (S.paused) return;
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, cam: { ...S.cam } };
      els.vp.setPointerCapture(e.pointerId); camAnim = null; return;
    }
    if (e.button === 2) { rightClick(e); return; }
    if (e.button === 0) { drag = { mode: 'press', sx: e.clientX, sy: e.clientY, target: e.target, shift: e.shiftKey }; els.vp.setPointerCapture(e.pointerId); }
  }

  function onPointerMove(e) {
    const r = els.vp.getBoundingClientRect();
    if (S.command) { els.reticle.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`; }
    if (drag?.mode === 'pan') {
      S.cam = clampCam({ ...drag.cam, x: drag.cam.x - (e.clientX - drag.sx) / S.cam.z, y: drag.cam.y - (e.clientY - drag.sy) / S.cam.z });
      return;
    }
    if (drag?.mode === 'press' && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6 && !S.command) { drag.mode = 'box'; els.box.hidden = false; }
    if (drag?.mode === 'box') {
      const x1 = Math.min(drag.sx, e.clientX) - r.left, y1 = Math.min(drag.sy, e.clientY) - r.top;
      Object.assign(els.box.style, { left: `${x1}px`, top: `${y1}px`, width: `${Math.abs(e.clientX - drag.sx)}px`, height: `${Math.abs(e.clientY - drag.sy)}px` });
      return;
    }
    const ent = e.target.closest('.hud-ui') ? null : entityAt(e.target);
    const el = ent?.el || null;
    if (el !== hoverEl) { hoverEl?.classList.remove('hover'); el?.classList.add('hover'); hoverEl = el; }
    els.reticle.classList.toggle('on-enemy', !!ent && ent.team === 'enemy');
    if (ent && !S.paused) {
      els.hover.hidden = false;
      els.hover.className = `vp-hover ${ent.team}`;
      els.hover.textContent = `${nameOf(ent)} · ${ent.team === 'own' ? 'Yours' : 'Hostile'} · ${Math.ceil(ent.hp)}/${ent.max}`;
      els.hover.style.transform = `translate(${Math.min(e.clientX - r.left + 14, r.width - 220)}px, ${e.clientY - r.top + 16}px)`;
    } else els.hover.hidden = true;
  }

  function onPointerUp(e) {
    if (!drag) return;
    const d = drag; drag = null;
    if (els.vp.hasPointerCapture(e.pointerId)) els.vp.releasePointerCapture(e.pointerId);
    if (d.mode === 'box') {
      els.box.hidden = true;
      const a = toWorld(Math.min(d.sx, e.clientX), Math.min(d.sy, e.clientY)), b = toWorld(Math.max(d.sx, e.clientX), Math.max(d.sy, e.clientY));
      const inside = living('own').filter(u => u.x >= a.x && u.x <= b.x && u.y >= a.y && u.y <= b.y).map(u => u.id);
      if (inside.length) select(d.shift ? [...S.sel, ...inside] : inside);
      else if (!d.shift) select([]);
      return;
    }
    if (d.mode === 'press') leftClick(d.target, e, d.shift);
  }

  function leftClick(target, e, shift) {
    const ent = entityAt(target);
    if (S.command) {
      const units = commandUnits();
      if (ent && ent.team === 'enemy') orderAttack(units, ent);
      else orderMove(units, toWorld(e.clientX, e.clientY), 'attack-move');
      cancelCommand(true);
      return;
    }
    if (!ent) { if (S.sel.length) { select([], { quiet: true }); log('Selection cleared (clicked terrain).'); } return; }
    if (shift && ent.kind === 'unit' && ent.team === 'own' && selected().every(x => x.kind === 'unit' && x.team === 'own')) {
      select(S.sel.includes(ent.id) ? S.sel.filter(id => id !== ent.id) : [...S.sel, ent.id]);
    } else select([ent.id]);
  }

  function rightClick(e) {
    if (S.command) { cancelCommand(); return; }
    const units = ownSelectedUnits();
    if (!units.length) return;
    const ent = entityAt(e.target);
    if (ent && ent.team === 'enemy') orderAttack(units, ent);
    else orderMove(units, toWorld(e.clientX, e.clientY));
  }

  function onDblClick(e) {
    const ent = entityAt(e.target);
    if (!ent || ent.kind !== 'unit' || ent.team !== 'own' || S.command) return;
    const { w, h } = vpSize(), c = S.cam;
    const same = living('own', ent.type).filter(u => u.x >= c.x && u.x <= c.x + w / c.z && u.y >= c.y && u.y <= c.y + h / c.z);
    select(same.map(u => u.id));
  }

  function onWheel(e) {
    if (document.activeElement !== els.vp && !els.vp.contains(document.activeElement)) return;
    e.preventDefault();
    zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
  }

  function onKey(e) {
    if (!mounted || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest?.('input[type="text"], input[type="search"], textarea, select, [contenteditable="true"]') || document.body.classList.contains('palette-open')) return;
    const k = e.key;
    if (k === ' ' || k === 'Spacebar') {
      if (e.target.matches?.('input[type="checkbox"]')) return;
      e.preventDefault();
      if (!e.repeat) toggleSettings();
      return;
    }
    if (k === 'Escape') {
      if (S.paused) closeSettings(); else if (S.command) cancelCommand(); else if (S.sel.length) { select([], { quiet: true }); log('Selection cleared (Esc).'); }
      return;
    }
    if (S.paused) return;
    if (k.startsWith('Arrow')) { e.preventDefault(); keys.add(k); return; }
    const lower = k.toLowerCase();
    if (lower === 'a') armCommand();
    else if (lower === 's') stopUnits();
    else if (lower === 'f') { const g = general(); if (g) select([g.id], { center: true }); else toast(`The General returns in ${Math.ceil(S.fallen.until - S.time)} s.`); }
    else if (lower === 'h') flyTo(keep().x, keep().y + 60);
    else if (lower === 'j') { const t = threatUnits(); if (t.length) { const c = centroid(t); flyTo(c.x, c.y); } else toast('No active threat.'); }
    else if (k === '+' || k === '=') zoomAt(1.15);
    else if (k === '-' || k === '_') zoomAt(1 / 1.15);
    else if (['q', 'w', 'e', 'r'].includes(lower)) {
      const owner = abilityOwner(), slot = 'qwer'.indexOf(lower);
      if (!owner) { if (S.sel.length) toast('Abilities need a single unit or building of yours.'); return; }
      const ab = def(owner).abilities[slot];
      if (!ab) return;
      useAbility(ab, owner.id, els.insp.querySelector(`[data-ab="${ab}"]`));
    } else return;
  }
  const onKeyUp = e => { keys.delete(e.key); if ((e.key === ' ' || e.key === 'Spacebar') && mounted && e.target.matches?.('button')) e.preventDefault(); };
  const onBlur = () => keys.clear();

  function onClick(e) {
    if (e.target === els.settings) { closeSettings(); return; }
    const a = e.target.closest('[data-act], [data-state], [data-ab], [data-formation], [data-stance], [data-type-filter], [data-set-inspector]');
    if (!a || !els.root.contains(a)) return;
    if (a.dataset.state) {
      preset(a.dataset.state);
      // Stacked layout: the panel sits below the battlefield, so bring the result into view.
      const r = els.vp.getBoundingClientRect(), stacked = getComputedStyle(root.querySelector('.hud-layout')).gridTemplateColumns.split(' ').length === 1;
      if (stacked && (r.top < 0 || r.bottom > innerHeight)) els.vp.scrollIntoView({ block: 'start', behavior: S.settings.reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    if (a.dataset.ab) {
      if (a.dataset.owner === '_') { a.dataset.ab === 'attack-move' ? (S.command ? cancelCommand() : armCommand()) : stopUnits(); return; }
      if (a.getAttribute('aria-disabled') === 'true') { const ab = E.abilities[a.dataset.ab]; toast(S.training.length >= 5 ? 'Training queue is full (5).' : `Not enough gold for ${E.units[ab.unit].name}.`, 'warn'); return; }
      useAbility(a.dataset.ab, a.dataset.owner, a);
      return;
    }
    if (a.dataset.formation) { setFormation(a.dataset.formation); return; }
    if (a.dataset.stance) { setStance(a.dataset.stance); return; }
    if (a.dataset.typeFilter) { select(ownSelectedUnits().filter(u => u.type === a.dataset.typeFilter).map(u => u.id)); return; }
    if (a.dataset.setInspector) { S.settings.inspector = a.dataset.setInspector; syncSettingsForm(); log(`Inspector position → ${a.dataset.setInspector}`); return; }
    switch (a.dataset.act) {
      case 'settings': toggleSettings(); break;
      case 'resume': closeSettings(); break;
      case 'restart': restart(); break;
      case 'jump': { const t = threatUnits(); if (t.length) { const c = centroid(t); flyTo(c.x, c.y); } break; }
      case 'select-general': { const g = general(); if (g) select([g.id], { center: true }); else toast(`The General returns in ${Math.ceil(S.fallen.until - S.time)} s.`); break; }
      case 'zoom-in': zoomAt(1.15); break;
      case 'zoom-out': zoomAt(1 / 1.15); break;
    }
  }

  function onSettingChange(e) {
    const i = e.target.closest('[data-set]');
    if (!i) return;
    S.settings[i.dataset.set] = i.checked;
    syncSettingsForm();
    log(`Setting → ${i.closest('.set-row').querySelector('span').firstChild.textContent.trim()}: ${i.checked ? 'on' : 'off'}`);
  }

  function minimapPointer(e) {
    if (e.target.closest('.mm-zoom')) return;
    const r = els.mmOver.getBoundingClientRect();
    const to = ev => ({ x: clamp((ev.clientX - r.left) / r.width, 0, 1) * W, y: clamp((ev.clientY - r.top) / r.height, 0, 1) * H });
    const p = to(e);
    flyTo(p.x, p.y);
    els.mmOver.setPointerCapture(e.pointerId);
    const move = ev => { camAnim = null; const q = to(ev); S.cam = centerOn(q.x, q.y); };
    const up = () => { els.mmOver.removeEventListener('pointermove', move); els.mmOver.removeEventListener('pointerup', up); };
    els.mmOver.addEventListener('pointermove', move);
    els.mmOver.addEventListener('pointerup', up);
    e.preventDefault();
  }

  /* ======================= Mount / unmount ======================= */
  function buildWorld() {
    els.lBuild.innerHTML = ''; els.lUnits.innerHTML = ''; els.lFx.innerHTML = '';
    for (const b of S.buildings) drawBuilding(b);
    for (const u of S.units) if (!u.dead) drawUnit(u);
    for (const id of S.sel) S.byId.get(id)?.el?.classList.add('sel');
  }

  function restart() {
    newState(S);
    S.cam = null;
    inspectorSig = ''; bannerSig = '';
    if (mounted) { homeCamera(); applyCamera(); buildWorld(); renderModes(); refreshInspector(true); renderLog(); }
    toast('Scenario restarted.');
  }

  function mount(container, params = {}) {
    unmount();
    if (!S) newState();
    root = container;
    root.innerHTML = template();
    const q = s => root.querySelector(s);
    els = {
      root, vp: q('.vp'), world: q('.world'), svg: q('.ents'), lBuild: q('.l-build'), lUnits: q('.l-units'), lFx: q('.l-fx'),
      insp: q('.inspector'), banners: q('.banners'), toasts: q('.toasts'), settings: q('.settings'), box: q('.box-sel'),
      reticle: q('.reticle'), hover: q('.vp-hover'), mmBase: q('.mm-base'), mmOver: q('.mm-over'), spec: q('.hs-spec'), log: q('.hud-log'),
    };
    const terrain = OW.terrain.get();
    terrain.classList.add('terrain');
    els.world.prepend(terrain);
    root.querySelector('.cg-portrait').innerHTML = ART.portrait('general');
    mounted = true;
    inspectorSig = ''; bannerSig = '';
    buildWorld();
    initMinimap();
    if (!S.cam) homeCamera();
    applyCamera();

    els.vp.addEventListener('pointerdown', onPointerDown);
    els.vp.addEventListener('pointermove', onPointerMove);
    els.vp.addEventListener('pointerup', onPointerUp);
    els.vp.addEventListener('pointercancel', () => { drag = null; els.box.hidden = true; });
    els.vp.addEventListener('pointerleave', () => { els.hover.hidden = true; hoverEl?.classList.remove('hover'); hoverEl = null; });
    els.vp.addEventListener('contextmenu', e => e.preventDefault());
    els.vp.addEventListener('dblclick', onDblClick);
    els.vp.addEventListener('wheel', onWheel, { passive: false });
    els.mmOver.addEventListener('pointerdown', minimapPointer);
    root.addEventListener('click', onClick);
    els.settings.addEventListener('change', onSettingChange);
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    ro = new ResizeObserver(() => { if (!mounted) return; initMinimap(); applyCamera(); });
    ro.observe(els.vp);

    renderModes(); refreshInspector(true); renderLog(); updateCmdbar();
    if (params.state) preset(params.state);
    if (params.select) {
      const target = S.byId.get(params.select) || living('own', params.select)[0] || living('enemy', params.select)[0];
      if (target) { if (S.paused) closeSettings(); select([target.id], { center: true }); }
    }
    if (params.focus) {
      const loc = MAP.locations.find(l => l.id === params.focus);
      if (loc) { flyTo(loc.x, loc.y); S.pings.push({ x: loc.x, y: loc.y, t: S.time, color: '#ffd27a', big: true }); }
    }
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function unmount() {
    if (!mounted) return;
    mounted = false;
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    ro?.disconnect();
    keys.clear(); drag = null; camAnim = null; hoverEl = null;
    for (const e of [...S.units, ...S.buildings]) { e.el = null; e.body = null; e.hpFill = null; e.drawnHp = null; }
    els = {}; root = null;
  }

  /* ======================= Public API ======================= */
  function snapshot() {
    if (!S) return null;
    const items = selected(), cur = currentState(), st = D.prototype.states.find(s => s.id === cur);
    return {
      state: cur || 'custom', label: st ? st.label : 'Custom selection',
      selection: items.length ? (items.length === 1 ? nameOf(items[0]) : `${items.length} units`) : '—',
      own: living('own').length, enemy: living('enemy').length, gold: Math.floor(S.gold), time: clock(S.time),
      paused: S.paused, threat: S.threat, camera: S.cam ? `${Math.round(S.cam.x)}, ${Math.round(S.cam.y)} · ${S.cam.z.toFixed(2)}×` : '—',
    };
  }
  function emit() { const s = snapshot(); listeners.forEach(fn => fn(s)); }

  OW.hud = {
    mount, unmount, preset, restart,
    isMounted: () => mounted,
    snapshot,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();
