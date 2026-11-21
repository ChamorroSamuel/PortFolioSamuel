// Interfaz global: barra de navegación, paleta de comandos y botones de copiar.
import { lenis, scrollToTarget } from './motion';

/* ---------- Barra de navegación ---------- */
export function initNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
  if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
    document.querySelectorAll('[data-mod-key]').forEach((k) => (k.textContent = '⌘'));
  }
}

/* ---------- Copiar al portapapeles ---------- */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function initCopyButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    const status = document.getElementById(btn.dataset.copyStatus ?? '');
    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copy ?? '');
      if (status) status.textContent = ok ? (btn.dataset.copied ?? '') : (btn.dataset.copyFail ?? '');
      if (!ok) {
        const target = document.getElementById(btn.dataset.copySelect ?? '');
        if (target) {
          const range = document.createRange();
          range.selectNodeContents(target);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
      window.setTimeout(() => status && (status.textContent = ''), 3000);
    });
  });
}

/* ---------- Paleta de comandos (Ctrl+K / ⌘K) ---------- */
export function initPalette() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-palette]');
  if (!dialog || typeof dialog.showModal !== 'function') {
    document.querySelectorAll<HTMLElement>('[data-palette-open]').forEach((b) => (b.hidden = true));
    return;
  }
  const input = dialog.querySelector<HTMLInputElement>('[data-palette-input]')!;
  const list = dialog.querySelector<HTMLElement>('[data-palette-list]')!;
  const empty = dialog.querySelector<HTMLElement>('[data-palette-empty]')!;
  const items = [...list.querySelectorAll<HTMLElement>('[role="option"]')];
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let shown = items;
  let sel = 0;

  function mark() {
    items.forEach((li) => li.setAttribute('aria-selected', 'false'));
    const li = shown[sel];
    if (li) {
      li.setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', li.id);
      li.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }
  function filter() {
    const terms = norm(input.value).split(/\s+/).filter(Boolean);
    shown = items.filter((li) => {
      const hay = norm(li.textContent ?? '');
      const match = terms.every((t) => hay.includes(t));
      li.hidden = !match;
      return match;
    });
    empty.hidden = shown.length > 0;
    sel = 0;
    mark();
  }
  async function run(li: HTMLElement | undefined) {
    if (!li) return;
    const { href, action, external } = li.dataset;
    dialog!.close();
    if (action === 'copy-email') {
      const ok = await copyText(li.dataset.value ?? '');
      const status = document.getElementById('contact-status');
      if (status) status.textContent = ok ? (li.dataset.copied ?? '') : (li.dataset.copyFail ?? '');
      return;
    }
    if (!href) return;
    if (external) {
      window.open(href, '_blank', 'noopener');
      return;
    }
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) {
      const el = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
      scrollToTarget(el ?? 0);
      history.pushState(null, '', url.hash || url.pathname);
    } else {
      // Espera a que el diálogo salga de la capa superior para que la View Transition pueda capturar la página.
      requestAnimationFrame(() => requestAnimationFrame(() => (location.href = url.href)));
    }
  }
  function open() {
    if (dialog!.open) return;
    input.value = '';
    filter();
    dialog!.showModal();
    lenis?.stop();
    input.focus();
  }

  dialog.addEventListener('close', () => lenis?.start());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      sel = shown.length ? (sel + 1) % shown.length : 0;
      mark();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      sel = shown.length ? (sel - 1 + shown.length) % shown.length : 0;
      mark();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(shown[sel]);
    }
  });
  items.forEach((li) => {
    li.addEventListener('click', () => run(li));
    li.addEventListener('pointermove', () => {
      const i = shown.indexOf(li);
      if (i !== -1 && i !== sel) {
        sel = i;
        mark();
      }
    });
  });
  document.querySelectorAll<HTMLElement>('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    }
  });
}
