// Consistency check for the Example Stephan Workflow card. Loads the data
// files in a sandbox and verifies that every cross-reference resolves.
// Usage: node projects/example-stephan-workflow/check-workflow.mjs
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const card = path.join(root, 'workspace/2026-10-05_example-stephan-workflow');
const html = await readFile(path.join(card, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script defer src="([^"]+)"/g)].map(m => m[1]).filter(s => !s.startsWith('..'));
const dataFiles = scripts.filter(s => !/(art|terrain|hud)\.js$|^script\.js$/.test(s));

const window = {};
const context = vm.createContext({ window });
for (const file of dataFiles) vm.runInContext(await readFile(path.join(card, file), 'utf8'), context, { filename: file });
const D = window.OW.data;

const problems = [];
const need = (cond, msg) => { if (!cond) problems.push(msg); };
const ids = list => new Set(list.map(x => x.id));

const decisionIds = ids(D.decisions.items);
const stateIds = ids(D.prototype.states);
const noteIds = ids(D.notes.items);
const sourceIds = new Set([...ids(D.competitors.items), ...ids(D.uxPatterns.items), ...noteIds]);
const decision = id => decisionIds.has(String(id).toLowerCase());

// Routes declared in script.js NAV, and HUD presets declared in hud.js.
const shell = await readFile(path.join(card, 'script.js'), 'utf8');
const routes = new Set([...shell.matchAll(/\['([a-z-]+\/[a-z-]+)', '/g)].map(m => m[1]));
const renderers = new Set([...shell.matchAll(/PAGE\['([a-z-]+\/[a-z-]+)'\]/g)].map(m => m[1]));
const hud = await readFile(path.join(card, 'prototype/hud.js'), 'utf8');
const presetBlock = hud.slice(hud.indexOf('const PRESETS = {'), hud.indexOf('function preset('));
const presets = new Set([...presetBlock.matchAll(/^ {4}'?([a-z0-9-]+)'?: \(\) =>/gm)].map(m => m[1]));

need(routes.size === 22, `expected 22 routes in NAV, found ${routes.size}`);
for (const r of routes) need(renderers.has(r), `route ${r} has no PAGE renderer`);
for (const s of stateIds) need(presets.has(s), `HUD state ${s} has no preset in hud.js`);
for (const p of presets) need(stateIds.has(p), `preset ${p} is missing from prototype.js states`);

for (const s of D.prototype.states) s.decisions.forEach(d => need(decision(d), `state ${s.id}: unknown decision ${d}`));
for (const d of D.decisions.items) {
  need(stateIds.has(d.state), `decision ${d.id}: unknown state ${d.state}`);
  d.sources.forEach(s => need(sourceIds.has(s), `decision ${d.id}: unknown source ${s}`));
  need(['Accepted', 'Testing', 'Open', 'Rejected'].includes(d.status), `decision ${d.id}: bad status ${d.status}`);
}
for (const c of D.competitors.items) c.decisions.forEach(d => need(decision(d), `competitor ${c.id}: unknown decision ${d}`));
for (const p of D.uxPatterns.items) {
  need(decision(p.decisionId), `pattern ${p.id}: unknown decision ${p.decisionId}`);
  need(stateIds.has(p.state), `pattern ${p.id}: unknown state ${p.state}`);
  p.seen.forEach(s => need(sourceIds.has(s), `pattern ${p.id}: unknown source ${s}`));
}
for (const m of D.mechanics.items) need(m.state ? stateIds.has(m.state) : routes.has(m.route), `mechanic ${m.id}: bad link`);
for (const list of [D.notes.items, D.ideas.items, D.todo.groups.flatMap(g => g.items)]) for (const x of list) if (x.link) need(decision(x.link), `${x.id}: unknown decision ${x.link}`);
for (const z of D.interfaceSpec.zones) z.decision.split(' / ').forEach(d => need(decision(d), `zone ${z.name}: unknown decision ${d}`));

const E = D.entities;
for (const [id, u] of [...Object.entries(E.units), ...Object.entries(E.buildings)]) {
  need(E.factions[u.faction], `${id}: unknown faction ${u.faction}`);
  u.abilities.forEach(a => need(E.abilities[a], `${id}: unknown ability ${a}`));
}
for (const c of D.characters.items) need(c.unit === null || E.units[c.unit], `character ${c.id}: unknown unit ${c.unit}`);
for (const f of D.factions.items) f.units.forEach(u => need(E.units[u], `faction ${f.id}: unknown unit ${u}`));
for (const [type] of [...D.map.units, ...D.map.threatWave]) need(E.units[type], `map: unknown unit ${type}`);
for (const b of D.map.buildings) need(E.buildings[b.type], `map: unknown building ${b.type}`);
const locIds = ids(D.map.locations);
for (const l of D.locations.items) need(locIds.has(l.id), `location ${l.id} is not on the map`);

const route = r => r.split('?')[0];
for (const s of [...D.workflow.pipeline, ...D.workflow.stages, ...D.workflow.trace]) need(routes.has(route(s.route)), `workflow link ${s.route} is not a route`);
for (const t of D.workflow.trace) {
  const [r, q = ''] = t.route.split('?'), p = new URLSearchParams(q);
  if (p.get('state')) need(stateIds.has(p.get('state')), `trace: unknown state ${p.get('state')}`);
  if (p.get('item') && r === 'research/decisions') need(decision(p.get('item')), `trace: unknown decision ${p.get('item')}`);
  if (p.get('item') && r === 'development/notes') need(noteIds.has(p.get('item')), `trace: unknown note ${p.get('item')}`);
}

for (const r of D.references.items) {
  need(D.references.categories.includes(r.category), `reference ${r.id}: unknown category ${r.category}`);
  await stat(path.join(card, r.image)).catch(() => problems.push(`reference ${r.id}: missing ${r.image}`));
}
for (const s of scripts) await stat(path.join(card, s)).catch(() => problems.push(`index.html: missing ${s}`));

if (problems.length) {
  console.error(`Example Stephan Workflow: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Example Stephan Workflow OK: ${routes.size} routes, ${stateIds.size} HUD states, ${decisionIds.size} decisions, ${Object.keys(E.units).length} units, ${D.references.items.length} references.`);
