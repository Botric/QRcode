const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();
const PORT = Number(process.env.PORT) || 5610;

app.disable('x-powered-by');
app.set('etag', 'strong');

const publicDir = path.join(__dirname, '../public');
const indexHtmlPath = path.join(publicDir, 'index.html');

let indexTemplate = null;
try {
  indexTemplate = fs.readFileSync(indexHtmlPath, 'utf8');
} catch (err) {
  console.error('Failed to read public/index.html:', err);
}

const getSiteUrl = (req) => {
  const configured = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString().split(',')[0].trim();
  const host = req.get('host');
  return host ? `${proto}://${host}` : 'http://localhost:' + PORT;
};

// Middleware
app.use(compression());
app.use(express.json({ limit: '100kb' }));

// Static assets (cacheable)
app.use(
  express.static(publicDir, {
    index: false,
    etag: true,
    maxAge: '7d',
    setHeaders: (res, filePath) => {
      // Avoid shipping stale HTML/JS/CSS after redeploys (no hash-based filenames here)
      if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
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