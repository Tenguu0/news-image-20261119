// World Front Page — Thursday 19 November 2026
// A newspaper front page summing up the day's world news in one image.
// Node 22, standard library only. No network, no Date, no randomness:
// two runs write byte-identical files.
import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

const PAGE_W = 1024;
const PAGE_H = 1024;
const PAPER = [246, 241, 229];
const INK = [25, 25, 25];
const BODY_INK = [58, 58, 58];
const RED = [158, 27, 30];
const BLUE = [29, 78, 137];
const SKY = [214, 205, 188];
const SUN = [214, 120, 40];

// ---------------------------------------------------------------- 5x7 font
// Hand-built pixel glyphs: 7 rows, 5 columns each, "1" = filled pixel.
const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  '"': ["01010", "01010", "00000", "00000", "00000", "00000", "00000"],
  "*": ["00000", "10101", "01110", "10101", "00000", "00000", "00000"],
  _: ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
};

// ---------------------------------------------------------------- pixel page
type RGB = [number, number, number];

class Page {
  w: number;
  h: number;
  buf: Buffer;
  constructor(w: number, h: number, bg: RGB) {
    this.w = w;
    this.h = h;
    this.buf = Buffer.alloc(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      this.buf[i * 3] = bg[0];
      this.buf[i * 3 + 1] = bg[1];
      this.buf[i * 3 + 2] = bg[2];
    }
  }
  px(x: number, y: number, c: RGB): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.buf[i] = c[0];
    this.buf[i + 1] = c[1];
    this.buf[i + 2] = c[2];
  }
  fill(x: number, y: number, w: number, h: number, c: RGB): void {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) this.px(xx, yy, c);
  }
  ruleH(x: number, y: number, w: number, c: RGB, thick = 1): void {
    this.fill(x, y, w, thick, c);
  }
  ruleV(x: number, y: number, h: number, c: RGB, thick = 1): void {
    this.fill(x, y, thick, h, c);
  }
  frame(x: number, y: number, w: number, h: number, c: RGB, thick = 1): void {
    this.ruleH(x, y, w, c, thick);
    this.ruleH(x, y + h - thick, w, c, thick);
    this.ruleV(x, y, h, c, thick);
    this.ruleV(x + w - thick, y, h, c, thick);
  }
  disc(cx: number, cy: number, r: number, c: RGB): void {
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++)
        if (dx * dx + dy * dy <= r * r) this.px(cx + dx, cy + dy, c);
  }
  ring(cx: number, cy: number, r: number, c: RGB): void {
    for (let a = 0; a < 360; a++) {
      const rad = (a * Math.PI) / 180;
      this.px(Math.round(cx + r * Math.cos(rad)), Math.round(cy + r * Math.sin(rad)), c);
    }
  }
  glyph(ch: string, x: number, y: number, s: number, c: RGB): void {
    const g = GLYPHS[ch] ?? GLYPHS[" "];
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] !== "1") continue;
        for (let dy = 0; dy < s; dy++)
          for (let dx = 0; dx < s; dx++)
            this.px(x + col * s + dx, y + r * s + dy, c);
      }
    }
  }
  drawText(str: string, x: number, y: number, s: number, c: RGB, bold = false): number {
    let cx = x;
    for (const ch of str) {
      this.glyph(ch, cx, y, s, c);
      if (bold) this.glyph(ch, cx + 1, y, s, c);
      cx += 6 * s;
    }
    return cx;
  }
  measure(str: string, s: number): number {
    return str.length * 6 * s - s;
  }
  // Greedy word wrap into lines no wider than maxW pixels.
  wrap(str: string, s: number, maxW: number): string[] {
    const out: string[] = [];
    let cur = "";
    for (const w of str.split(" ")) {
      const trial = cur ? cur + " " + w : w;
      if (this.measure(trial, s) <= maxW || !cur) cur = trial;
      else {
        out.push(cur);
        cur = w;
      }
    }
    if (cur) out.push(cur);
    return out;
  }
  para(str: string, x: number, y: number, s: number, c: RGB, maxW: number, leading: number): number {
    const lines = this.wrap(str, s, maxW);
    lines.forEach((ln, i) => this.drawText(ln, x, y + i * leading, s, c));
    return y + lines.length * leading;
  }
}

// ---------------------------------------------------------------- PNG writer
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function toPNG(pg: Page): Buffer {
  const raw = Buffer.alloc(pg.h * (1 + pg.w * 3));
  for (let y = 0; y < pg.h; y++) {
    raw[y * (1 + pg.w * 3)] = 0; // filter: none
    pg.buf.copy(raw, y * (1 + pg.w * 3) + 1, y * pg.w * 3, (y + 1) * pg.w * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(pg.w, 0);
  ihdr.writeUInt32BE(pg.h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- news copy
// All text is hardcoded: the entry runs with no network.
// Sources checked the morning of 19 Nov 2026: Jagran Josh top world news,
// Reuters, Financial Times, NASA.
const LEAD = {
  kicker: "CULTURE - GRAND THEFT AUTO VI",
  headline: [
    "GAMERS ENTER VICE CITY",
    "AS GTA VI ROLLS OUT",
    "AROUND THE WORLD",
  ],
  deck: "ROCKSTAR'S LONG-AWAITED GRAND THEFT AUTO VI BEGAN ITS GLOBAL ROLLOUT ON THURSDAY, SENDING PLAYERS BACK TO VICE CITY IN THE MOST ANTICIPATED GAME LAUNCH IN YEARS.",
};

const STORIES = [
  {
    section: "SUMMIT",
    headline: "TRUMP, XI AND PUTIN MEET AT APEC IN SHENZHEN",
    body: "THE THREE LEADERS HELD TRILATERAL TALKS AT THE APEC SUMMIT ON THURSDAY, WITH A SIDELINE PUTIN-TRUMP MEETING AFTER THE PLENARY. NO FULL-SCALE BILATERAL TALKS WERE PLANNED.",
  },
  {
    section: "SPACE",
    headline: "VOYAGER 1 REACHES ONE LIGHT-DAY FROM EARTH",
    body: "NASA'S VOYAGER 1 PROBE, NEARLY 50 YEARS INTO ITS JOURNEY, REACHED ONE LIGHT-DAY FROM EARTH. NASA WAS DUE TO CONFIRM THE MILESTONE AT A NEWS CONFERENCE ON THURSDAY.",
  },
  {
    section: "UKRAINE",
    headline: "EU PROPOSES 45BN EURO LOAN FOR UKRAINE",
    body: "THE EUROPEAN COMMISSION PROPOSED A 45 BILLION EURO LOAN TO FUND KYIV'S BUDGET, TO BE REPAID ONLY AFTER RUSSIA PAYS WAR REPARATIONS, THE FINANCIAL TIMES REPORTED.",
  },
  {
    section: "MIDDLE EAST",
    headline: "US AND IRAN TRADE FIRE AS GULF ATTACKS WIDEN",
    body: "THE US STRUCK A MISSILE SITE ON IRAN'S QESHM ISLAND AFTER IRAN HIT A US RADAR SITE IN BAHRAIN, THEN WIDENED ATTACKS TO KUWAIT. WASHINGTON RAISED ITS CARRIER FORCE TO THREE.",
  },
  {
    section: "TECH",
    headline: "HUANG QUITS NVIDIA AS CHINA CHIP SALES HALT",
    body: "NVIDIA FOUNDER JENSEN HUANG RESIGNED, SHAKING THE AI WORLD. ACTING CHIEF COLETTE KRESS PROMISED EARLIER PAY RISES, AND SAID H-SERIES CHIP SHIPMENTS TO CHINA HAVE STOPPED.",
  },
  {
    section: "WEATHER",
    headline: "CYCLONE AKVAN NEARS INDIA'S EAST COAST",
    body: "CYCLONE AKVAN WAS SET TO INTENSIFY INTO A VERY SEVERE CYCLONIC STORM BEFORE LANDFALL ON THE ANDHRA PRADESH COAST ON 20 NOVEMBER, WITH ODISHA ALSO ON ALERT.",
  },
];

const ALSO =
  "ALSO TODAY: FED MINUTES POINT TO MORE RATE HIKES - AUSTRALIA SANCTIONS ISRAELI SETTLERS - NSA INTERNAL NETWORK SUFFERS OUTAGE - GOLD UNDER PRESSURE AS DOLLAR FIRMS";

// ---------------------------------------------------------------- artwork
// Vice City skyline: a setting sun, a row of towers with lit windows,
// and the sea below. Drawn inside the box x 770..990, y 160..284, so it
// sits right of the lead headline and clears the deck rule at y = 310.
function drawSkyline(pg: Page): void {
  const base = 272; // sea level: building bottoms
  // Sun, low over the towers.
  pg.disc(928, 188, 20, SUN);
  pg.ring(928, 188, 20, RED);
  // Towers: [x, width, top].
  const towers: [number, number, number][] = [
    [772, 32, 214],
    [808, 26, 192],
    [838, 38, 224],
    [880, 28, 172],
    [912, 34, 204],
    [950, 30, 230],
  ];
  for (const [tx, tw, top] of towers) {
    pg.fill(tx, top, tw, base - top, INK);
    // Lit windows: a small grid of paper-coloured dots.
    for (let wy = top + 8; wy < base - 8; wy += 12)
      for (let wx = tx + 6; wx < tx + tw - 5; wx += 10)
        pg.fill(wx, wy, 4, 5, PAPER);
  }
  // Antenna on the tallest tower.
  pg.ruleV(892, 158, 14, INK, 2);
  pg.disc(893, 156, 3, RED);
  // Sea: three blue strokes under the towers.
  pg.ruleH(770, base + 4, 220, BLUE, 2);
  pg.ruleH(786, base + 10, 188, BLUE, 2);
  pg.ruleH(802, base + 16, 156, BLUE, 2);
  // Caption, centred under the skyline.
  const label = "VICE CITY";
  pg.drawText(label, 880 - Math.round(pg.measure(label, 2) / 2), 292, 2, RED, true);
}

// ---------------------------------------------------------------- layout
function render(pg: Page): void {
  const M = 34; // page margin
  const RW = PAGE_W - 2 * M; // 956

  // Masthead.
  const title = "WORLD FRONT PAGE";
  const tw = pg.measure(title, 8);
  pg.drawText(title, Math.round((PAGE_W - tw) / 2), 30, 8, INK, true);
  pg.ruleH(M, 96, RW, INK, 2);
  const dateline = "THURSDAY 19 NOVEMBER 2026";
  const dw = pg.measure(dateline, 2);
  pg.drawText(dateline, Math.round((PAGE_W - dw) / 2), 108, 2, RED, true);
  pg.drawText("NO. 1", M, 108, 2, BODY_INK);
  const rightNote = "ONE DAY - ONE PAGE";
  pg.drawText(rightNote, PAGE_W - M - pg.measure(rightNote, 2), 108, 2, BODY_INK);
  pg.ruleH(M, 132, RW, INK, 4);
  pg.ruleH(M, 140, RW, INK, 1);

  // Lead story: kicker, three-line headline, skyline at the right.
  let y = 158;
  pg.drawText(LEAD.kicker, M, y, 2, RED, true);
  y += 26;
  for (const line of LEAD.headline) {
    pg.drawText(line, M, y, 5, INK, true);
    y += 7 * 5 + 8;
  }
  drawSkyline(pg);

  // Lead deck, full width under the headline block. Full-ink rule + ink
  // text: the deck is the second-most prominent copy on the page, so it
  // gets the same contrast as the headlines instead of faint grey.
  y = 318;
  pg.ruleH(M, y - 8, RW, INK, 1);
  y = pg.para(LEAD.deck, M, y, 2, INK, RW, 17);
  y += 10;
  pg.ruleH(M, y, RW, INK, 4);
  pg.ruleH(M, y + 6, RW, INK, 1);
  y += 22;

  // Secondary stories: 2 columns x 3 rows.
  const colW = Math.floor((RW - 24) / 2); // 466
  const rowH = 182; // a little air between rows; also fills the empty band at the page foot
  const colX = [M, M + colW + 24];
  STORIES.forEach((s, i) => {
    const cx = colX[i % 2];
    const cy = y + Math.floor(i / 2) * rowH;
    pg.drawText(s.section, cx, cy, 2, RED, true);
    pg.ruleH(cx, cy + 18, 52, RED, 2);
    const headLines = pg.wrap(s.headline, 3, colW);
    headLines.forEach((ln, j) => pg.drawText(ln, cx, cy + 28 + j * 26, 3, INK, true));
    const bodyY = cy + 28 + headLines.length * 26 + 4;
    pg.para(s.body, cx, bodyY, 2, BODY_INK, colW, 17);
    if (i % 2 === 0) pg.ruleV(cx + colW + 12, cy, rowH - 14, INK, 1); // full-ink column divider: the SKY rule was nearly invisible against the paper
  });
  y += 3 * rowH + 6;

  // Footer strip.
  pg.ruleH(M, y, RW, INK, 2);
  y += 10;
  pg.para(ALSO, M, y, 2, BODY_INK, RW, 17);
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  fs.mkdirSync(outDir, { recursive: true });
  const pg = new Page(PAGE_W, PAGE_H, PAPER);
  render(pg);
  fs.writeFileSync(path.join(outDir, "entry.png"), toPNG(pg));
}

main();
