import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import {
  SITE_NAME, SITE_IMAGE, PAGE_META, PRIVATE_META, NOT_FOUND_META, PERSON_SCHEMA, absoluteUrl,
} from './src/content/seo.js'

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const headFor = (page) => {
  const tags = [`<title>${escape(page.title)}</title>`]
  if (page.description) tags.push(`<meta name="description" content="${escape(page.description)}" />`)
  if (page.noindex) {
    tags.push('<meta name="robots" content="noindex, nofollow" />')
    return tags.join('\n    ')
  }
  const url = absoluteUrl(page.path)
  tags.push(
    `<link rel="canonical" href="${url}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${escape(SITE_NAME)}" />`,
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${absoluteUrl(SITE_IMAGE)}" />`,
    '<meta name="twitter:card" content="summary" />',
  )
  if (page.path === '/') tags.push(`<script type="application/ld+json">${JSON.stringify(PERSON_SCHEMA)}</script>`)
  return tags.join('\n    ')
}

// Writes one HTML file per route with its own head, plus the sitemap and robots.txt.
// Crawlers and link previews then see the right title without running the app.
const seoPages = () => ({
  name: 'seo-pages',
  apply: 'build',
  enforce: 'post',
  generateBundle(_, bundle) {
    const shell = bundle['index.html'].source
    const stripped = shell
      .replace(/\s*<title>[\s\S]*?<\/title>/, '')
      .replace(/\s*<meta name="description"[^>]*>/, '')
    const render = (page) => stripped.replace('</head>', `  ${headFor(page)}\n  </head>`)

    for (const page of [...PAGE_META, ...PRIVATE_META, NOT_FOUND_META]) {
      if (page.file === 'index.html') bundle['index.html'].source = render(page)
      else this.emitFile({ type: 'asset', fileName: page.file, source: render(page) })
    }

    const urls = PAGE_META.map(p => `  <url><loc>${absoluteUrl(p.path)}</loc></url>`).join('\n')
    this.emitFile({
      type: 'asset',
      fileName: 'sitemap.xml',
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    })

    const hidden = PRIVATE_META.map(p => `Disallow: ${p.path}`).join('\n')
    this.emitFile({
      type: 'asset',
      fileName: 'robots.txt',
      source: `User-agent: *\n${hidden}\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`,
    })
  },
})

export default defineConfig({
  plugins: [
    seoPages(),
    {
      name: 'treat-js-files-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null
        return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' })
      },
    },
    react(),
  ],
  envPrefix: ['FIREBASE_', 'ADMIN_'],
  server: {
    port: 3000,
    open: false,
  },
  preview: {
    port: 3000,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
})
