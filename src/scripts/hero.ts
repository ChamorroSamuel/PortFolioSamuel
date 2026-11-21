// Hero: tu nombre armado con gotas de garúa que se apartan del cursor.
import { fontReady, reduceMotion, whileVisible } from './motion';

type Particle = { tx: number; ty: number; x: number; y: number; vx: number; vy: number; warm: boolean; s: number };
type Drop = { x: number; y: number; l: number; v: number };

const FONT = '"Antonio Variable", "Arial Narrow", Impact, sans-serif';
const SODIUM = '#FFBD39';
const FOG = '#C9D4DE';

export function initHero(section: HTMLElement) {
  const cv = section.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  let W = 0;
  let H = 0;
  let parts: Particle[] = [];
  let drops: Drop[] = [];
  let raf = 0;
  let running = false;
  let ready = false;
  const P = { x: -1e4, y: -1e4, active: false };

  function build() {
    const r = cv!.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    cv!.width = Math.round(W * dpr);
    cv!.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Zona del nombre: alineada a la columna del sitio, en la parte alta del hero.
    const gutter = Math.min(64, Math.max(20, W * 0.05));
    const x0 = Math.max(gutter, (W - 1320) / 2 + gutter);
    const boxW = W - x0 * 2;
    const narrow = W < 760;
    const lines = narrow ? ['SAMUEL', 'CHAMORRO'] : ['SAMUEL CHAMORRO'];
    const top = H * (narrow ? 0.13 : 0.14);
    const boxH = H * (narrow ? 0.42 : 0.44);

    const off = document.createElement('canvas');
    off.width = Math.ceil(W);
    off.height = Math.ceil(H);
    const o = off.getContext('2d', { willReadFrequently: true })!;
    let fs = boxH / lines.length / 0.92;
    o.font = `700 ${fs}px ${FONT}`;
    const widest = Math.max(...lines.map((l) => o.measureText(l).width));
    if (widest > boxW) fs *= boxW / widest;
    o.font = `700 ${fs}px ${FONT}`;
    o.textBaseline = 'top';
    o.fillStyle = '#fff';
    // Centra el bloque del nombre en su zona para no dejar un hueco grande debajo.
    const blockH = fs * 0.92 * (lines.length - 1) + fs * 0.86;
    const y0 = top + Math.max(0, (boxH - blockH) / 2);
    lines.forEach((line, i) => o.fillText(line, x0, y0 + i * fs * 0.92));

    const ow = off.width;
    const oh = off.height;
    const img = o.getImageData(0, 0, ow, oh).data;
    let filled = 0;
    for (let y = 0; y < oh; y += 2) for (let x = 0; x < ow; x += 2) if (img[(y * ow + x) * 4 + 3] > 128) filled++;
    const budget = W < 760 ? 2000 : 3400;
    const step = Math.max(3, Math.ceil(Math.sqrt((filled * 4) / budget)));

    const old = parts;
    parts = [];
    for (let y = 0; y < oh; y += step) {
      for (let x = 0; x < ow; x += step) {
        if (img[(y * ow + x) * 4 + 3] <= 128) continue;
        const prev = old[parts.length];
        parts.push({
          tx: x,
          ty: y,
          x: prev ? prev.x : x + (Math.random() - 0.5) * 120,
          y: prev ? prev.y : -Math.random() * H - 20,
          vx: 0,
          vy: 0,
          warm: Math.random() < 0.28,
          s: Math.random() < 0.14 ? 2.3 : 1.6,
        });
      }
    }
    if (reduceMotion) parts.forEach((p) => ((p.x = p.tx), (p.y = p.ty)));
    drops = Array.from({ length: Math.round(W / 7) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      l: 8 + Math.random() * 18,
      v: 1.2 + Math.random() * 2.4,
    }));
    ready = true;
    section.classList.add('is-live');
  }

  function draw(move: boolean) {
    const c = ctx!;
    c.clearRect(0, 0, W, H);

    c.strokeStyle = 'rgba(157,176,192,.16)';
    c.lineWidth = 1;
    c.beginPath();
    for (const d of drops) {
      if (move) {
        d.y += d.v;
        d.x -= d.v * 0.16;
        if (d.y - d.l > H) {
          d.y = -2;
          d.x = Math.random() * W * 1.15;
        }
      }
      c.moveTo(d.x, d.y);
      c.lineTo(d.x + d.l * 0.16, d.y - d.l);
    }
    c.stroke();

    if (P.active) {
      const g = c.createRadialGradient(P.x, P.y, 0, P.x, P.y, 220);
      g.addColorStop(0, 'rgba(255,189,57,.20)');
      g.addColorStop(1, 'rgba(255,189,57,0)');
      c.fillStyle = g;
      c.fillRect(P.x - 220, P.y - 220, 440, 440);
    }

    if (move) {
      const R = Math.min(140, Math.max(70, W * 0.1));
      const R2 = R * R;
      for (const p of parts) {
        p.vx += (p.tx - p.x) * 0.05;
        p.vy += (p.ty - p.y) * 0.05;
        if (P.active) {
          const dx = p.x - P.x;
          const dy = p.y - P.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 6.5;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.vx *= 0.8;
        p.vy *= 0.8;
        p.x += p.vx;
        p.y += p.vy;
      }
    }

    c.fillStyle = FOG;
    for (const p of parts) if (!p.warm) c.fillRect(p.x, p.y, p.s, p.s);
    c.fillStyle = SODIUM;
    for (const p of parts) if (p.warm) c.fillRect(p.x, p.y, p.s, p.s);
  }

  const loop = () => {
    draw(true);
    if (running) raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (reduceMotion || !ready || running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  if (!reduceMotion) {
    const setPointer = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      P.x = e.clientX - r.left;
      P.y = e.clientY - r.top;
      P.active = true;
    };
    section.addEventListener('pointermove', setPointer);
    section.addEventListener('pointerdown', setPointer);
    section.addEventListener('pointerleave', () => (P.active = false));
    section.addEventListener('pointercancel', () => (P.active = false));
    section.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'mouse') P.active = false;
    });
  }

  fontReady('700 100px "Antonio Variable"').then(() => {
    build();
    if (reduceMotion) draw(false);
    whileVisible(section, (v) => (v ? start() : stop()));
    let lastW = W;
    let t = 0;
    new ResizeObserver(() => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const w = cv.getBoundingClientRect().width;
        if (Math.abs(w - lastW) < 2) return;
        lastW = w;
        build();
        if (reduceMotion) draw(false);
      }, 150);
    }).observe(cv);
  });
}
