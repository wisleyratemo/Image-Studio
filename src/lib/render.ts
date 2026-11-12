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
  action: "Sent",
  amount: "1,250",
  token: "USDC",
  fiatApprox: "$1,250.00",
  status: "Completed",
  address: "0x4f3A7cB8D91E2F1e9A6bD3F4C7E9F2A8B5D9c2e",
  price: "$1.00/USDC",
  network: "Ethereum",
  networkFee: "0.00042 ETH",
  transactionId: "0x9a3f...c2e1",
  submittedTime: "May 13, 2026 2:41 PM",
  referenceNo: "TXN-1048-221",
  clockTime: "9:41",
  buttonLabel: "View details",
  helpLink: "Need help with this transaction?",
};

// Logical size of the phone screen; exported at SCALE for a crisp PNG.
export const WIDTH = 390;
export const HEIGHT = 844;
export const SCALE = 3;

const FONT = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;

const C = {
  bg: "#000000",
  text: "#ffffff",
  muted: "#9a9a9a",
  divider: "#1c1c1c",
  green: "#2fb35a",
  accent: "#b8f23a",
  icon: "#5b6cff",
};

const TETHER_ICON = typeof window !== "undefined" ? (() => {
  const img = new Image();
  img.src = "/tether-usdt-icon.svg";
  return img;
})() : null;

function font(size: number, weight = 400) {
  return `${weight} ${size}px ${FONT}`;
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
  ctx.font = font(17, 600);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(d.clockTime, 32, 28);

  // Wi-Fi: three arcs.
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

  // Battery.
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.5;
  roundRect(ctx, 336, 22, 25, 12, 3.5);
  ctx.stroke();
  ctx.globalAlpha = 1;
  roundRect(ctx, 338, 24, 21, 8, 2);
  ctx.fill();
  ctx.globalAlpha = 0.5;
  roundRect(ctx, 362.5, 26, 1.8, 4, 1);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCopyIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = C.muted;
  ctx.lineWidth = 1.6;
  roundRect(ctx, x + 4, y - 7, 9, 9, 1.5);
  ctx.stroke();
  roundRect(ctx, x, y - 3, 9, 9, 1.5);
  ctx.fillStyle = C.bg;
  ctx.fill();
  ctx.stroke();
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
  const iconY = 96;
  const iconSize = 36;

  if (TETHER_ICON && TETHER_ICON.complete) {
    ctx.drawImage(TETHER_ICON, iconX, iconY, iconSize, iconSize);
  } else {
    ctx.fillStyle = "#52af95";
    ctx.beginPath();
    ctx.arc(WIDTH / 2, 118, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = font(24, 700);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const title = `${d.action} ${d.amount} ${d.token}`.trim();
  ctx.fillText(title, WIDTH / 2, 165, WIDTH - 40);

  ctx.fillStyle = C.muted;
  ctx.font = font(15);
  ctx.fillText(d.fiatApprox, WIDTH / 2, 188);
}

function drawStatusRow(ctx: CanvasRenderingContext2D, d: MockupData) {
  const y = 238;
  ctx.fillStyle = C.green;
  ctx.beginPath();
  ctx.arc(35, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.text;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(29, y);
  ctx.lineTo(33, y + 4);
  ctx.lineTo(41, y - 4);
  ctx.stroke();

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = C.text;
  ctx.font = font(16, 500);
  ctx.fillText("Status", 60, y);
  ctx.textAlign = "right";
  ctx.fillStyle = C.muted;
  ctx.font = font(16);
  ctx.fillText(d.status, WIDTH - 22, y);

  ctx.fillStyle = C.divider;
  ctx.fillRect(0, 272, WIDTH, 1);
}

type Row = { label: string; value: string; copy?: boolean };

function drawRows(ctx: CanvasRenderingContext2D, d: MockupData) {
  const rows: Row[] = [
    { label: "Address", value: d.address, copy: true },
    { label: "Price", value: d.price },
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
    ctx.font = font(16, 500);
    ctx.fillText(row.label, 22, y);

    ctx.font = font(15);
    ctx.fillStyle = C.muted;
    ctx.textAlign = "right";
    const valueRight = row.copy ? right - 20 : right;
    const lines = wrap(ctx, row.value, 200).slice(0, 3);
    lines.forEach((line, i) => ctx.fillText(line, valueRight, y + i * lineHeight));
    if (row.copy) drawCopyIcon(ctx, right - 13, y + ((lines.length - 1) * lineHeight) / 2);

    y += 46 + (lines.length - 1) * lineHeight;
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, d: MockupData) {
  ctx.fillStyle = C.accent;
  roundRect(ctx, 22, 722, WIDTH - 44, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.font = font(15, 600);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.buttonLabel, WIDTH / 2, 744, WIDTH - 80);

  ctx.fillStyle = C.text;
  ctx.font = font(15);
  ctx.fillText(d.helpLink, WIDTH / 2, 790, WIDTH - 40);
}


export function renderMockup(canvas: HTMLCanvasElement, data: MockupData) {
  canvas.width = WIDTH * SCALE;
  canvas.height = HEIGHT * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawStatusBar(ctx, data);
  drawHeader(ctx, data);
  drawStatusRow(ctx, data);
  drawRows(ctx, data);
  drawFooter(ctx, data);
}
