/* OVERLORD prototype map. World-space layout shared by the terrain painter,
   the HUD engine, the minimap and the Locations page. Units are world pixels;
   the origin is the top-left corner and north is up. */
(() => {
  const OW = (window.OW ||= {});
  const data = (OW.data ||= {});

  // Lay out `count` units of one type in a grid starting at (x, y).
  const block = (type, count, x, y, cols, gap = 24) =>
    Array.from({ length: count }, (_, i) => [type, x + (i % cols) * gap, y + Math.floor(i / cols) * gap]);

  data.map = {
    size: { w: 2400, h: 1500 },
    seed: 7,
    gate: { x: 1200, y: 900 },

    roads: [
      { id: 'south-road', width: 24, points: [[1180, 1520], [1192, 1380], [1172, 1250], [1200, 1120], [1206, 990], [1200, 860]] },
      { id: 'barrow-road', width: 18, points: [[1322, 712], [1440, 686], [1560, 622], [1660, 526], [1770, 448], [1830, 360], [1858, 318]] },
      { id: 'west-road', width: 20, points: [[1074, 760], [960, 792], [840, 802], [720, 832], [600, 880], [470, 902], [330, 930], [160, 962], [-30, 988]] },
      { id: 'ford-road', width: 18, points: [[1200, 1120], [1340, 1142], [1500, 1120], [1640, 1082], [1770, 1062], [1920, 1084], [2080, 1112], [2240, 1150], [2430, 1180]] },
      { id: 'field-track', width: 11, points: [[600, 880], [572, 780], [534, 660], [474, 560]] },
    ],

    river: { width: 30, points: [[2290, -30], [2250, 140], [2190, 262], [2222, 400], [2282, 540], [2240, 690], [2150, 830], [2092, 960], [2078, 1084], [2122, 1212], [2200, 1350], [2232, 1530]] },

    // kind: plowed | sprouts | wheat. angle: furrow direction in degrees.
    fields: [
      { id: 'north-wheat', kind: 'wheat', angle: 78, points: [[290, 540], [490, 505], [515, 700], [320, 745]] },
      { id: 'long-furrows', kind: 'plowed', angle: -8, points: [[330, 990], [640, 950], [700, 1185], [380, 1245]] },
      { id: 'young-barley', kind: 'sprouts', angle: -10, points: [[385, 1282], [705, 1222], [765, 1400], [440, 1452]] },
      { id: 'keep-plot', kind: 'plowed', angle: 4, points: [[742, 975], [905, 958], [935, 1105], [765, 1135]] },
    ],

    // Tree regions: ellipse centre and radii, tree count and conifer share.
    forests: [
      { x: 900, y: 50, rx: 1000, ry: 150, n: 170, conifer: 0.7 },
      { x: 90, y: 260, rx: 230, ry: 330, n: 80, conifer: 0.65 },
      { x: 30, y: 700, rx: 110, ry: 240, n: 34, conifer: 0.5 },
      { x: 150, y: 1400, rx: 290, ry: 160, n: 60, conifer: 0.55 },
      { x: 1620, y: 1470, rx: 540, ry: 110, n: 80, conifer: 0.6 },
      { x: 1960, y: 700, rx: 150, ry: 235, n: 64, conifer: 0.8 },
      { x: 2395, y: 760, rx: 130, ry: 660, n: 70, conifer: 0.75 },
      { x: 940, y: 455, rx: 110, ry: 78, n: 18, conifer: 0.4 },
      { x: 880, y: 1320, rx: 160, ry: 90, n: 22, conifer: 0.3 },
      { x: 1500, y: 300, rx: 150, ry: 90, n: 18, conifer: 0.6 },
      { x: 2040, y: 1330, rx: 150, ry: 120, n: 26, conifer: 0.5 },
    ],
    scatterTrees: 80,

    // Boulders: x, y, size. Small stones are scattered procedurally.
    rocks: [
      [1482, 878, 22], [1504, 902, 12], [1012, 600, 16], [1034, 584, 10], [1580, 1262, 21],
      [760, 560, 14], [1766, 792, 19], [420, 455, 15], [1352, 420, 13], [1702, 1200, 15],
      [980, 1170, 12], [1420, 1330, 17], [2010, 470, 14], [612, 640, 11], [1860, 1210, 13],
    ],
    scatterStones: 46,

    // Clearings keep the camera readable around buildings and starting units.
    clearings: [
      { x: 1200, y: 760, rx: 240, ry: 210 },
      { x: 1230, y: 1010, rx: 260, ry: 130 },
      { x: 700, y: 760, rx: 190, ry: 110 },
      { x: 1890, y: 270, rx: 150, ry: 120 },
      { x: 1640, y: 1012, rx: 70, ry: 70 },
      { x: 2085, y: 1100, rx: 70, ry: 60 },
    ],

    buildings: [
      { id: 'keep', type: 'keep', x: 1200, y: 740 },
      { id: 'watchtower', type: 'watchtower', x: 1640, y: 1010 },
      { id: 'farmstead', type: 'farmstead', x: 676, y: 752 },
      { id: 'barrow', type: 'barrow', x: 1890, y: 236 },
    ],

    // Starting army near the gate; [type, x, y].
    units: [
      ['general', 1206, 952],
      ...block('swordsman', 8, 1098, 984, 4),
      ...block('spearman', 5, 1268, 984, 5),
      ...block('archer', 6, 1272, 1036, 3),
      ...block('crossbow', 4, 1352, 1036, 2),
      ...block('knight', 4, 1086, 1074, 4, 30),
      ['priest', 1228, 1010], ['priest', 1176, 1046],
      // The Barrow Host camp.
      ...block('wight', 4, 1808, 336, 4, 26),
      ['hound', 1742, 300], ['hound', 1764, 322],
      ...block('bone-archer', 3, 1930, 330, 3, 24),
    ],

    // Spawned by the "Main Keep — under threat" state, outside the north-east wall.
    threatWave: [
      ...block('wight', 5, 1334, 566, 5, 24),
      ['hound', 1454, 602], ['hound', 1446, 640],
      ['bone-archer', 1466, 560],
    ],

    locations: [
      { id: 'varnhold', name: 'Varnhold Keep', x: 1200, y: 740, r: 190 },
      { id: 'millfield', name: 'Millfield', x: 560, y: 1000, r: 330 },
      { id: 'ashwood', name: 'Ashwood', x: 1960, y: 700, r: 220 },
      { id: 'barrows', name: 'The Barrows', x: 1880, y: 290, r: 190 },
      { id: 'greywater-ford', name: 'Greywater Ford', x: 2085, y: 1100, r: 120 },
      { id: 'watch-hill', name: 'Watch Hill', x: 1640, y: 1020, r: 120 },
    ],
  };
})();
