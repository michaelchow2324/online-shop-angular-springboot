import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';

import { appConfig } from './app.config';

// ─── Server-Side Rendering (SSR) configuration ───────────────────────────────
// This file configures Angular to run in SSR mode on the Node.js server.
//
// provideServerRendering() is the single line that activates Angular Universal.
// It tells Angular:
//   - Use server-safe APIs (no window/document — those only exist in a browser)
//   - Enable TransferState so data fetched on the server can be passed to the
//     browser, avoiding a second HTTP call on first load
//
// mergeApplicationConfig() merges the base app config (appConfig from
// app.config.ts — routes, interceptors, state, etc.) with this server-only
// config so the server has everything the browser has, plus SSR support.
// ─────────────────────────────────────────────────────────────────────────────
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
