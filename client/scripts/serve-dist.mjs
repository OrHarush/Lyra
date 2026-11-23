import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const tryServe = (filePath, res) => {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);

  return true;
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);

  if (urlPath === '/home') {
    res.writeHead(301, { Location: '/' });
    res.end();
    return;
  }

  const candidate = path.join(distDir, urlPath);

  if (tryServe(candidate, res)) {
    return;
  }

  if (tryServe(path.join(candidate, 'index.html'), res)) {
    return;
  }

  if (tryServe(path.join(distDir, 'app.html'), res)) {
    return;
  }

  tryServe(path.join(distDir, 'index.html'), res);
});

server.listen(port, () => {
  console.log(`[serve-dist] http://127.0.0.1:${port}`);
  console.log('[serve-dist] mimics Vercel: prerendered files served first, SPA fallback otherwise');
});
