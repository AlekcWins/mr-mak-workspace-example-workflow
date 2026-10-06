#!/usr/bin/env node
// Validates the Feature Atlas data, its files and the card's registered tabs.
// Usage: node projects/feature-atlas/check-atlas.mjs  (exit code 1 on errors)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENTITY_ID = 'feature-atlas';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const errors = [];
const warnings = [];
const error = message => errors.push(message);
const warn = message => warnings.push(message);

const readJson = file => {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch (cause) { error(`${path.relative(repo, file)}: ${cause.message}`); return null; }
};

const registry = readJson(path.join(repo, 'workspace', 'workspace.json'));
const entity = registry?.entities?.find(item => item.id === ENTITY_ID);
if (registry && !entity) error(`workspace.json has no entity "${ENTITY_ID}".`);
const atlasDir = path.join(repo, 'workspace', entity?.folder || '2026-10-05_feature-atlas');
const atlas = readJson(path.join(atlasDir, 'data', 'atlas.json'));

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE = /\.(?:png|jpe?g|webp|gif|avif|svg)$/i;
const isText = value => typeof value === 'string' && value.trim() !== '';
const isWebUrl = value => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };
const localFile = (label, value, pattern) => {
  if (!isText(value)) { error(`${label}: path is missing.`); return null; }
  if (/^(?:[a-z][\w+.-]*:|[\\/])/i.test(value) || value.includes('\\')) { error(`${label}: "${value}" must be a relative path with forward slashes.`); return null; }
  const file = path.resolve(atlasDir, value);
  if (!file.startsWith(atlasDir + path.sep)) { error(`${label}: "${value}" points outside the card folder.`); return null; }
  if (pattern && !pattern.test(value)) error(`${label}: "${value}" has an unsupported file type.`);
  if (!existsSync(file) || !statSync(file).isFile()) { error(`${label}: "${value}" does not exist.`); return null; }
  return file;
};
const checkIds = (kind, list) => {
  const seen = new Set();
  list.forEach((item, index) => {
    const label = `${kind} #${index + 1}${isText(item?.id) ? ` "${item.id}"` : ''}`;
    if (!isText(item?.id)) error(`${label}: id is missing.`);
    else if (!ID.test(item.id)) error(`${label}: id must be lowercase kebab-case.`);
    else if (seen.has(item.id)) error(`${label}: duplicate id.`);
    else seen.add(item.id);
  });
  return seen;
};

const referenced = new Set();
let screenshots = 0;
if (atlas) {
  const lists = {};
  for (const key of ['competitors', 'features', 'results']) {
    lists[key] = Array.isArray(atlas[key]) ? atlas[key] : [];
    if (!Array.isArray(atlas[key])) error(`atlas.json: "${key}" must be an array.`);
  }
  const competitorIds = checkIds('Competitor', lists.competitors);
  const featureIds = checkIds('Feature', lists.features);
  checkIds('Result', lists.results);

  for (const competitor of lists.competitors) {
    const label = `Competitor "${competitor?.id}"`;
    if (!isText(competitor?.name)) error(`${label}: name is missing.`);
    if (competitor?.url != null && !isWebUrl(competitor.url)) error(`${label}: url must start with http:// or https://.`);
    if (competitor?.logo != null) { const file = localFile(`${label} logo`, competitor.logo, IMAGE); if (file) referenced.add(file); }
  }

  const categories = new Map();
  for (const feature of lists.features) {
    const label = `Feature "${feature?.id}"`;
    if (!isText(feature?.title)) error(`${label}: title is missing.`);
    if (!competitorIds.has(feature?.competitor)) error(`${label}: competitor "${feature?.competitor}" does not exist.`);
    else if (isText(feature.id) && !feature.id.startsWith(`${feature.competitor}-`)) warn(`${label}: id should start with "${feature.competitor}-".`);
    if (!isText(feature?.summary)) warn(`${label}: summary is missing.`);
    if (feature?.description != null && typeof feature.description !== 'string') error(`${label}: description must be text.`);
    if (feature?.highlights != null && !(Array.isArray(feature.highlights) && feature.highlights.every(isText))) error(`${label}: highlights must be a list of text.`);
    if (feature?.source != null && !isWebUrl(feature.source)) error(`${label}: source must start with http:// or https://.`);
    if (isText(feature?.category)) {
      const key = feature.category.trim().toLowerCase();
      if (categories.has(key) && categories.get(key) !== feature.category) warn(`${label}: category "${feature.category}" differs from "${categories.get(key)}" only by case or spacing.`);
      else categories.set(key, feature.category);
    }
    if (feature?.images != null && !Array.isArray(feature.images)) error(`${label}: images must be a list.`);
    for (const [index, image] of (Array.isArray(feature?.images) ? feature.images : []).entries()) {
      const src = typeof image === 'string' ? image : image?.src;
      const file = localFile(`${label} image ${index + 1}`, src, IMAGE);
      if (file) { referenced.add(file); screenshots += 1; }
      if (typeof image !== 'string' && !isText(image?.caption) && !isText(image?.alt)) warn(`${label} image ${index + 1}: add a caption describing what it shows.`);
    }
  }

  const steps = new Set((entity?.steps || []).map(step => step.path));
  for (const result of lists.results) {
    const label = `Result "${result?.id}"`;
    if (!isText(result?.title)) error(`${label}: title is missing.`);
    if (!Array.isArray(result?.from) || !result.from.length) error(`${label}: "from" must list the referenced feature IDs.`);
    else for (const id of result.from) if (!featureIds.has(id)) error(`${label}: referenced feature "${id}" does not exist.`);
    for (const key of ['spec', 'design']) {
      const file = localFile(`${label} ${key}`, result?.[key]);
      if (file && !steps.has(result[key])) error(`${label}: ${key} "${result[key]}" is not a tab in workspace.json.`);
    }
    if (result?.preview != null) { const file = localFile(`${label} preview`, result.preview, IMAGE); if (file) referenced.add(file); }
  }
  console.log(`Feature Atlas: ${plural(lists.competitors.length, 'competitor')}, ${plural(lists.features.length, 'feature')}, ${plural(screenshots, 'screenshot')}, ${plural(lists.results.length, 'built feature')}.`);
}

if (entity) {
  if (!entity.pinned) warn('The Feature Atlas card is not pinned.');
  for (const step of entity.steps || []) if (!existsSync(path.join(atlasDir, step.path))) error(`Tab "${step.name}": ${step.path} does not exist.`);
}

const walk = dir => existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)]) : [];
for (const file of walk(path.join(atlasDir, 'assets'))) if (IMAGE.test(file) && !referenced.has(file)) warn(`Unused screenshot: ${path.relative(atlasDir, file).replaceAll('\\', '/')}`);

function plural(count, word) { return `${count} ${word}${count === 1 ? '' : 's'}`; }
for (const message of errors) console.log(`error   ${message}`);
for (const message of warnings) console.log(`warning ${message}`);
console.log(errors.length ? `${plural(errors.length, 'error')}, ${plural(warnings.length, 'warning')}.` : `OK${warnings.length ? ` with ${plural(warnings.length, 'warning')}` : ''}.`);
process.exitCode = errors.length ? 1 : 0;
