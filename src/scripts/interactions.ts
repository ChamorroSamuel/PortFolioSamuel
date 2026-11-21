// Interacciones de las secciones del inicio.
import { gsap, ScrollTrigger, lenis, reduceMotion, whileVisible } from './motion';

/* ---------- Galería de proyectos anclada al scroll ---------- */
export function initPinned(section: HTMLElement) {
  const track = section.querySelector<HTMLElement>('[data-track]');
  const bar = section.querySelector<HTMLElement>('[data-progress]');
  const count = section.querySelector<HTMLElement>('[data-count]');
  if (!track) return;
  const n = track.querySelectorAll('[data-card]').length;

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-pinned');
    const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 0.7,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (bar) bar.style.transform = `scaleX(${self.progress.toFixed(4)})`;
          if (count) count.textContent = String(Math.min(n, Math.floor(self.progress * n) + 1)).padStart(2, '0');
        },
      },
    });
    return () => section.classList.remove('is-pinned');
  });
}

/* ---------- Tarjetas 3D con reflejo ---------- */
export function initTilt(root: ParentNode) {
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const inner = card.querySelector<HTMLElement>('[data-tilt-inner]') ?? card;
    card.addEventListener('pointermove', (e) => {
      const r = inner.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      inner.style.setProperty('--rx', `${((0.5 - py) * 12).toFixed(2)}deg`);
      inner.style.setProperty('--ry', `${((px - 0.5) * 16).toFixed(2)}deg`);
      inner.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      inner.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      inner.classList.add('is-tilting');
    });
    card.addEventListener('pointerleave', () => {
      inner.style.setProperty('--rx', '0deg');
      inner.style.setProperty('--ry', '0deg');
      inner.classList.remove('is-tilting');
    });
  });
}

/* ---------- Cinta que acelera con el scroll ---------- */
export function initMarquee(box: HTMLElement) {
  if (reduceMotion) return;
  const rows = [...box.querySelectorAll<HTMLElement>('[data-marquee-row]')].map((el) => ({
    track: el.querySelector<HTMLElement>('[data-marquee-track]')!,
    dir: Number(el.dataset.dir) || 1,
    x: 0,
  }));
  let visible = false;
  let lastY = window.scrollY;
  let v = 0;
  let sign = 1;
  whileVisible(box, (vis) => {
    visible = vis;
    lastY = window.scrollY;
  });
  gsap.ticker.add(() => {
    if (!visible) return;
    const y = window.scrollY;
    const delta = lenis ? lenis.velocity : y - lastY;
    lastY = y;
    v += (delta - v) * 0.18;
    if (Math.abs(v) > 0.6) sign = v > 0 ? 1 : -1;
    const speed = 0.7 + Math.min(Math.abs(v) * 0.55, 22);
    const skew = Math.max(-12, Math.min(12, v * 0.35));
    for (const r of rows) {
      const half = r.track.scrollWidth / 2;
      r.x -= speed * r.dir * sign;
      if (half > 0) {
        while (r.x <= -half) r.x += half;
        while (r.x > 0) r.x -= half;
      }
      r.track.style.transform = `translate3d(${r.x.toFixed(1)}px,0,0) skewX(${(-skew * r.dir).toFixed(2)}deg)`;
    }
  });
}

/* ---------- Stack conectado a proyectos ---------- */
export function initGraph(graph: HTMLElement) {
  const svg = graph.querySelector<SVGSVGElement>('[data-graph-lines]');
  const skills = [...graph.querySelectorAll<HTMLElement>('[data-skill]')];
  const projects = [...graph.querySelectorAll<HTMLElement>('[data-project]')];
  if (!svg || !skills.length) return;
  const stackOf = (p: HTMLElement) => (p.dataset.stack ?? '').split('|');
  let state: { skill?: string; project?: string } = { skill: skills[0].dataset.skill };

  function render() {
    const gr = graph.getBoundingClientRect();
    let pairs: [HTMLElement, HTMLElement][] = [];
    if (state.project) {
      const p = projects.find((x) => x.dataset.project === state.project)!;
      pairs = skills.filter((s) => stackOf(p).includes(s.dataset.skill!)).map((s) => [s, p]);
    } else if (state.skill) {
      const s = skills.find((x) => x.dataset.skill === state.skill)!;
      pairs = projects.filter((p) => stackOf(p).includes(state.skill!)).map((p) => [s, p]);
    }
    const onS = new Set(pairs.map((p) => p[0]));
    const onP = new Set(pairs.map((p) => p[1]));
    skills.forEach((s) => {
      s.classList.toggle('is-on', onS.has(s));
      s.setAttribute('aria-pressed', String(!state.project && state.skill === s.dataset.skill));
    });
    projects.forEach((p) => p.classList.toggle('is-on', onP.has(p)));
    svg!.replaceChildren();
    for (const [s, p] of pairs) {
      const a = s.getBoundingClientRect();
      const b = p.getBoundingClientRect();
      const x1 = a.right - gr.left;
      const y1 = a.top + a.height / 2 - gr.top;
      const x2 = b.left - gr.left;
      const y2 = b.top + b.height / 2 - gr.top;
      const mx = (x1 + x2) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
      svg!.appendChild(path);
      path.style.setProperty('--len', path.getTotalLength().toFixed(1));
    }
  }

  const pickSkill = (e: Event) => {
    const s = (e.target as Element).closest<HTMLElement>('[data-skill]');
    if (s && (state.project || state.skill !== s.dataset.skill)) {
      state = { skill: s.dataset.skill };
      render();
    }
  };
  const pickProject = (e: Event) => {
    const p = (e.target as Element).closest<HTMLElement>('[data-project]');
    if (p && state.project !== p.dataset.project) {
      state = { project: p.dataset.project };
      render();
    }
  };
  graph.addEventListener('pointerover', pickSkill);
  graph.addEventListener('click', pickSkill);
  graph.addEventListener('focusin', pickSkill);
  graph.addEventListener('pointerover', pickProject);
  graph.addEventListener('focusin', pickProject);

  render();
  new ResizeObserver(() => render()).observe(graph);
  document.fonts?.ready.then(render);
}

/* ---------- Línea de tiempo que se dibuja ---------- */
export function initTimeline(box: HTMLElement) {
  const fill = box.querySelector<HTMLElement>('[data-timeline-fill]');
  const items = [...box.querySelectorAll<HTMLElement>('[data-timeline-item]')];
  if (!fill || reduceMotion) return;
  box.classList.add('is-armed');
  // Enciende cada hito según dónde está de verdad la punta de la línea, en cada frame que se dibuja.
  const sync = () => {
    const tip = fill.getBoundingClientRect().bottom;
    items.forEach((li) => li.classList.toggle('is-on', li.getBoundingClientRect().top + 14 <= tip));
  };
  gsap.fromTo(
    fill,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      onUpdate: sync,
      scrollTrigger: { trigger: box, start: 'top 70%', end: 'bottom 70%', scrub: true },
    },
  );
}

/* ---------- Texto que se enciende al leer ---------- */
export function initReveal(p: HTMLElement) {
  const words = [...p.querySelectorAll<HTMLElement>('[data-word]')];
  if (!words.length || reduceMotion) return;
  p.classList.add('is-armed');
  ScrollTrigger.create({
    trigger: p,
    start: 'top 82%',
    end: 'bottom 48%',
    scrub: true,
    onUpdate: (self) => {
      const lit = Math.round(self.progress * words.length);
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    },
  });
}
