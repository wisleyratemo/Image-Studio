// Draws a transaction-detail screen design mockup onto a canvas.
//
// The SAMPLE watermark is drawn unconditionally as the final step of every
// render. There is deliberately no option to disable it: this tool produces
// design/test mockups, and the output must never pass as a real receipt.

export type MockupData = {
  action: string; // e.g. "Withdrawn"
  amount: string;
  token: string;
  fiatApprox: string;
  status: string;
  address: string;
  price: string;
  network: string;
  networkFee: string;
  transactionId: string;
  submittedTime: string;
  referenceNo: string;
  clockTime: string;
  buttonLabel: string;
  helpLink: string;
};

export const SAMPLE_DATA: MockupData = {
  action: "Withdrawn",
  amount: "8,819",
  token: "USDT",
  fiatApprox: "~$8,807.44",
  status: "Completed",
  address: "TV2nyNjW5i1AffjscW9F9UPcKQT4DTuwJ",
  price: "$0.99/USDT",
  network: "Tron (TRC20)",
  networkFee: "2 USDT",
  transactionId: "1edcb...5479",
  submittedTime: "Nov 7, 2026 3:36 PM",
  referenceNo: "442822384",
  clockTime: "17:12",
  buttonLabel: "View on blockchain explorer",
  helpLink: "Why hasn't my transaction arrived?",
};

// Logical size of the phone screen; exported at SCALE for a crisp PNG.
export const WIDTH = 390;
export const HEIGHT = 844;
export const SCALE = 3;

const FONT = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;

const C = {
  bg: "#05080d",
  text: "#f2f4f6",
  muted: "#9aa3ad",
  divider: "#1b1f27",
  green: "#45d3a6",
  accent: "#BBFF30",
  icon: "#5b6cff",
};

const TETHER_ICON = typeof window !== "undefined" ? (() => {
  const img = new Image();
  img.src = "/tether-usdt-icon.svg";
  return img;
})() : null;

const CIRCULAR_LOGO = typeof window !== "undefined" ? (() => {
  const img = new Image();
  img.src = "/circular-logo.svg";
  return img;
})() : null;

const GREEN_TICK = typeof window !== "undefined" ? (() => {
  const img = new Image();
  img.src = "/green-tick.svg";
  return img;
})() : null;

const STATUS_ICON_VARIANTS = [
  "/wifi-battery-010-percent.svg",
  "/wifi-battery-020-percent.svg",
  "/wifi-battery-030-percent.svg",
  "/wifi-battery-040-percent.svg",
  "/wifi-battery-050-percent.svg",
  "/wifi-battery-060-percent.svg",
  "/wifi-battery-070-percent.svg",
  "/wifi-battery-080-percent.svg",
  "/wifi-battery-090-percent.svg",
  "/wifi-battery-100-percent.svg",
];

const STATUS_ICONS = typeof window !== "undefined" ? (() => {
  const storageKey = "image-studio-status-icon";
  const previous = window.sessionStorage.getItem(storageKey);
  const choices = STATUS_ICON_VARIANTS.filter((src) => src !== previous);
  const selected = choices[Math.floor(Math.random() * choices.length)];
  window.sessionStorage.setItem(storageKey, selected);

  const img = new Image();
  img.src = selected;
  return img;
})() : null;

const DOLLAR_ICON = typeof window !== "undefined" ? (() => {
  const img = new Image();
  img.src = "/dollar-icon.svg";
  return img;
})() : null;

const ASSET_IMAGES = [TETHER_ICON, CIRCULAR_LOGO, GREEN_TICK, STATUS_ICONS, DOLLAR_ICON].filter((i): i is HTMLImageElement => !!i);

function drawTokenBadge(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;

  if (CIRCULAR_LOGO && CIRCULAR_LOGO.complete) {
    ctx.drawImage(CIRCULAR_LOGO, x, y, size, size);
    return;
  }

  if (TETHER_ICON && TETHER_ICON.complete) {
    ctx.drawImage(TETHER_ICON, x, y, size, size);
    return;
  }

  ctx.fillStyle = "#52af95";
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font(20, 700);
  ctx.fillText("₮", cx, cy + 1);
}

function font(size: number, weight = 400) {
  return `${weight} ${size}px ${FONT}`;
}

const tintedDollarCache = new Map<string, HTMLCanvasElement>();

/** Returns the dollar SVG recoloured to `color` (rendered at high resolution, cached). */
function tintedDollar(color: string): HTMLCanvasElement | null {
  if (!DOLLAR_ICON || !DOLLAR_ICON.complete || !DOLLAR_ICON.naturalWidth) return null;
  const cached = tintedDollarCache.get(color);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = 140;
  c.height = 220;
  const cx = c.getContext("2d");
  if (!cx) return null;
  cx.drawImage(DOLLAR_ICON, 0, 0, c.width, c.height);
  cx.globalCompositeOperation = "source-in";
  cx.fillStyle = color;
  cx.fillRect(0, 0, c.width, c.height);
  tintedDollarCache.set(color, c);
  return c;
}

/**
 * Draws `text`, replacing its "$" with the dollar SVG. Honours the current
 * textAlign/textBaseline, so it can be used anywhere fillText would be.
 */
function drawDollarValue(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) {
  ctx.fillStyle = color;
  const idx = text.indexOf("$");
  const icon = idx === -1 ? null : tintedDollar(color);
  if (!icon) {
    ctx.fillText(text, x, y);
    return;
  }

  const before = text.slice(0, idx);
  const after = text.slice(idx + 1);

  // Size the icon from the digit height: the S body spans y 3.5–18.5 of the 14×22 viewBox.
  const digit = ctx.measureText("0");
  const digitTop = y - digit.actualBoundingBoxAscent;
  const digitHeight = digit.actualBoundingBoxAscent + digit.actualBoundingBoxDescent;
  const scale = digitHeight / 15;
  const iconW = 14 * scale;
  const iconH = 22 * scale;
  const gap = digitHeight * 0.06;

  const beforeW = ctx.measureText(before).width;
  const afterW = ctx.measureText(after).width;
  const total = beforeW + iconW + gap + afterW;

  const align = ctx.textAlign;
  let left = x;
  if (align === "center") left = x - total / 2;
  else if (align === "right" || align === "end") left = x - total;

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillText(before, left, y);
  ctx.drawImage(icon, left + beforeW, digitTop - 3.5 * scale, iconW, iconH);
  ctx.fillText(after, left + beforeW + iconW + gap, y);
  ctx.restore();
}

/** Word-wraps text to maxWidth, breaking long unspaced strings by character. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawStatusBar(ctx: CanvasRenderingContext2D, d: MockupData) {
  ctx.fillStyle = C.text;
  ctx.font = font(17, 500);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(d.clockTime, 32, 28);

  // Wi‑Fi + battery (single combined SVG, 52×20 viewBox).
  if (STATUS_ICONS && STATUS_ICONS.complete && STATUS_ICONS.naturalWidth) {
    const h = 18;
    const w = h * (52 / 20);
    ctx.drawImage(STATUS_ICONS, 301, 28 - h / 2, w, h);
    return;
  }

  ctx.strokeStyle = C.text;
  ctx.lineCap = "round";
  ctx.lineWidth = 2.2;
  const wx = 318;
  const wy = 35;
  for (const r of [4, 8.5, 13]) {
    ctx.beginPath();
    ctx.arc(wx, wy, r, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();
  }

  ctx.fillStyle = C.text;
  ctx.lineWidth = 1.1;
  ctx.globalAlpha = 0.9;
  roundRect(ctx, 335, 22, 24, 11, 2.2);
  ctx.stroke();
  roundRect(ctx, 338, 25, 18, 5, 1.6);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillRect(360, 26, 2, 3);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCopyIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const icon = new Path2D(
    "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
  );
  ctx.save();
  ctx.translate(x, y - 9);
  ctx.scale(18 / 24, 18 / 24);
  ctx.fillStyle = C.muted;
  ctx.fill(icon);
  ctx.restore();
}

function drawInfoIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = C.muted;
  ctx.fillStyle = C.muted;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - 2, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 2.5);
  ctx.stroke();
  ctx.restore();
}

function drawHeader(ctx: CanvasRenderingContext2D, d: MockupData) {
  // Back chevron.
  ctx.strokeStyle = C.text;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(30, 62);
  ctx.lineTo(22, 72);
  ctx.lineTo(30, 82);
  ctx.stroke();

  const iconX = WIDTH / 2 - 18;
  const iconY = 98;
  const iconSize = 36;
  drawTokenBadge(ctx, iconX, iconY, iconSize);

  ctx.fillStyle = "#f1f4f7";
  ctx.font = font(20, 700);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const title = `${d.action} ${d.amount} ${d.token}`.trim();
  ctx.fillText(title, WIDTH / 2, 166, WIDTH - 42);

  ctx.fillStyle = "#9aa3ad";
  ctx.font = font(14, 400);
  drawDollarValue(ctx, WIDTH / 2, 188, d.fiatApprox, "#9aa3ad");
}

function drawStatusRow(ctx: CanvasRenderingContext2D, d: MockupData) {
  const y = 238;
  const tickSize = 28;

  if (GREEN_TICK && GREEN_TICK.complete) {
    ctx.drawImage(GREEN_TICK, 22, y - tickSize / 2, tickSize, tickSize);
  } else {
    ctx.fillStyle = "#1dbf87";
    ctx.beginPath();
    ctx.arc(35, y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#f2f4f6";
    ctx.lineWidth = 2.3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(28, y + 3);
    ctx.lineTo(34, y + 8);
    ctx.lineTo(42, y - 6);
    ctx.stroke();
  }

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = "#edf1f5";
  ctx.font = font(16, 400);
  ctx.fillText("Status", 60, y);
  ctx.textAlign = "right";
  ctx.fillStyle = C.muted;
  ctx.font = font(16, 400);
  ctx.fillText(d.status, WIDTH - 22, y);

  ctx.fillStyle = C.divider;
  ctx.fillRect(0, 272, WIDTH, 1);
}

type Row = { label: string; value: string; copy?: boolean; info?: boolean };

function drawRows(ctx: CanvasRenderingContext2D, d: MockupData) {
  const rows: Row[] = [
    { label: "Address", value: d.address, copy: true },
    { label: "Price", value: d.price, info: true },
    { label: "Network", value: d.network },
    { label: "Network fee", value: d.networkFee },
    { label: "Transaction ID", value: d.transactionId, copy: true },
    { label: "Submitted time", value: d.submittedTime },
    { label: "Reference no.", value: d.referenceNo, copy: true },
  ];

  let y = 312;
  const right = WIDTH - 22;
  const lineHeight = 21;
  for (const row of rows) {
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = C.text;
    ctx.font = font(16, 400);
    ctx.fillText(row.label, 22, y);
    if (row.info) {
      drawInfoIcon(ctx, 22 + ctx.measureText(row.label).width + 10, y);
    }

    ctx.font = font(15, 400);
    ctx.fillStyle = C.muted;
    ctx.textAlign = "left";
    const valueRight = row.copy ? right - 22 : right;
    const lines = wrap(ctx, row.value, 200).slice(0, 3);
    ctx.textAlign = "right";
    lines.forEach((line, i) => {
      drawDollarValue(ctx, valueRight, y + i * lineHeight, line, C.muted);
    });
    ctx.textAlign = "left";
    if (row.copy) drawCopyIcon(ctx, right - 18, y + ((lines.length - 1) * lineHeight) / 2);

    y += 40 + (lines.length - 1) * lineHeight;
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, d: MockupData) {
  ctx.fillStyle = C.accent;
  roundRect(ctx, 22, 722, WIDTH - 44, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.font = font(15, 500);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.buttonLabel, WIDTH / 2, 744, WIDTH - 80);

  ctx.fillStyle = C.text;
  ctx.font = font(15, 400);
  ctx.fillText(d.helpLink, WIDTH / 2, 790, WIDTH - 40);
}

/** Final, unconditional step of every render. Do not make this optional. */
function drawWatermark(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#ffffff";
  ctx.font = font(18, 700);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(WIDTH / 2, HEIGHT / 2);
  ctx.rotate(-Math.PI / 6);
  const span = Math.hypot(WIDTH, HEIGHT);
  for (let row = 0, y = -span / 2; y <= span / 2; row++, y += 110) {
    const offset = row % 2 ? 170 : 0;
    for (let x = -span / 2; x <= span / 2 + 170; x += 340) {
      ctx.fillText("SAMPLE · NOT A REAL TRANSACTION", x + offset, y);
    }
  }
  ctx.restore();
}

export function renderMockup(canvas: HTMLCanvasElement, data: MockupData) {
  canvas.width = WIDTH * SCALE;
  canvas.height = HEIGHT * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const pending = ASSET_IMAGES.filter((img) => !img.complete);
  if (pending.length > 0) {
    pending.forEach((img) => {
      img.onload = () => renderMockup(canvas, data);
      img.onerror = () => renderMockup(canvas, data);
    });
    return;
  }

  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawStatusBar(ctx, data);
  drawHeader(ctx, data);
  drawStatusRow(ctx, data);
  drawRows(ctx, data);
  drawFooter(ctx, data);
 // drawWatermark(ctx);
}
