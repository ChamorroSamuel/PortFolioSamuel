# PortFolioSamuel 2.0 · Garúa

Portafolio de Samuel Chamorro. Sitio estático hecho con Astro, en español (`/`) e inglés (`/en/`).

Dirección visual **Garúa**: Lima de noche, llovizna, niebla y la luz naranja de los postes de sodio. El amarillo `#FFBD39` viene del sitio anterior y del logo.

## Comandos

Requiere Node 22.12 o superior.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/
npm run preview   # sirve dist/ para probar la versión final
```

## Publicación

Cada push a `main` compila y publica el sitio en https://chamorrosamuel.github.io/PortFolioSamuel/ con GitHub Actions (`.github/workflows/deploy.yml`). En el repo, **Settings → Pages → Source** debe estar en **GitHub Actions**.

Para probar en local la versión con la ruta de GitHub Pages:

```bash
SITE_URL=https://chamorrosamuel.github.io BASE_PATH=/PortFolioSamuel npm run build
```

En Git Bash (Windows) antepón `MSYS_NO_PATHCONV=1`; si no, convierte `/PortFolioSamuel` en una ruta de Windows y la compilación falla. Con dominio propio o Vercel no hace falta `BASE_PATH`.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Correo, GitHub, LinkedIn, CV | `src/data/site.ts` |
| Experiencia y formación | `src/data/site.ts` (`experience`) |
| Orden de tecnologías (grafo y cinta) | `src/data/site.ts` (`skills`) |
| Textos de la interfaz en ES y EN | `src/i18n/ui.ts` |
| Proyectos (un Markdown por idioma) | `src/content/projects/es/*.md` y `en/*.md` |
| Imágenes de proyectos | `src/assets/projects/` |
| Colores y tipografías | `src/styles/global.css` |
| Animaciones | `src/scripts/` |

### Agregar o editar un proyecto

1. Copia un archivo de `src/content/projects/es/` y su par en `en/` con el mismo nombre (ese nombre es la URL).
2. Pon la captura en `src/assets/projects/` y apunta `cover` a ella.
3. `stack` alimenta el grafo de tecnologías y la tarjeta. `role` y `links` (`repo`, `demo`, `design`) solo se muestran si los llenas.
4. `coverIsStock: true` muestra la nota "Imagen referencial" bajo la portada. Ponlo en `false` cuando uses una captura real.

## Interacciones

| Interacción | Archivo |
|---|---|
| Nombre hecho de partículas de garúa | `scripts/hero.ts` |
| Galería de proyectos anclada al scroll | `scripts/interactions.ts` → `initPinned` |
| Tarjetas 3D con reflejo | `initTilt` |
| Cinta que acelera con el scroll | `initMarquee` |
| Stack conectado a proyectos | `initGraph` |
| Línea de tiempo que se dibuja | `initTimeline` |
| Texto que se enciende al leer | `initReveal` |
| Títulos que salen de la niebla | `scripts/motion.ts` (`[data-fog]`) |
| Transición de tarjeta a caso de estudio | CSS `@view-transition` + `view-transition-name` en tarjeta y portada |
| Paleta de comandos `Ctrl K` / `⌘K` | `scripts/ui.ts` → `initPalette` |

Todo respeta `prefers-reduced-motion`: sin scroll suave, galería como carrusel normal, partículas quietas y textos completos.
Sin JavaScript el sitio se lee entero: el nombre aparece como texto y las secciones se ven completas.

La transición entre páginas usa View Transitions entre documentos (Chrome, Edge y Safari 18.2+). En Firefox la navegación es normal.

## Pendientes (TODO en el código)

- [ ] **LinkedIn**: pega la URL en `site.linkedin` (`src/data/site.ts`). Mientras esté vacío no aparece.
- [ ] **Stack de cada proyecto**: los valores de `stack` son provisionales. Confírmalos; el grafo se arma solo con ellos.
- [ ] **Elderly Care y DittoBox** usan fotos de stock. Reemplázalas por capturas reales.
- [ ] **DittoBox**: la foto (vitrina refrigerada) no coincide con el texto (almacenamiento en la nube).
- [ ] **CarUnity**: la captura habla de alquiler de autos y el texto de compra, venta y subastas. Deja la versión correcta.
- [ ] **Casos de estudio**: agrega "El problema", "Mi rol", "Decisiones técnicas" y "Resultado" a cada Markdown, y `role` y `links` en el frontmatter.
- [ ] **Foto** para la sección "Sobre mí".
- [ ] Considera un correo más profesional que `theteacher2017@gmail.com` (por ejemplo `samuel.chamorro@…`).
- [ ] Imagen para compartir en redes (Open Graph) y dominio propio.
