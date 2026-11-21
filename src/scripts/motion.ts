// Núcleo compartido: GSAP + ScrollTrigger con scroll suave de Lenis.
// Todos los demás scripts importan desde aquí para usar una sola instancia.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const lenis: Lenis | null = reduceMotion ? null : new Lenis({ lerp: 0.11 });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export { gsap, ScrollTrigger };

const navOffset = () => -(document.querySelector<HTMLElement>('[data-nav]')?.offsetHeight ?? 0) + 1;

export function scrollToTarget(target: HTMLElement | number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : navOffset(), immediate });
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target });
  } else {
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + navOffset() });
  }
}

/** Ejecuta cb mientras el elemento esté en pantalla (para pausar canvas y loops). */
export function whileVisible(el: Element, cb: (visible: boolean) => void) {
  new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting)), {
    rootMargin: '150px',
  }).observe(el);
}

export function fontReady(spec: string, timeout = 2000) {
  const load = document.fonts?.load ? document.fonts.load(spec).catch(() => undefined) : Promise.resolve();
  return Promise.race([load, new Promise((r) => setTimeout(r, timeout))]);
}

// Enlaces a anclas de la misma página: los lleva Lenis para que el scroll sea continuo.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const id = decodeURIComponent(url.hash.slice(1));
  const el = id ? document.getElementById(id) : null;
  if (!el && id) return;
  e.preventDefault();
  scrollToTarget(el ?? 0);
  history.pushState(null, '', url.hash);
});

// Los pines de ScrollTrigger agregan altura; recalcula y vuelve al ancla si se llegó con #hash.
window.addEventListener('load', () => {
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  if (location.hash.length > 1) {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) requestAnimationFrame(() => scrollToTarget(el, true));
  }
});

// Títulos que "salen de la niebla" al entrar en pantalla.
if (!reduceMotion) {
  document.querySelectorAll<HTMLElement>('[data-fog]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0.12, filter: 'blur(14px)', y: 28 },
      {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 62%', scrub: true },
      },
    );
  });
}
