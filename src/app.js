const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();
const PORT = Number(process.env.PORT) || 5610;

app.disable('x-powered-by');
app.set('etag', 'strong');

const distDir = path.join(__dirname, '../dist');
const publicDir = path.join(__dirname, '../public');

const hasDist = fs.existsSync(path.join(distDir, 'index.html'));
const webRootDir = hasDist ? distDir : publicDir;
const indexHtmlPath = path.join(webRootDir, 'index.html');

let indexTemplate = null;
try {
  indexTemplate = fs.readFileSync(indexHtmlPath, 'utf8');
} catch (err) {
  console.error('Failed to read index.html:', err);
}

const getSiteUrl = (req) => {
  const configured = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString().split(',')[0].trim();
  const host = req.get('host');
  return host ? `${proto}://${host}` : 'http://localhost:' + PORT;
};

// Basic security headers (kept compatible with the current CDN script + inline JSON-LD)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Note: We allow jsdelivr + inline scripts because index.html includes JSON-LD.
  // If you later bundle scripts (no inline), we can tighten this further.
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src https://ko-fi.com https://storage.ko-fi.com",
      "img-src 'self' data: blob: https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://storage.ko-fi.com https://www.googletagmanager.com",
      "connect-src 'self' https://ko-fi.com https://storage.ko-fi.com https://www.google-analytics.com https://region1.google-analytics.com",
      "object-src 'none'"
    ].join('; ')
  );

  next();
});

// Middleware
app.use(compression());
app.use(express.json({ limit: '100kb' }));

// Static assets (cacheable)
app.use(
  express.static(webRootDir, {
    index: false,
    etag: true,
    maxAge: '7d',
    setHeaders: (res, filePath) => {
      // If we have a Vite build (hashed assets), allow long caching for JS/CSS.
      // Otherwise (dev / no build), avoid stale assets.
      const isHtml = filePath.endsWith('.html');
      const isJsOrCss = filePath.endsWith('.js') || filePath.endsWith('.css');
      if (isHtml) {
        res.setHeader('Cache-Control', 'no-cache');
        return;
      }
      if (isJsOrCss && !hasDist) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  })
);

// Prefer a single canonical entry point
app.get('/index.html', (req, res) => {
  res.redirect(301, '/');
});

// Main route (inject SITE_URL for SEO tags)
app.get('/', (req, res) => {
  if (!indexTemplate) {
    return res.sendFile(indexHtmlPath);
  }
  const siteUrl = getSiteUrl(req);
  const canonicalUrl = `${siteUrl}/`;
  const html = indexTemplate
    .replaceAll('{{SITE_URL}}', siteUrl)
    .replaceAll('{{CANONICAL_URL}}', canonicalUrl);

  res.setHeader('Cache-Control', 'no-cache');
  res.type('html').send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.get('/version', (req, res) => {
  res.json({
    name: 'qr-code-maker',
    version: process.env.APP_VERSION || 'unknown',
    commit: process.env.GIT_SHA || 'unknown',
    node: process.version
  });
});

// robots.txt + sitemap.xml for SEO
app.get('/robots.txt', (req, res) => {
  const siteUrl = getSiteUrl(req);
  res.type('text').send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const siteUrl = getSiteUrl(req);
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url>\n` +
    `    <loc>${siteUrl}/</loc>\n` +
    `    <lastmod>${now}</lastmod>\n` +
    `    <changefreq>weekly</changefreq>\n` +
    `    <priority>1.0</priority>\n` +
    `  </url>\n` +
    `</urlset>\n`;
  res.type('application/xml').send(xml);
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown (helps avoid abrupt termination in containers)
const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));