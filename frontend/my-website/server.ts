import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';

import express from 'express';

// bootstrap is the root Angular module (AppComponent + providers).
// Passing it to CommonEngine tells Angular what app to render.
import bootstrap from './src/main.server';

// ─── SSR Entry Point ─────────────────────────────────────────────────────────
// This file is the Node.js server that powers Server-Side Rendering (SSR).
//
// What SSR means here:
//   Every time a browser or Google crawler requests a URL, this Node server
//   runs Angular on the SERVER (not in the browser), fetches any required data
//   (e.g. categories from Spring Boot), renders the full HTML, and sends it
//   back in the response.
//
//   Result: the crawler/browser receives a complete HTML page with real content
//   already in it — no need to wait for JavaScript to run.
// ─────────────────────────────────────────────────────────────────────────────

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));

  // browserDistFolder contains the pre-built Angular JS/CSS/assets (ng build output).
  const browserDistFolder = resolve(serverDistFolder, '../browser');

  // index.server.html is the HTML shell used as the template for SSR rendering.
  const indexHtml = join(serverDistFolder, 'index.server.html');

  // CommonEngine is Angular Universal's SSR renderer.
  // It takes the Angular app + a URL and returns a fully rendered HTML string.
  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });

  // Serve static assets (JS, CSS, images) directly from the browser dist folder.
  // These do not go through Angular rendering — they are served as plain files.
  server.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: 'index.html',
    }),
  );

  // ── SSR handler — this is where Server-Side Rendering happens ──────────────
  // Every page request that is NOT a static file reaches this handler.
  // CommonEngine runs the full Angular component tree on the server:
  //   1. Angular boots, routes to the correct page component (e.g. Lovelydearly)
  //   2. ngOnChanges() fires → dispatches GetCategoriesAction
  //   3. getCategories() calls Spring Boot API → gets category data
  //   4. <app-categories> renders with real data
  //   5. Angular serialises the full component tree to an HTML string
  //   6. That HTML string is sent back to the browser/crawler
  // ──────────────────────────────────────────────────────────────────────────
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,                                          // the Angular app
        documentFilePath: indexHtml,                        // HTML shell template
        url: `${protocol}://${headers.host}${originalUrl}`, // the requested URL
        publicPath: browserDistFolder,                      // where static assets live
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then(html => res.send(html))   // send fully rendered HTML to client
      .catch(err => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4200;

  // Start up the Node server — listens for incoming HTTP requests.
  // Both human browsers and Google crawlers connect here.
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
