/* Procedural terrain painter. Draws the static battlefield (grass, fields,
   river, roads, rocks and trees) from map.js onto one canvas with a seeded
   random generator, so the map looks the same on every load. The result is
   cached and reused by the HUD, the minimap and the Locations page. */
(() => {
  const OW = (window.OW ||= {});
  let cache = null;

  const rng = seed => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hex = (h, a) => {
    const n = parseInt(h.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  };

  /* ---------- Geometry helpers ---------- */
  const segDist = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  };
  const lineDist = (x, y, pts) => {
    let d = Infinity;
    for (let i = 1; i < pts.length; i++) d = Math.min(d, segDist(x, y, ...pts[i - 1], ...pts[i]));
    return d;
  };
  const inPoly = (x, y, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const inEllipse = (x, y, e, pad = 0) => ((x - e.x) / (e.rx + pad)) ** 2 + ((y - e.y) / (e.ry + pad)) ** 2 < 1;

  // True where trees, rocks and flowers should not appear.
  const blocked = (map, x, y, pad = 0) => {
    if (map.roads.some(r => lineDist(x, y, r.points) < r.width / 2 + 12 + pad)) return true;
    if (lineDist(x, y, map.river.points) < map.river.width / 2 + 16 + pad) return true;
    if (map.fields.some(f => inPoly(x, y, f.points))) return true;
    return map.clearings.some(c => inEllipse(x, y, c, pad));
  };

  // Smooth a polyline with quadratic curves through segment midpoints.
  const smooth = (g, pts) => {
    g.beginPath(); g.moveTo(...pts[0]);
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i], [nx, ny] = pts[i + 1];
      g.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
    }
    g.lineTo(...pts[pts.length - 1]);
  };
  const strokePath = (g, pts, width, color, alpha = 1, dash = null) => {
    smooth(g, pts);
    g.lineWidth = width; g.strokeStyle = hex(color, alpha); g.lineCap = 'round'; g.lineJoin = 'round';
    g.setLineDash(dash || []); g.stroke(); g.setLineDash([]);
  };
  const along = (pts, step) => {
    const out = [];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], len = Math.hypot(bx - ax, by - ay);
      for (let d = 0; d < len; d += step) out.push([ax + (bx - ax) * d / len, ay + (by - ay) * d / len, Math.atan2(by - ay, bx - ax)]);
    }
    return out;
  };

  const blob = (g, x, y, r, color, alpha, sx = 1, sy = 1) => {
    g.save(); g.translate(x, y); g.scale(sx, sy);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, hex(color, alpha)); gr.addColorStop(1, hex(color, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.restore();
  };

  /* ---------- Layers ---------- */
  const grass = (g, map, rnd) => {
    const { w, h } = map.size;
    g.fillStyle = '#3d5629'; g.fillRect(0, 0, w, h);
    const tints = ['#4a6a30', '#2f4721', '#577838', '#3a5a2a', '#62813d', '#34502a', '#4d5f2c'];
    for (let i = 0; i < 460; i++) blob(g, rnd() * w, rnd() * h, 50 + rnd() * 210, tints[i % tints.length], 0.12 + rnd() * 0.16);
    for (let i = 0; i < 70; i++) blob(g, rnd() * w, rnd() * h, 40 + rnd() * 120, '#80803f', 0.07 + rnd() * 0.08);
    for (const f of map.forests) blob(g, f.x, f.y, Math.max(f.rx, f.ry) * 1.15, '#1c2a16', 0.5, f.rx / Math.max(f.rx, f.ry), f.ry / Math.max(f.rx, f.ry));

    // Fine grain from a small noise tile.
    const tile = document.createElement('canvas'); tile.width = tile.height = 128;
    const tg = tile.getContext('2d'), img = tg.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rnd() < 0.5 ? 0 : 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 10 + rnd() * 14;
    }
    tg.putImageData(img, 0, 0);
    g.fillStyle = g.createPattern(tile, 'repeat'); g.fillRect(0, 0, w, h);

    // Grass strokes batched per colour.
    const colors = ['#6d8f45', '#2b4220', '#7e9c50', '#3f5d2c', '#8fa95c', '#23361a'];
    g.lineCap = 'round';
    colors.forEach((c, ci) => {
      g.beginPath();
      for (let i = 0; i < 7000; i++) {
        const x = rnd() * w, y = rnd() * h, l = 2 + rnd() * 4, a = -Math.PI / 2 + (rnd() - 0.5) * 0.9;
        g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      }
      g.lineWidth = ci % 2 ? 1.1 : 0.8; g.strokeStyle = hex(c, 0.35); g.stroke();
    });
  };

  const fields = (g, map, rnd) => {
    const base = { plowed: '#5b4430', sprouts: '#4e4a2c', wheat: '#9a8443' };
    for (const f of map.fields) {
      const pts = f.points, cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      g.save();
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.fillStyle = base[f.kind]; g.fill(); g.clip();
      blob(g, cx - 40, cy - 30, 220, f.kind === 'wheat' ? '#c2a85a' : '#6e5638', 0.35);
      g.translate(cx, cy); g.rotate((f.angle * Math.PI) / 180);
      for (let y = -320; y < 320; y += 8) {
        g.fillStyle = hex(f.kind === 'wheat' ? '#6f5a2a' : '#35261a', f.kind === 'wheat' ? 0.45 : 0.6); g.fillRect(-320, y, 640, 2.6);
        g.fillStyle = hex(f.kind === 'wheat' ? '#d5bd6c' : '#7d6146', 0.35); g.fillRect(-320, y + 4, 640, 1.6);
        if (f.kind !== 'plowed') {
          g.fillStyle = hex(f.kind === 'wheat' ? '#e2cb7c' : '#7fa04a', 0.75);
          for (let x = -320; x < 320; x += 4 + rnd() * 3) g.fillRect(x, y + 2.6, 1.6, 1.4);
        }
      }
      g.restore();
      // Hedge edge.
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.lineWidth = 7; g.strokeStyle = hex('#2c3f20', 0.55); g.stroke();
      g.lineWidth = 2; g.strokeStyle = hex('#7a6a48', 0.5); g.setLineDash([2, 7]); g.stroke(); g.setLineDash([]);
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        for (let t = 0; t < 1; t += 0.06) if (rnd() < 0.45) blob(g, ax + (bx - ax) * t, ay + (by - ay) * t, 6 + rnd() * 6, '#2b4220', 0.8);
      }
    }
  };

  const river = (g, map, rnd) => {
    const p = map.river.points;
    strokePath(g, p, 52, '#33402a', 0.55);
    strokePath(g, p, 40, '#4a4430', 0.75);
    strokePath(g, p, 30, '#1d3a44');
    strokePath(g, p, 18, '#2a5662', 0.85);
    strokePath(g, p, 7, '#3b7280', 0.5);
    strokePath(g, p, 1.6, '#cfe6ea', 0.22, [10, 26]);
    for (const [x, y] of along(p, 14)) if (rnd() < 0.5) blob(g, x + (rnd() - 0.5) * 50, y + (rnd() - 0.5) * 30, 7 + rnd() * 6, '#2b4220', 0.7);
  };

  const roads = (g, map, rnd) => {
    for (const r of map.roads) {
      const w = r.width;
      strokePath(g, r.points, w + 16, '#4b3a26', 0.35);
      strokePath(g, r.points, w, '#7a6044');
      strokePath(g, r.points, w * 0.58, '#523d29', 0.95);
      strokePath(g, r.points, w * 0.58 - 4, '#88694a');
      strokePath(g, r.points, 3, '#5f7a3c', 0.35);
      for (const [x, y, a] of along(r.points, 5)) {
        const o = (rnd() - 0.5) * w;
        g.fillStyle = hex(rnd() < 0.5 ? '#a89a86' : '#4e3d2a', 0.45);
        g.fillRect(x - Math.sin(a) * o, y + Math.cos(a) * o, 1.6, 1.6);
        if (rnd() < 0.35) {
          const side = rnd() < 0.5 ? -1 : 1, e = (w / 2 + 2) * side;
          g.strokeStyle = hex('#6d8f45', 0.55); g.lineWidth = 1; g.beginPath();
          g.moveTo(x - Math.sin(a) * e, y + Math.cos(a) * e); g.lineTo(x - Math.sin(a) * e + (rnd() - 0.5) * 3, y + Math.cos(a) * e - 4); g.stroke();
        }
      }
    }
    // Stones at the ford.
    for (let i = 0; i < 26; i++) rock(g, 2085 + (rnd() - 0.5) * 70, 1100 + (rnd() - 0.5) * 36, 2 + rnd() * 3, rnd);
  };

  const clearings = (g, map) => {
    blob(g, 1200, 760, 230, '#6b5a40', 0.5, 1, 0.92);
    blob(g, 1210, 960, 150, '#5d4c36', 0.45, 1.6, 0.8);
    blob(g, 680, 760, 130, '#6b5a40', 0.45, 1.3, 0.8);
    blob(g, 1880, 250, 160, '#2a2a1c', 0.55);
    blob(g, 1640, 1010, 60, '#6b5a40', 0.5);
  };

  function rock(g, x, y, s, rnd) {
    g.fillStyle = 'rgba(0,0,0,.32)'; g.beginPath(); g.ellipse(x + s * 0.35, y + s * 0.45, s * 1.05, s * 0.8, 0, 0, Math.PI * 2); g.fill();
    const n = 7 + Math.floor(rnd() * 3), pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = s * (0.72 + rnd() * 0.36); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.85]); }
    const gr = g.createLinearGradient(x - s, y - s, x + s, y + s);
    gr.addColorStop(0, '#a29d92'); gr.addColorStop(0.55, '#76726a'); gr.addColorStop(1, '#46433e');
    g.fillStyle = gr; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(30,28,26,.45)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = 'rgba(210,205,195,.28)'; g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.3, s * 0.35, s * 0.22, -0.6, 0, Math.PI * 2); g.fill();
    if (s > 9) { g.fillStyle = 'rgba(79,106,53,.55)'; g.beginPath(); g.arc(x + s * 0.2, y - s * 0.1, s * 0.22, 0, Math.PI * 2); g.fill(); }
  }

  const conifer = (g, x, y, s, rnd) => {
    g.fillStyle = 'rgba(8,14,6,.38)'; g.beginPath(); g.ellipse(x + s * 0.55, y + s * 0.65, s * 1.05, s * 0.8, 0.4, 0, Math.PI * 2); g.fill();
    const layers = [[1, '#1b311d'], [0.74, '#26452a'], [0.48, '#335c37'], [0.24, '#46744a']];
    const spikes = 9 + Math.floor(rnd() * 3), rot = rnd() * Math.PI;
    for (const [k, c] of layers) {
      g.fillStyle = c; g.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const a = rot + (i / (spikes * 2)) * Math.PI * 2, r = s * k * (i % 2 ? 0.62 : 1);
        const px = x - s * (1 - k) * 0.18 + Math.cos(a) * r, py = y - s * (1 - k) * 0.22 + Math.sin(a) * r;
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.closePath(); g.fill();
    }
  };
  const deciduous = (g, x, y, s, rnd) => {
    g.fillStyle = 'rgba(8,14,6,.36)'; g.beginPath(); g.ellipse(x + s * 0.5, y + s * 0.6, s * 1.1, s * 0.85, 0.3, 0, Math.PI * 2); g.fill();
    const tone = rnd() < 0.2 ? ['#7a8a3a', '#3d4a1f'] : ['#5b8237', '#253f1b'];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rnd(), d = i === 5 ? 0 : s * 0.42;
      const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d, r = s * (0.48 + rnd() * 0.16);
      const gr = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
      gr.addColorStop(0, tone[0]); gr.addColorStop(1, tone[1]);
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    }
  };

  const nature = (g, map, rnd) => {
    const { w, h } = map.size;
    // Scattered stones and boulders.
    for (let i = 0; i < map.scatterStones; i++) {
      const x = rnd() * w, y = rnd() * h;
      if (!blocked(map, x, y)) rock(g, x, y, 3 + rnd() * 5, rnd);
    }
    for (const [x, y, s] of map.rocks) rock(g, x, y, s, rnd);

    // Flowers in meadows.
    const petals = ['#e8e0a0', '#e4ded2', '#b9a0d8', '#f0c27a'];
    for (let i = 0; i < 260; i++) {
      const x = rnd() * w, y = rnd() * h;
      if (blocked(map, x, y)) continue;
      g.fillStyle = hex(petals[i % petals.length], 0.75);
      for (let k = 0; k < 8; k++) { g.beginPath(); g.arc(x + (rnd() - 0.5) * 22, y + (rnd() - 0.5) * 16, 0.8 + rnd() * 0.8, 0, Math.PI * 2); g.fill(); }
    }

    // Trees: rejection-sampled inside each forest, drawn north to south.
    const trees = [];
    const near = (x, y, d) => trees.some(t => Math.abs(t.x - x) < d && Math.abs(t.y - y) < d && Math.hypot(t.x - x, t.y - y) < d);
    const place = (x, y, s, con) => {
      if (x < -20 || y < -20 || x > w + 20 || y > h + 20 || blocked(map, x, y, s * 0.4) || near(x, y, s * 1.05)) return false;
      trees.push({ x, y, s, con }); return true;
    };
    for (const f of map.forests) {
      for (let tries = 0, made = 0; made < f.n && tries < f.n * 12; tries++) {
        const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd());
        if (place(f.x + Math.cos(a) * f.rx * d, f.y + Math.sin(a) * f.ry * d, 13 + rnd() * 15, rnd() < f.conifer)) made++;
      }
    }
    for (let i = 0; i < map.scatterTrees; i++) place(rnd() * w, rnd() * h, 10 + rnd() * 10, rnd() < 0.45);
    for (let i = 0; i < 120; i++) {
      const x = rnd() * w, y = rnd() * h;
      if (!blocked(map, x, y, 4) && !near(x, y, 14)) trees.push({ x, y, s: 4 + rnd() * 4, con: false });
    }
    trees.sort((a, b) => a.y - b.y).forEach(t => (t.con ? conifer : deciduous)(g, t.x, t.y, t.s, rnd));
  };

  const paint = map => {
    const c = document.createElement('canvas');
    c.width = map.size.w; c.height = map.size.h;
    const g = c.getContext('2d'), rnd = rng(map.seed);
    grass(g, map, rnd);
    clearings(g, map);
    fields(g, map, rnd);
    river(g, map, rnd);
    roads(g, map, rnd);
    nature(g, map, rnd);
    return c;
  };

  OW.terrain = {
    // The full-resolution terrain canvas, painted on first use.
    get: () => (cache ||= paint(OW.data.map)),
    // Draw a scaled copy into another canvas (minimap, location thumbnails).
    drawInto(canvas, sx = 0, sy = 0, sw = OW.data.map.size.w, sh = OW.data.map.size.h) {
      const g = canvas.getContext('2d');
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.drawImage(OW.terrain.get(), sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      return g;
    },
  };
})();
