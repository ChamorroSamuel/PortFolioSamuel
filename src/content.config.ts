import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  // Un archivo por idioma: src/content/projects/es/<slug>.md y en/<slug>.md
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      platform: z.string(),
      order: z.number(),
      cover: image(),
      coverAlt: z.string(),
      coverFit: z.enum(['cover', 'contain']).default('cover'),
      // true mientras la portada sea una foto de stock y no una captura del producto
      coverIsStock: z.boolean().default(false),
      gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      stack: z.array(z.string()),
      role: z.string().optional(),
      links: z
        .object({ repo: z.url().optional(), demo: z.url().optional(), design: z.url().optional() })
        .default({}),
    }),
});

export const collections = { projects };
