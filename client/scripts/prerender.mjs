import {
  promises as fs,
  createReadStream,
  existsSync,
  readFileSync,
  statSync,
} from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const ROUTES = [
  '/',
  '/privacy-policy',
  '/terms-of-service',
  '/accessibility',
  '/blog',
  '/blog/riseup-review',
  '/blog/cashflow-guide',
  '/blog/free-expense-apps-comparison',
  '/blog/credit-card-billing-cycle',
  '/blog/couples-money',
  '/calculators',
  '/calculators/net-salary',
  '/calculators/compound-interest',
];

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

const startServer = () =>
  new Promise(resolve => {
    const pristineIndexHtml = readFileSync(path.join(distDir, 'index.html'), 'utf-8');

    const serveHtmlShell = res => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(pristineIndexHtml);
    };

    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);

      if (urlPath === '/' || !path.extname(urlPath)) {
        serveHtmlShell(res);
        return;
      }

      const candidate = path.join(distDir, urlPath);

      if (existsSync(candidate) && statSync(candidate).isFile()) {
        const ext = path.extname(candidate).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        createReadStream(candidate).pipe(res);
        return;
      }

      serveHtmlShell(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });

const waitForRouteContent = async page => {
  await page.waitForSelector('main h1, h1', { timeout: 15000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
};

const sanitizeRendered = async page => {
  await page.evaluate(() => {
    document.querySelectorAll('script[type="application/json"][id^="prerender"]').forEach(node => {
      node.remove();
    });
  });
};

const inlineRuntimeStyles = async page =>
  page.evaluate(() => {
    let sheetsInlined = 0;
    let rulesWritten = 0;

    for (const sheet of Array.from(document.styleSheets)) {
      const node = sheet.ownerNode;
      if (!node || node.tagName !== 'STYLE') continue;
      if (node.textContent && node.textContent.trim().length > 0) continue;

      let rules;
      try {
        rules = Array.from(sheet.cssRules || []);
      } catch (_e) {
        continue;
      }

      if (rules.length === 0) continue;

      node.textContent = rules.map(r => r.cssText).join('\n');
      sheetsInlined += 1;
      rulesWritten += rules.length;
    }

    return { sheetsInlined, rulesWritten };
  });

const MOTION_STYLE_RE = /(transform|will-change|opacity|transform-origin|perspective)\b/i;

const stripMotionStyles = html => {
  return html.replace(/\sstyle="([^"]*)"/g, (full, value) => {
    if (!MOTION_STYLE_RE.test(value)) {
      return full;
    }
    const kept = value
      .split(';')
      .map(decl => decl.trim())
      .filter(decl => decl && !MOTION_STYLE_RE.test(decl.split(':')[0] || ''))
      .join('; ');
    return kept ? ` style="${kept}"` : '';
  });
};

const prerenderRoute = async (launchOptions, baseUrl, route) => {
  const browser = await chromium.launch(launchOptions);

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      locale: 'he-IL',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      const realSetInterval = window.setInterval;
      const realSetTimeout = window.setTimeout;
      window.setInterval = () => 0;
      window.setTimeout = (fn, delay, ...args) => {
        if (typeof delay === 'number' && delay > 250) return 0;
        return realSetTimeout.call(window, fn, delay, ...args);
      };
      window.__realSetInterval = realSetInterval;
      window.__realSetTimeout = realSetTimeout;
    });

    const url = `${baseUrl}${route}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForRouteContent(page);
    await sanitizeRendered(page);
    const { sheetsInlined, rulesWritten } = await inlineRuntimeStyles(page);

    let html = stripMotionStyles(await page.content());
    const outPath = path.join(distDir, route.replace(/^\//, ''), 'index.html');
    await fs.mkdir(path.dirname(outPath), { recursive: true });

    const canonicalMatch = html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
    );
    console.log(`  · ${route} canonical: ${canonicalMatch ? canonicalMatch[1] : '(none)'}`);

    html = html.replace(
      /<link[^>]+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="https://lyra-il.com${route}">`
    );

    const afterMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
    console.log(`  · ${route} canonical after replace: ${afterMatch ? afterMatch[0] : '(tag not found)'}`);

    const routeTitles = {
      '/privacy-policy': 'מדיניות פרטיות | Lyra',
      '/terms-of-service': 'תנאי שימוש | Lyra',
      '/accessibility': 'הצהרת נגישות | Lyra',
    };

    if (routeTitles[route]) {
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${routeTitles[route]}</title>`);
    }

    const routeDescriptions = {
      '/privacy-policy': 'מדיניות הפרטיות של Lyra — אפליקציה לניהול הוצאות ותזרים מזומנים.',
      '/terms-of-service': 'תנאי השימוש של Lyra — אפליקציה לניהול הוצאות ותזרים מזומנים.',
      '/accessibility': 'הצהרת הנגישות של Lyra — אפליקציה לניהול הוצאות ותזרים מזומנים.',
    };

    if (routeDescriptions[route]) {
      html = html.replace(/<meta\s+name=["']description["'][^>]*>/, `<meta name="description" content="${routeDescriptions[route]}">`);
    }

    await fs.writeFile(outPath, html, 'utf-8');

    const sizeKb = (Buffer.byteLength(html) / 1024).toFixed(1);
    console.log(
      `  ✓ ${route} -> ${path.relative(distDir, outPath)} (${sizeKb} KB, inlined ${rulesWritten} rules into ${sheetsInlined} sheet(s))`,
    );
  } finally {
    await browser.close();
  }
};

const PRISTINE_SHELL_MARKER = '<div id="root"></div>';

// Everything that is not prerendered falls back to this shell. It must not be indexable, or each
// unknown URL would be served as a duplicate of the homepage with index, follow.
const writeAppShell = async () => {
  const appShellPath = path.join(distDir, 'app.html');
  const indexHtml = readFileSync(path.join(distDir, 'index.html'), 'utf-8');

  if (!indexHtml.includes(PRISTINE_SHELL_MARKER)) {
    if (existsSync(appShellPath)) {
      console.log('[prerender] dist/index.html is already prerendered, keeping existing app.html');
      return;
    }

    throw new Error('dist/index.html is not a clean build and app.html does not exist. Run "vite build".');
  }

  const appShell = indexHtml
    .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow" />')
    .replace(/<meta name="googlebot"[^>]*>/, '<meta name="googlebot" content="noindex, follow" />')
    .replace(/<link rel="canonical"[^>]*>\s*/, '');

  await fs.writeFile(appShellPath, appShell, 'utf-8');
  console.log('[prerender] wrote dist/app.html (noindex fallback shell)');
};

const resolveLaunchOptions = async () => {
  if (process.env.VERCEL) {
    const sparticuz = (await import('@sparticuz/chromium')).default;
    return {
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    };
  }

  return { headless: true };
};

const main = async () => {
  if (!existsSync(distDir)) {
    throw new Error(`dist directory not found at ${distDir}. Run "vite build" first.`);
  }

  await writeAppShell();

  console.log('[prerender] starting static server + chromium');
  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  const launchOptions = await resolveLaunchOptions();

  const failures = [];

  try {
    for (const route of ROUTES) {
      try {
        await prerenderRoute(launchOptions, baseUrl, route);
      } catch (err) {
        failures.push({ route, err });
        console.error(`  ✗ ${route} failed: ${err?.message || err}`);
      }
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  if (failures.length > 0) {
    console.error(`[prerender] ${failures.length}/${ROUTES.length} route(s) failed`);
    process.exit(1);
  }

  console.log('[prerender] done');
};

main().catch(err => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
