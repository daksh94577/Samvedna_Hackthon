# Samvedna / संवेदना — Frontend code and project files

Generated: **2026-10-08 (UTC)**. This companion to `SAMVEDNA_FRONTEND_GITHUB.zip` contains the complete frontend source as readable code blocks, project setup and a dependency/asset guide. **No backend implementation or real private keys are included.**

## Contents

1. [Package scope](#1-package-scope)
2. [Setup and public configuration](#2-setup-and-public-configuration)
3. [Screens and architecture](#3-screens-and-architecture)
4. [Packages, browser APIs and assets](#4-packages-browser-apis-and-assets)
5. [Sharing and current limits](#5-sharing-and-current-limits)
6. [Included file inventory](#6-included-file-inventory)
7. [Complete frontend source](#7-complete-frontend-source)

## 1. Package scope

- **94 files in `frontend/src/`**, including **22 page components** and **46 reusable UI library files**.
- **23 browser routes**, translation dictionaries, styles, app/session context and intake store.
- Actual PNG icons, PWA files, original package manifest + full Yarn lockfile, build/config files and development helpers in the ZIP.
- New GitHub README, `.gitignore`, `.env.example`, design tokens and supporting documentation.

The ZIP is the runnable source handoff. This Markdown is the readable code reference. PNG bytes and the large dependency lockfile are included in the ZIP rather than embedded in Markdown; installed `node_modules` and remote fonts/map tiles are not bundled. No backend or previous backend export is inside the ZIP.

## 2. Setup and public configuration

Use Node 20 and Yarn Classic 1.22.22. Extract the ZIP, then from the extracted `samvedna-frontend/` folder:

```bash
cd frontend
cp .env.example .env
yarn install --frozen-lockfile
```

Windows PowerShell: `Copy-Item .env.example .env`. Replace the API origin and adjust the host/port in `.env` before starting:

```dotenv
REACT_APP_BACKEND_URL=https://your-backend.example
REACT_APP_VAPID_PUBLIC_KEY=
HOST=127.0.0.1
PORT=3000
WDS_SOCKET_PORT=0
ENABLE_HEALTH_CHECK=false
DISABLE_EMERGENT_OVERLAY=true
BROWSER=none
```

| Variable | Use |
|---|---|
| `REACT_APP_BACKEND_URL` | Required public API origin, no `/api` suffix or trailing slash; not a secret |
| `REACT_APP_VAPID_PUBLIC_KEY` | Optional **public** VAPID key; blank fetches it from the API |
| `HOST`, `PORT` | Local frontend bind address/port; adjust to your machine |
| `WDS_SOCKET_PORT` | Dev-server WebSocket configuration; `0` uses the browser location port |
| `ENABLE_HEALTH_CHECK` | Optional dev health helpers; disabled in the example |
| `DISABLE_EMERGENT_OVERLAY` | Disable optional development overlay in the example |
| `BROWSER` | `none` avoids launching a browser automatically |

```bash
yarn start
```

Open the URL printed by the dev server. Run `yarn build` for compiled output. Keep the backend separately running and allow the frontend origin through backend CORS. CRA embeds `REACT_APP_*` variables into the browser build: **never put JWT signing, MongoDB, Twilio, SMTP, private VAPID or encryption keys there**. Restart/rebuild your local checkout when changing environment configuration.

`yarn test` exists in package.json, but the exported `testIds` constants are not a frontend test suite. No existing test coverage is claimed for them.

## 3. Screens and architecture

| URL | Component | Client gate |
|---|---|---|
| `/` | `LandingRedirect` | Public / automatic redirect |
| `/language` | `LanguagePage` | Public / automatic redirect |
| `/login` | `LoginPage` | Public / automatic redirect |
| `/home` | `HomePage` | Signed in: victim, counsellor, supervisor |
| `/intake/category` | `CategoryPage` | Signed in (no additional client role list) |
| `/intake/consent` | `ConsentPage` | Signed in (no additional client role list) |
| `/intake/record` | `IntakePage` | Signed in (no additional client role list) |
| `/intake/verify` | `VerifyPage` | Signed in (no additional client role list) |
| `/intake/assessment` | `AssessmentPage` | Signed in (no additional client role list) |
| `/intake/next-steps` | `NextStepsPage` | Signed in (no additional client role list) |
| `/intake/complaint` | `ComplaintPage` | Signed in (no additional client role list) |
| `/complaint/:caseId` | `ComplaintPage` | Signed in (no additional client role list) |
| `/timeline/:caseId` | `TimelinePage` | Signed in (no additional client role list) |
| `/history` | `HistoryPage` | Signed in (no additional client role list) |
| `/drafts` | `DraftsPage` | Signed in (no additional client role list) |
| `/support-directory` | `SupportDirectoryPage` | Signed in (no additional client role list) |
| `/profile` | `ProfilePage` | Signed in (no additional client role list) |
| `/counsellor` | `CounsellorGate` | Staff OTP login or staff queue |
| `/counsellor/:caseId` | `CounsellorDetailPage` | Signed in: counsellor, supervisor |
| `/operator` | `OperatorPage` | Signed in: counsellor, supervisor |
| `/supervisor` | `SupervisorPage` | Signed in: supervisor |
| `/impact` | `ImpactPage` | Signed in: supervisor |
| `/nearby` | `NearbyMapPage` | Signed in (no additional client role list) |

The app is React + BrowserRouter with a centered 420px frame. `AppContext` handles the user/language; `IntakeStore` holds in-memory intake data; `lib/api.js` points Axios at `${REACT_APP_BACKEND_URL}/api` and attaches the runtime user token. Server authorization is still necessary. All frontend routes and files are preserved, including the existing startup demo-seed request.

More detail: `docs/PROJECT_OVERVIEW.md` and `docs/design-tokens.json` in the ZIP.

## 4. Packages, browser APIs and assets

- React, react-dom and React Router: screens/navigation.
- Tailwind, Radix UI/local UI components and Lucide: styling/widgets/icons.
- Axios/fetch: backend requests; Sonner: toast messages; Recharts: impact charts.
- jsPDF, docx, file-saver: browser complaint downloads.
- Browser APIs: MediaRecorder/Web Audio, speech recognition/synthesis, geolocation, notifications, Service Worker and PushManager.
- Google Fonts: remote Noto typefaces. OpenStreetMap: remote map embed/directions. These are network services, not local image assets.
- `public/icon-192.png` and `public/icon-512.png`: actual PNG files included in the ZIP. There are no other local photo assets referenced by this frontend.

`docs/DEPENDENCIES_AND_SERVICES.md` enumerates every declared dependency and external service. `package.json` and `yarn.lock` are unchanged, including optional development dependencies and original version resolutions. Some libraries are starter/reusable components rather than actively mounted features. No payment/LLM API key is required by this frontend.

## 5. Sharing and current limits

Extract the ZIP and add its files to your GitHub repository. Include `.gitignore`; exclude your private `.env`, dependency folders and any real evidence. `.gitignore` does not remove previously tracked secrets. Do not publish actual tokens, OTP responses, case records or uploads.

**MOCKED:** OTP delivery without backend provider credentials uses DEV MODE; escalation is a mock NHAA handoff. Without a connected backend, login/cases/scoring/chat/dashboards cannot function. This frontend does not include an offline client SVI model or live provider credentials.

The exported HTML removes preview analytics/instrumentation scripts; all application source is unchanged. The running application is not edited. Important existing limitations include shared-device API caching, automatic demo seeding, server-side (not end-to-end) encryption, English-only PDF rendering/limited pagination and browser-dependent voice/push support. See `docs/EXPORT_NOTES.md`. No clinical, security or full offline-readiness claim is made.

Source sharing on GitHub does not itself run the application. BrowserRouter and service-worker paths require an origin-root setup and an appropriate fallback for client routes; a repository subpath is not supported out of the box. Backend code was provided separately and must be configured separately.

**Verification:** archive/source/hash/secret checks and external downloads passed. The extracted frontend builds successfully with existing installed dependencies. There is one pre-existing React Hook dependency lint warning in `CounsellorDetailPage.jsx`; application source was preserved. A fresh package installation and full feature retest were not performed. See `docs/EXPORT_NOTES.md` for the exact scope.

## 6. Included file inventory

- `.gitignore`
- `README.md`
- `docs/ASSETS.md`
- `docs/DEPENDENCIES_AND_SERVICES.md`
- `docs/EXPORT_NOTES.md`
- `docs/PROJECT_OVERVIEW.md`
- `docs/design-tokens.json`
- `frontend/.env.example`
- `frontend/README.md`
- `frontend/components.json`
- `frontend/craco.config.js`
- `frontend/jsconfig.json`
- `frontend/package.json`
- `frontend/plugins/health-check/health-endpoints.js`
- `frontend/plugins/health-check/webpack-health-plugin.js`
- `frontend/postcss.config.js`
- `frontend/public/icon-192.png`
- `frontend/public/icon-512.png`
- `frontend/public/index.html`
- `frontend/public/manifest.json`
- `frontend/public/sw.js`
- `frontend/src/App.css`
- `frontend/src/App.js`
- `frontend/src/components/BottomNav.jsx`
- `frontend/src/components/CaseChat.jsx`
- `frontend/src/components/CaseTimeline.jsx`
- `frontend/src/components/Header.jsx`
- `frontend/src/components/HelplineBanner.jsx`
- `frontend/src/components/MobileFrame.jsx`
- `frontend/src/components/OTPInput.jsx`
- `frontend/src/components/ProtectedRoute.jsx`
- `frontend/src/components/SVIGauge.jsx`
- `frontend/src/components/VoiceRecorder.jsx`
- `frontend/src/components/ui/accordion.jsx`
- `frontend/src/components/ui/alert-dialog.jsx`
- `frontend/src/components/ui/alert.jsx`
- `frontend/src/components/ui/aspect-ratio.jsx`
- `frontend/src/components/ui/avatar.jsx`
- `frontend/src/components/ui/badge.jsx`
- `frontend/src/components/ui/breadcrumb.jsx`
- `frontend/src/components/ui/button.jsx`
- `frontend/src/components/ui/calendar.jsx`
- `frontend/src/components/ui/card.jsx`
- `frontend/src/components/ui/carousel.jsx`
- `frontend/src/components/ui/checkbox.jsx`
- `frontend/src/components/ui/collapsible.jsx`
- `frontend/src/components/ui/command.jsx`
- `frontend/src/components/ui/context-menu.jsx`
- `frontend/src/components/ui/dialog.jsx`
- `frontend/src/components/ui/drawer.jsx`
- `frontend/src/components/ui/dropdown-menu.jsx`
- `frontend/src/components/ui/form.jsx`
- `frontend/src/components/ui/hover-card.jsx`
- `frontend/src/components/ui/input-otp.jsx`
- `frontend/src/components/ui/input.jsx`
- `frontend/src/components/ui/label.jsx`
- `frontend/src/components/ui/menubar.jsx`
- `frontend/src/components/ui/navigation-menu.jsx`
- `frontend/src/components/ui/pagination.jsx`
- `frontend/src/components/ui/popover.jsx`
- `frontend/src/components/ui/progress.jsx`
- `frontend/src/components/ui/radio-group.jsx`
- `frontend/src/components/ui/resizable.jsx`
- `frontend/src/components/ui/scroll-area.jsx`
- `frontend/src/components/ui/select.jsx`
- `frontend/src/components/ui/separator.jsx`
- `frontend/src/components/ui/sheet.jsx`
- `frontend/src/components/ui/skeleton.jsx`
- `frontend/src/components/ui/slider.jsx`
- `frontend/src/components/ui/sonner.jsx`
- `frontend/src/components/ui/switch.jsx`
- `frontend/src/components/ui/table.jsx`
- `frontend/src/components/ui/tabs.jsx`
- `frontend/src/components/ui/textarea.jsx`
- `frontend/src/components/ui/toast.jsx`
- `frontend/src/components/ui/toaster.jsx`
- `frontend/src/components/ui/toggle-group.jsx`
- `frontend/src/components/ui/toggle.jsx`
- `frontend/src/components/ui/tooltip.jsx`
- `frontend/src/constants/testIds/auth.js`
- `frontend/src/constants/testIds/home.js`
- `frontend/src/constants/testIds/index.js`
- `frontend/src/context/AppContext.jsx`
- `frontend/src/hooks/use-toast.js`
- `frontend/src/index.css`
- `frontend/src/index.js`
- `frontend/src/lib/api.js`
- `frontend/src/lib/i18n.js`
- `frontend/src/lib/i18n_indic.js`
- `frontend/src/lib/push.js`
- `frontend/src/lib/utils.js`
- `frontend/src/lib/voice.js`
- `frontend/src/pages/AssessmentPage.jsx`
- `frontend/src/pages/CategoryPage.jsx`
- `frontend/src/pages/ComplaintPage.jsx`
- `frontend/src/pages/ConsentPage.jsx`
- `frontend/src/pages/CounsellorDetailPage.jsx`
- `frontend/src/pages/CounsellorLoginPage.jsx`
- `frontend/src/pages/CounsellorQueuePage.jsx`
- `frontend/src/pages/DraftsPage.jsx`
- `frontend/src/pages/HistoryPage.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/ImpactPage.jsx`
- `frontend/src/pages/IntakePage.jsx`
- `frontend/src/pages/IntakeStore.js`
- `frontend/src/pages/LanguagePage.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/NearbyMapPage.jsx`
- `frontend/src/pages/NextStepsPage.jsx`
- `frontend/src/pages/OperatorPage.jsx`
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/SupervisorPage.jsx`
- `frontend/src/pages/SupportDirectoryPage.jsx`
- `frontend/src/pages/TimelinePage.jsx`
- `frontend/src/pages/VerifyPage.jsx`
- `frontend/tailwind.config.js`
- `frontend/yarn.lock`

Additionally, the ZIP contains this `FRONTEND_GITHUB.md` and `EXPORT_MANIFEST.json`. The manifest lists SHA-256 hashes for every payload except itself. Source files are tagged as unchanged, sanitized or newly generated so changes are explicit.

## 7. Complete frontend source

The following blocks reproduce all frontend text implementation/configuration files in the ZIP, including `.env.example` and the sanitized exported HTML. They do not omit functions or replace sections with ellipses. UI library files are included even where currently unused.

`frontend/yarn.lock` is intentionally not repeated here; use the full unchanged file in the ZIP. The ZIP README and `docs/` files provide the supporting project documentation. The binary app icons are not text code blocks.

### `frontend/.env.example`

```dotenv
REACT_APP_BACKEND_URL=https://your-backend.example
REACT_APP_VAPID_PUBLIC_KEY=
HOST=127.0.0.1
PORT=3000
WDS_SOCKET_PORT=0
ENABLE_HEALTH_CHECK=false
DISABLE_EMERGENT_OVERLAY=true
BROWSER=none
```

### `frontend/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### `frontend/craco.config.js`

```javascript
// craco.config.js
const path = require("path");
require("dotenv").config();

// Check if we're in development/preview mode (not production build)
// Craco sets NODE_ENV=development for start, NODE_ENV=production for build
const isDevServer = process.env.NODE_ENV !== "production";

// Environment variable overrides
const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
};

function makeDevServerV5Compatible(devServerConfig) {
  const {
    https,
    onAfterSetupMiddleware,
    onBeforeSetupMiddleware,
    onListening,
    setupMiddlewares,
    ...compatibleConfig
  } = devServerConfig;

  compatibleConfig.server =
    typeof https === "object"
      ? { type: "https", options: https }
      : https
        ? "https"
        : "http";
  compatibleConfig.headers = {
    ...compatibleConfig.headers,
    "Cross-Origin-Resource-Policy": "same-origin",
  };

  if (onBeforeSetupMiddleware || setupMiddlewares) {
    compatibleConfig.setupMiddlewares = (middlewares, devServer) => {
      if (onBeforeSetupMiddleware) {
        onBeforeSetupMiddleware(devServer);
      }

      return setupMiddlewares
        ? setupMiddlewares(middlewares, devServer)
        : middlewares;
    };
  }

  compatibleConfig.onListening = (devServer) => {
    devServer.close ??= (callback) => devServer.stopCallback(callback);

    if (onListening) {
      onListening(devServer);
    }
    if (onAfterSetupMiddleware) {
      onAfterSetupMiddleware(devServer);
    }
  };

  return compatibleConfig;
}

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

// Branded error overlay + preview health probe, dev server only. Fails open: a broken
// overlay must degrade to "no overlay", never to "no dev server".
let emergentOverlay;
if (isDevServer && process.env.DISABLE_EMERGENT_OVERLAY !== "true") {
  try {
    emergentOverlay = require("@emergentbase/overlay/craco").emergentOverlayCraco({
      root: __dirname,
    });
    // A wrong shape would otherwise TypeError at dev-server config time, past this catch.
    if (
      typeof emergentOverlay.devServer !== "function" ||
      typeof emergentOverlay.attach !== "function" ||
      typeof emergentOverlay.webpackPlugin?.apply !== "function"
    ) {
      throw new Error("unexpected adapter shape");
    }
  } catch (err) {
    emergentOverlay = undefined;
    console.warn(
      "[emergent-overlay] not loaded — overlay disabled:",
      err instanceof Error ? err.message : err,
    );
  }
}

let webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {

      // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
        ],
      };

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }

      // Overlay's HTML injection + compile-error capture; self-gates on mode !== development.
      if (emergentOverlay) {
        webpackConfig.plugins.push(emergentOverlay.webpackPlugin);
      }
      return webpackConfig;
    },
  },
};

webpackConfig.devServer = (devServerConfig) => {
  // Add health check endpoints if enabled
  if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Call original setup if exists
      if (originalSetupMiddlewares) {
        middlewares = originalSetupMiddlewares(middlewares, devServer);
      }

      // Setup health endpoints
      setupHealthEndpoints(devServer, healthPluginInstance);

      return middlewares;
    };
  }

  return devServerConfig;
};

// Wrap with visual edits (automatically adds babel plugin, dev server, and overlay in dev mode)
if (isDevServer) {
  try {
    const { withVisualEdits } = require("@emergentbase/visual-edits/craco");
    webpackConfig = withVisualEdits(webpackConfig);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('@emergentbase/visual-edits/craco')) {
      console.warn(
        "[visual-edits] @emergentbase/visual-edits not installed — visual editing disabled."
      );
    } else {
      throw err;
    }
  }
}

// Overlay wraps last: visual-edits assigns setupMiddlewares instead of chaining onto it,
// so anything registered before it is dropped.
if (emergentOverlay) {
  const devServerBeforeOverlay = webpackConfig.devServer;

  // Fail open at each call site too: a throw inside the adapter costs the overlay, never
  // the dev server. Warns once, then this path stops calling it.
  let overlay = emergentOverlay;
  const overlayFailed = (site, err) => {
    overlay = undefined;
    console.warn(
      `[emergent-overlay] ${site} failed — overlay disabled:`,
      err instanceof Error ? err.message : err,
    );
  };

  webpackConfig.devServer = (devServerConfig) => {
    devServerConfig = devServerBeforeOverlay(devServerConfig);

    // Overlay owns runtime errors; webpack keeps compile errors.
    try {
      devServerConfig = overlay.devServer(devServerConfig);
    } catch (err) {
      overlayFailed("devServer config", err);
    }

    const previousSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Registered ahead of the chain's own body parsers, which would consume the raw stream
      // the overlay reads. Adapter taking a pre-parsed req.body is the overlay-side fix.
      try {
        if (overlay) overlay.attach(devServer);
      } catch (err) {
        overlayFailed("attach", err);
      }

      if (previousSetupMiddlewares) {
        middlewares = previousSetupMiddlewares(middlewares, devServer);
      }

      return middlewares;
    };

    return devServerConfig;
  };
}

const configureDevServer = webpackConfig.devServer;
webpackConfig.devServer = (devServerConfig) =>
  makeDevServerV5Compatible(configureDevServer(devServerConfig));

module.exports = webpackConfig;
```

### `frontend/jsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

### `frontend/package.json`

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@hookform/resolvers": "5.0.1",
    "@radix-ui/react-accordion": "1.2.8",
    "@radix-ui/react-alert-dialog": "1.1.11",
    "@radix-ui/react-aspect-ratio": "1.1.4",
    "@radix-ui/react-avatar": "1.1.7",
    "@radix-ui/react-checkbox": "1.2.3",
    "@radix-ui/react-collapsible": "1.1.8",
    "@radix-ui/react-context-menu": "2.2.12",
    "@radix-ui/react-dialog": "1.1.11",
    "@radix-ui/react-dropdown-menu": "2.1.12",
    "@radix-ui/react-hover-card": "1.1.11",
    "@radix-ui/react-label": "2.1.4",
    "@radix-ui/react-menubar": "1.1.12",
    "@radix-ui/react-navigation-menu": "1.2.10",
    "@radix-ui/react-popover": "1.1.11",
    "@radix-ui/react-progress": "1.1.4",
    "@radix-ui/react-radio-group": "1.3.4",
    "@radix-ui/react-scroll-area": "1.2.6",
    "@radix-ui/react-select": "2.2.2",
    "@radix-ui/react-separator": "1.1.4",
    "@radix-ui/react-slider": "1.3.2",
    "@radix-ui/react-slot": "1.2.0",
    "@radix-ui/react-switch": "1.2.2",
    "@radix-ui/react-tabs": "1.1.9",
    "@radix-ui/react-toast": "1.2.11",
    "@radix-ui/react-toggle": "1.1.6",
    "@radix-ui/react-toggle-group": "1.1.7",
    "@radix-ui/react-tooltip": "1.2.4",
    "@tanstack/react-query": "5.56.2",
    "axios": "1.20.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "cra-template": "1.2.0",
    "date-fns": "4.1.0",
    "dayjs": "1.11.13",
    "docx": "8.5.0",
    "embla-carousel-react": "8.6.0",
    "file-saver": "2.0.5",
    "framer-motion": "11.18.0",
    "input-otp": "1.4.2",
    "jspdf": "2.5.1",
    "lodash": "4.18.1",
    "lucide-react": "0.516.0",
    "next-themes": "0.4.6",
    "react": "19.0.0",
    "react-day-picker": "8.10.1",
    "react-dom": "19.0.0",
    "react-hook-form": "7.56.2",
    "react-resizable-panels": "3.0.1",
    "react-router-dom": "7.18.4",
    "react-scripts": "5.0.1",
    "recharts": "3.6.0",
    "sonner": "2.0.3",
    "swr": "2.3.8",
    "tailwind-merge": "3.2.0",
    "tailwindcss-animate": "1.0.7",
    "vaul": "1.1.2",
    "zod": "3.24.4"
  },
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@babel/plugin-proposal-private-property-in-object": "7.21.11",
    "@craco/craco": "7.1.0",
    "@emergentbase/overlay": "https://assets.emergent.sh/npm/emergentbase-overlay-0.1.31.tgz",
    "@emergentbase/visual-edits": "https://assets.emergent.sh/npm/emergentbase-visual-edits-1.0.13.tgz",
    "@eslint/js": "9.23.0",
    "@types/lodash": "4.17.24",
    "autoprefixer": "10.4.20",
    "dotenv": "16.4.5",
    "eslint": "9.23.0",
    "eslint-plugin-import": "2.31.0",
    "eslint-plugin-jsx-a11y": "6.10.2",
    "eslint-plugin-react": "7.37.4",
    "eslint-plugin-react-hooks": "5.2.0",
    "globals": "15.15.0",
    "postcss": "8.5.28",
    "tailwindcss": "3.4.17"
  },
  "resolutions": {
    "react-router": "7.18.4",
    "node-forge": "1.4.0",
    "fast-uri": "3.1.8",
    "flatted": "3.4.2",
    "qs": "6.16.0",
    "diff": "4.0.4",
    "follow-redirects": "1.16.0",
    "path-to-regexp": "0.1.13",
    "rollup": "2.80.0",
    "underscore": "1.13.8",
    "@babel/plugin-transform-modules-systemjs": "7.29.4",
    "@eslint/plugin-kit": "0.3.4",
    "shell-quote": "1.9.0",
    "jsonpath": "1.3.0",
    "nth-check": "2.0.1",
    "serialize-javascript": "7.0.5",
    "uuid": "11.1.1",
    "@tootallnate/once": "2.0.1",
    "webpack-dev-server": "5.2.6",
    "resolve-url-loader": "5.0.0",
    "**/resolve-url-loader/postcss": "8.5.28",
    "**/axios/form-data": "4.0.6",
    "**/jsdom/form-data": "3.0.5",
    "**/postcss-svgo/svgo": "2.8.4",
    "**/webpack-dev-server/ws": "8.21.0",
    "**/postcss-load-config/yaml": "2.8.3",
    "**/cosmiconfig/yaml": "1.10.3",
    "**/cssnano/yaml": "1.10.3",
    "**/eslint/js-yaml": "4.3.2",
    "**/@eslint/eslintrc/js-yaml": "4.3.2",
    "**/svgo/js-yaml": "3.15.2",
    "**/@istanbuljs/load-nyc-config/js-yaml": "3.15.2",
    "**/css-loader/postcss": "8.5.28",
    "**/css-minimizer-webpack-plugin/postcss": "8.5.28",
    "**/react-scripts/postcss": "8.5.28",
    "**/filelist/minimatch": "5.1.8",
    "**/anymatch/picomatch": "2.3.2",
    "**/micromatch/picomatch": "2.3.2",
    "**/readdirp/picomatch": "2.3.2",
    "**/jest-util/picomatch": "2.3.2",
    "**/tinyglobby/picomatch": "4.0.4",
    "http-proxy-middleware": "2.0.10"
  },
  "packageManager": "yarn@1.22.22+sha512.a6b2f7906b721bba3d67d4aff083df04dad64c399707841b7acf00f6b133b7ac24255f2652fa22ae3534329dc6180534e98d17432037ff6fd140556e2bb3137e"
}
```

### `frontend/plugins/health-check/health-endpoints.js`

```javascript
// health-endpoints.js
// API endpoints for health checks and monitoring

const os = require('os');

const SERVER_START_TIME = Date.now();

/**
 * Setup health check endpoints on the dev server
 * @param {Object} devServer - Webpack dev server instance
 * @param {Object} healthPlugin - Instance of WebpackHealthPlugin
 */
function setupHealthEndpoints(devServer, healthPlugin) {
  if (!devServer || !devServer.app) {
    console.warn('[Health Check] Dev server not available, skipping health endpoints');
    return;
  }

  if (!healthPlugin) {
    console.warn('[Health Check] Health plugin not provided, skipping health endpoints');
    return;
  }

  console.log('[Health Check] Setting up health endpoints...');

  // ====================================================================
  // GET /health - Detailed health status (JSON)
  // ====================================================================
  devServer.app.get("/health", (req, res) => {
    const webpackStatus = healthPlugin.getStatus();
    const uptime = Date.now() - SERVER_START_TIME;
    const memUsage = process.memoryUsage();

    res.json({
      status: webpackStatus.isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime / 1000),
        formatted: formatDuration(uptime),
      },
      webpack: {
        state: webpackStatus.state,
        isHealthy: webpackStatus.isHealthy,
        hasCompiled: webpackStatus.hasCompiled,
        errors: webpackStatus.errorCount,
        warnings: webpackStatus.warningCount,
        lastCompileTime: webpackStatus.lastCompileTime
          ? new Date(webpackStatus.lastCompileTime).toISOString()
          : null,
        lastSuccessTime: webpackStatus.lastSuccessTime
          ? new Date(webpackStatus.lastSuccessTime).toISOString()
          : null,
        compileDuration: webpackStatus.compileDuration
          ? `${webpackStatus.compileDuration}ms`
          : null,
        totalCompiles: webpackStatus.totalCompiles,
        firstCompileTime: webpackStatus.firstCompileTime
          ? new Date(webpackStatus.firstCompileTime).toISOString()
          : null,
      },
      server: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          heapUsed: formatBytes(memUsage.heapUsed),
          heapTotal: formatBytes(memUsage.heapTotal),
          rss: formatBytes(memUsage.rss),
          external: formatBytes(memUsage.external),
        },
        systemMemory: {
          total: formatBytes(os.totalmem()),
          free: formatBytes(os.freemem()),
          used: formatBytes(os.totalmem() - os.freemem()),
        },
      },
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // ====================================================================
  // GET /health/simple - Simple text response (OK/COMPILING/ERROR)
  // ====================================================================
  devServer.app.get("/health/simple", (req, res) => {
    const webpackStatus = healthPlugin.getSimpleStatus();

    if (webpackStatus.state === 'success') {
      res.status(200).send('OK');
    } else if (webpackStatus.state === 'compiling') {
      res.status(200).send('COMPILING');
    } else if (webpackStatus.state === 'idle') {
      res.status(200).send('IDLE');
    } else {
      res.status(503).send('ERROR');
    }
  });

  // ====================================================================
  // GET /health/ready - Readiness check (Kubernetes/load balancer)
  // ====================================================================
  devServer.app.get("/health/ready", (req, res) => {
    const webpackStatus = healthPlugin.getSimpleStatus();

    if (webpackStatus.state === 'success') {
      res.status(200).json({
        ready: true,
        state: webpackStatus.state,
      });
    } else {
      res.status(503).json({
        ready: false,
        state: webpackStatus.state,
        reason: webpackStatus.state === 'compiling'
          ? 'Compilation in progress'
          : 'Compilation failed',
      });
    }
  });

  // ====================================================================
  // GET /health/live - Liveness check (Kubernetes)
  // ====================================================================
  devServer.app.get("/health/live", (req, res) => {
    res.status(200).json({
      alive: true,
      timestamp: new Date().toISOString(),
    });
  });

  // ====================================================================
  // GET /health/errors - Get current errors and warnings
  // ====================================================================
  devServer.app.get("/health/errors", (req, res) => {
    const webpackStatus = healthPlugin.getStatus();

    res.json({
      errorCount: webpackStatus.errorCount,
      warningCount: webpackStatus.warningCount,
      errors: webpackStatus.errors,
      warnings: webpackStatus.warnings,
      state: webpackStatus.state,
    });
  });

  // ====================================================================
  // GET /health/stats - Compilation statistics
  // ====================================================================
  devServer.app.get("/health/stats", (req, res) => {
    const webpackStatus = healthPlugin.getStatus();
    const uptime = Date.now() - SERVER_START_TIME;

    res.json({
      totalCompiles: webpackStatus.totalCompiles,
      averageCompileTime: webpackStatus.totalCompiles > 0
        ? `${Math.round(uptime / webpackStatus.totalCompiles)}ms`
        : null,
      lastCompileDuration: webpackStatus.compileDuration
        ? `${webpackStatus.compileDuration}ms`
        : null,
      firstCompileTime: webpackStatus.firstCompileTime
        ? new Date(webpackStatus.firstCompileTime).toISOString()
        : null,
      serverUptime: formatDuration(uptime),
    });
  });

  console.log('[Health Check] ✓ Health endpoints ready:');
  console.log('  • GET /health         - Detailed status');
  console.log('  • GET /health/simple  - Simple OK/ERROR');
  console.log('  • GET /health/ready   - Readiness check');
  console.log('  • GET /health/live    - Liveness check');
  console.log('  • GET /health/errors  - Error details');
  console.log('  • GET /health/stats   - Statistics');
}

// ====================================================================
// Helper Functions
// ====================================================================

/**
 * Format bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string}
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

module.exports = setupHealthEndpoints;
```

### `frontend/plugins/health-check/webpack-health-plugin.js`

```javascript
// webpack-health-plugin.js
// Webpack plugin that tracks compilation state and health metrics

class WebpackHealthPlugin {
  constructor() {
    this.status = {
      state: 'idle',           // idle, compiling, success, failed
      errors: [],
      warnings: [],
      lastCompileTime: null,
      lastSuccessTime: null,
      compileDuration: 0,
      totalCompiles: 0,
      firstCompileTime: null,
    };
  }

  apply(compiler) {
    const pluginName = 'WebpackHealthPlugin';

    // Hook: Compilation started
    compiler.hooks.compile.tap(pluginName, () => {
      const now = Date.now();
      this.status.state = 'compiling';
      this.status.lastCompileTime = now;

      if (!this.status.firstCompileTime) {
        this.status.firstCompileTime = now;
      }
    });

    // Hook: Compilation completed
    compiler.hooks.done.tap(pluginName, (stats) => {
      const info = stats.toJson({
        all: false,
        errors: true,
        warnings: true,
      });

      this.status.totalCompiles++;
      this.status.compileDuration = Date.now() - this.status.lastCompileTime;

      if (stats.hasErrors()) {
        this.status.state = 'failed';
        this.status.errors = info.errors.map(err => ({
          message: err.message || String(err),
          stack: err.stack,
          moduleName: err.moduleName,
          loc: err.loc,
        }));
      } else {
        this.status.state = 'success';
        this.status.lastSuccessTime = Date.now();
        this.status.errors = [];
      }

      if (stats.hasWarnings()) {
        this.status.warnings = info.warnings.map(warn => ({
          message: warn.message || String(warn),
          moduleName: warn.moduleName,
          loc: warn.loc,
        }));
      } else {
        this.status.warnings = [];
      }
    });

    // Hook: Compilation failed
    compiler.hooks.failed.tap(pluginName, (error) => {
      this.status.state = 'failed';
      this.status.errors = [{
        message: error.message,
        stack: error.stack,
      }];
      this.status.compileDuration = Date.now() - this.status.lastCompileTime;
    });

    // Hook: Invalid (file changed, recompiling)
    compiler.hooks.invalid.tap(pluginName, () => {
      this.status.state = 'compiling';
    });
  }

  getStatus() {
    return {
      ...this.status,
      // Add computed fields
      isHealthy: this.status.state === 'success',
      errorCount: this.status.errors.length,
      warningCount: this.status.warnings.length,
      hasCompiled: this.status.totalCompiles > 0,
    };
  }

  // Get simplified status for quick checks
  getSimpleStatus() {
    return {
      state: this.status.state,
      isHealthy: this.status.state === 'success',
      errorCount: this.status.errors.length,
      warningCount: this.status.warnings.length,
    };
  }

  // Reset statistics (useful for testing)
  reset() {
    this.status = {
      state: 'idle',
      errors: [],
      warnings: [],
      lastCompileTime: null,
      lastSuccessTime: null,
      compileDuration: 0,
      totalCompiles: 0,
      firstCompileTime: null,
    };
  }
}

module.exports = WebpackHealthPlugin;
```

### `frontend/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### `frontend/public/index.html`

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#4A5A1E" />
        <meta name="description" content="Samvedna / संवेदना — AI distress screening for victims (SIH 26093, NHAA 14566)." />
        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        <link rel="apple-touch-icon" href="%PUBLIC_URL%/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Samvedna" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Noto+Sans+Gurmukhi:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Serif:wght@400;600;700;900&family=Noto+Serif+Devanagari:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <title>Samvedna / संवेदना — Distress Support</title>
    </head>
    <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>
        <script>
            if ("serviceWorker" in navigator && window.location.hostname !== "localhost") {
                window.addEventListener("load", function () {
                    navigator.serviceWorker.register("/sw.js").catch(function (e) { console.warn("sw register failed", e); });
                });
            }
        </script>
    </body>
</html>
```

### `frontend/public/manifest.json`

```json
{
    "short_name": "Samvedna",
    "name": "Samvedna / संवेदना",
    "description": "AI-powered real-time distress screening for victims. NHAA Helpline 14566.",
    "icons": [
        {
            "src": "icon-192.png",
            "type": "image/png",
            "sizes": "192x192",
            "purpose": "any maskable"
        },
        {
            "src": "icon-512.png",
            "type": "image/png",
            "sizes": "512x512",
            "purpose": "any maskable"
        }
    ],
    "start_url": ".",
    "scope": "/",
    "display": "standalone",
    "orientation": "portrait",
    "theme_color": "#4A5A1E",
    "background_color": "#F7EFE2",
    "lang": "en",
    "categories": ["health", "social", "government"],
    "shortcuts": [
        {
            "name": "Describe a New Problem",
            "short_name": "New Case",
            "url": "/intake/category"
        },
        {
            "name": "Call Helpline",
            "short_name": "14566",
            "url": "tel:14566"
        }
    ]
}
```

### `frontend/public/sw.js`

```javascript
/* Samvedna service worker — offline-first app shell + web push */
const CACHE_SHELL = "samvedna-shell-v3";
const CACHE_API = "samvedna-api-v3";

const SHELL = ["/", "/manifest.json"];

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE_SHELL).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_SHELL && k !== CACHE_API).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (e) => {
    const url = new URL(e.request.url);
    if (e.request.method !== "GET") return;
    if (url.origin !== self.location.origin && !url.pathname.startsWith("/api")) return;

    if (url.pathname.startsWith("/api/")) {
        if (url.pathname.includes("/support-directory") || url.pathname === "/api/cases") {
            e.respondWith(
                caches.open(CACHE_API).then(async (cache) => {
                    const cached = await cache.match(e.request);
                    const fetchP = fetch(e.request).then((res) => {
                        if (res && res.ok) cache.put(e.request, res.clone());
                        return res;
                    }).catch(() => cached);
                    return cached || fetchP;
                })
            );
        }
        return;
    }

    e.respondWith(
        caches.match(e.request).then((cached) =>
            cached ||
            fetch(e.request).then((res) => {
                if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
                    const copy = res.clone();
                    caches.open(CACHE_SHELL).then((c) => c.put(e.request, copy));
                }
                return res;
            }).catch(() => caches.match("/"))
        )
    );
});

/* --- Web Push --- */
self.addEventListener("push", (event) => {
    let data = { title: "Samvedna", body: "You have a new notification.", url: "/" };
    try {
        if (event.data) data = { ...data, ...event.data.json() };
    } catch (_) { /* keep defaults */ }
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: data.tag || "samvedna",
            data: { url: data.url },
            vibrate: [200, 80, 200],
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const target = (event.notification.data && event.notification.data.url) || "/";
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
            for (const w of wins) {
                if (w.url.endsWith(target) && "focus" in w) return w.focus();
            }
            if (self.clients.openWindow) return self.clients.openWindow(target);
        })
    );
});
```

### `frontend/src/App.css`

```css
/* Samvedna frame styles are in index.css */
.App { min-height: 100vh; }
```

### `frontend/src/App.js`

```javascript
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { AppProvider, useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

import LanguagePage from "@/pages/LanguagePage";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import ConsentPage from "@/pages/ConsentPage";
import IntakePage from "@/pages/IntakePage";
import VerifyPage from "@/pages/VerifyPage";
import AssessmentPage from "@/pages/AssessmentPage";
import NextStepsPage from "@/pages/NextStepsPage";
import ComplaintPage from "@/pages/ComplaintPage";
import TimelinePage from "@/pages/TimelinePage";
import HistoryPage from "@/pages/HistoryPage";
import SupportDirectoryPage from "@/pages/SupportDirectoryPage";
import DraftsPage from "@/pages/DraftsPage";
import ProfilePage from "@/pages/ProfilePage";
import CounsellorLoginPage from "@/pages/CounsellorLoginPage";
import CounsellorQueuePage from "@/pages/CounsellorQueuePage";
import CounsellorDetailPage from "@/pages/CounsellorDetailPage";
import OperatorPage from "@/pages/OperatorPage";
import SupervisorPage from "@/pages/SupervisorPage";
import ImpactPage from "@/pages/ImpactPage";
import NearbyMapPage from "@/pages/NearbyMapPage";
import ProtectedRoute from "@/components/ProtectedRoute";

function Boot() {
    useEffect(() => {
        // Fire-and-forget seed (idempotent)
        api.post("/seed").catch(() => {});
    }, []);
    return null;
}

function LandingRedirect() {
    const { user, lang } = useApp();
    if (user && user.role !== "victim") return <Navigate to="/counsellor" replace />;
    if (user) return <Navigate to="/home" replace />;
    if (lang) return <Navigate to="/login" replace />;
    return <LanguagePage />;
}

function App() {
    return (
        <AppProvider>
            <Boot />
            <Toaster position="top-center" theme="light" richColors closeButton />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingRedirect />} />
                    <Route path="/language" element={<LanguagePage />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/home" element={<ProtectedRoute roles={["victim", "counsellor", "supervisor"]}><HomePage /></ProtectedRoute>} />
                    <Route path="/intake/category" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
                    <Route path="/intake/consent" element={<ProtectedRoute><ConsentPage /></ProtectedRoute>} />
                    <Route path="/intake/record" element={<ProtectedRoute><IntakePage /></ProtectedRoute>} />
                    <Route path="/intake/verify" element={<ProtectedRoute><VerifyPage /></ProtectedRoute>} />
                    <Route path="/intake/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
                    <Route path="/intake/next-steps" element={<ProtectedRoute><NextStepsPage /></ProtectedRoute>} />
                    <Route path="/intake/complaint" element={<ProtectedRoute><ComplaintPage /></ProtectedRoute>} />
                    <Route path="/complaint/:caseId" element={<ProtectedRoute><ComplaintPage /></ProtectedRoute>} />
                    <Route path="/timeline/:caseId" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                    <Route path="/drafts" element={<ProtectedRoute><DraftsPage /></ProtectedRoute>} />
                    <Route path="/support-directory" element={<ProtectedRoute><SupportDirectoryPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                    <Route path="/counsellor" element={<CounsellorGate />} />
                    <Route path="/counsellor/:caseId" element={<ProtectedRoute roles={["counsellor", "supervisor"]}><CounsellorDetailPage /></ProtectedRoute>} />
                    <Route path="/operator" element={<ProtectedRoute roles={["counsellor", "supervisor"]}><OperatorPage /></ProtectedRoute>} />
                    <Route path="/supervisor" element={<ProtectedRoute roles={["supervisor"]}><SupervisorPage /></ProtectedRoute>} />
                    <Route path="/impact" element={<ProtectedRoute roles={["supervisor"]}><ImpactPage /></ProtectedRoute>} />
                    <Route path="/nearby" element={<ProtectedRoute><NearbyMapPage /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}

function CounsellorGate() {
    const { user, loading } = useApp();
    if (loading) return <div className="samvedna-shell"><div className="frame flex items-center justify-center text-olive font-serif">Loading…</div></div>;
    if (user && (user.role === "counsellor" || user.role === "supervisor")) return <CounsellorQueuePage />;
    return <CounsellorLoginPage />;
}

export default App;
```

### `frontend/src/components/BottomNav.jsx`

```jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Compass, MessagesSquare, PhoneCall, UserCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function BottomNav() {
    const { t } = useApp();
    const nav = useNavigate();
    const { pathname } = useLocation();

    const items = [
        { key: "guidance", path: "/home", label: t("nav_guidance"), Icon: Compass, testid: "nav-guidance" },
        { key: "thread", path: "/history", label: t("nav_thread"), Icon: MessagesSquare, testid: "nav-thread" },
        { key: "helpline", path: "/support-directory", label: t("nav_helpline"), Icon: PhoneCall, testid: "nav-helpline" },
        { key: "profile", path: "/profile", label: t("nav_profile"), Icon: UserCircle2, testid: "nav-profile" },
    ];

    return (
        <nav className="sticky bottom-0 inset-x-0 z-40 bg-white border-t border-sand">
            <div className="grid grid-cols-4 px-2 py-2 gap-1">
                {items.map(({ key, path, label, Icon, testid }) => {
                    const active = pathname === path || (key === "guidance" && pathname === "/");
                    return (
                        <button
                            key={key}
                            data-testid={testid}
                            onClick={() => nav(path)}
                            className={`press flex flex-col items-center justify-center gap-1 py-2 rounded-full text-[11px] font-medium transition-colors ${
                                active ? "bg-gold text-white" : "text-brown hover:bg-cream"
                            }`}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
```

### `frontend/src/components/CaseChat.jsx`

```jsx
import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { Send, Lock } from "lucide-react";

export default function CaseChat({ caseId }) {
    const { user } = useApp();
    const [msgs, setMsgs] = useState([]);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const scroller = useRef(null);

    const load = async () => {
        try {
            const r = await api.get(`/cases/${caseId}/chat`);
            setMsgs(r.data);
        } catch {}
    };

    useEffect(() => {
        load();
        const id = setInterval(load, 4000);
        return () => clearInterval(id);
        // eslint-disable-next-line
    }, [caseId]);

    useEffect(() => {
        if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
    }, [msgs]);

    const send = async () => {
        if (!text.trim()) return;
        setSending(true);
        try {
            const r = await api.post(`/cases/${caseId}/chat`, { text });
            setMsgs((xs) => [...xs, r.data]);
            setText("");
        } finally {
            setSending(false);
        }
    };

    const onKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="bg-white border border-sand rounded-2xl p-4" data-testid="case-chat">
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-serif font-bold text-olive">Case Chat</div>
                    <div className="hindi text-[11px] text-muted-foreground">सुरक्षित बातचीत</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-wa">
                    <Lock size={11}/> AES-256 encrypted
                </div>
            </div>

            <div ref={scroller} className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1" data-testid="chat-scroller">
                {msgs.length === 0 && (
                    <div className="text-[12px] text-muted-foreground text-center py-6">
                        No messages yet. Start the conversation — your counsellor will see it instantly.
                    </div>
                )}
                {msgs.map((m) => {
                    const mine = m.author_id === user?.id;
                    return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div
                                data-testid={`chat-msg-${m.id}`}
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                    mine ? "bg-olive text-white" : "bg-cream border border-sand text-foreground"
                                }`}
                            >
                                <div className={`text-[10px] mb-0.5 ${mine ? "text-cream/70" : "text-muted-foreground"}`}>
                                    {mine ? "You" : (m.author_role === "counsellor" || m.author_role === "supervisor" ? "Counsellor" : "Victim")}
                                    {" · "}{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className="whitespace-pre-wrap">{m.text}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 flex items-end gap-2">
                <textarea
                    data-testid="chat-input"
                    rows={1}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Type a secure message…"
                    className="flex-1 bg-cream border border-sand rounded-xl px-3 py-2 text-sm outline-none focus:border-olive resize-none"
                />
                <button
                    data-testid="chat-send"
                    disabled={sending || !text.trim()}
                    onClick={send}
                    className="press bg-gold hover:bg-gold-dark text-white rounded-full h-10 w-10 flex items-center justify-center disabled:opacity-50"
                >
                    <Send size={16}/>
                </button>
            </div>
        </div>
    );
}
```

### `frontend/src/components/CaseTimeline.jsx`

```jsx
import React from "react";
import { Check, Clock } from "lucide-react";

const STAGES = ["Logged", "Verified", "Guidance", "Drafted", "Filed", "Follow-up"];
const LABELS_HI = {
    Logged: "दर्ज",
    Verified: "सत्यापित",
    Guidance: "मार्गदर्शन",
    Drafted: "मसौदा",
    Filed: "दाखिल",
    "Follow-up": "अनुवर्ती",
};

export default function CaseTimeline({ completed = [], current = "Logged" }) {
    const idxCurrent = STAGES.indexOf(current);
    return (
        <div className="relative pl-7" data-testid="case-timeline">
            {STAGES.map((s, i) => {
                const done = completed.includes(s) || i < idxCurrent;
                const active = i === idxCurrent;
                return (
                    <div key={s} className="relative pb-6 last:pb-0">
                        {i < STAGES.length - 1 && (
                            <div className={`absolute left-[-18px] top-7 bottom-0 w-[2px] ${done ? "bg-wa" : "bg-sand"}`} style={{ borderStyle: "dashed" }} />
                        )}
                        <div
                            className={`absolute -left-[26px] top-0 h-7 w-7 rounded-full border-2 flex items-center justify-center ${
                                done ? "bg-wa border-wa text-white" : active ? "bg-gold border-gold text-white" : "bg-white border-sand text-brown"
                            }`}
                        >
                            {done ? <Check size={14} /> : <Clock size={14} />}
                        </div>
                        <div className={`font-serif font-semibold text-sm ${done || active ? "text-olive" : "text-muted-foreground"}`}>
                            {s}
                        </div>
                        <div className="hindi text-[11px] text-muted-foreground">{LABELS_HI[s]}</div>
                    </div>
                );
            })}
        </div>
    );
}
```

### `frontend/src/components/Header.jsx`

```jsx
import React from "react";
import { ChevronLeft, Languages } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { LANGUAGES } from "@/lib/i18n";

export default function Header({ showBack = false, title = null, right = null }) {
    const { lang, setLang } = useApp();
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

    return (
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-cream/85 border-b border-sand">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                    {showBack && (
                        <button
                            data-testid="header-back"
                            onClick={() => navigate(-1)}
                            className="press -ml-1 p-1.5 rounded-full hover:bg-sand/40 text-olive"
                        >
                            <ChevronLeft size={22} />
                        </button>
                    )}
                    <div className="min-w-0">
                        <div className="font-serif font-bold text-olive text-[18px] leading-tight truncate">
                            {title || "Samvedna"} <span className="hindi text-brown">/ संवेदना</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-medium">
                            NHAA · Helpline 14566
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {right}
                    <button
                        data-testid="language-toggle"
                        onClick={() => setOpen((v) => !v)}
                        className="press flex items-center gap-1 border border-sand bg-white rounded-full py-1.5 px-3 text-xs font-medium text-olive"
                    >
                        <Languages size={14} />
                        {current.native}
                    </button>
                </div>
            </div>
            {open && (
                <div className="px-4 pb-3 animate-fade-up">
                    <div className="grid grid-cols-2 gap-2 bg-white border border-sand rounded-2xl p-2 shadow-sm">
                        {LANGUAGES.map((l) => (
                            <button
                                key={l.code}
                                data-testid={`lang-opt-${l.code}`}
                                onClick={() => {
                                    setLang(l.code);
                                    setOpen(false);
                                }}
                                className={`press text-left px-3 py-2 rounded-xl text-sm ${
                                    lang === l.code ? "bg-olive text-white" : "hover:bg-cream text-foreground"
                                }`}
                            >
                                <div className="font-medium">{l.native}</div>
                                <div className={`text-[11px] ${lang === l.code ? "text-white/70" : "text-muted-foreground"}`}>
                                    {l.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
```

### `frontend/src/components/HelplineBanner.jsx`

```jsx
import React from "react";
import { PhoneCall } from "lucide-react";

export default function HelplineBanner({ compact = false }) {
    return (
        <a
            data-testid="helpline-banner"
            href="tel:14566"
            className={`press block bg-deepred text-white ${compact ? "py-3 px-4 rounded-2xl" : "py-4 px-5 rounded-[20px]"} shadow-md`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center ring-1 ring-white/20">
                        <PhoneCall size={18} />
                    </div>
                    <div>
                        <div className="text-xs opacity-80 font-medium">24/7 NHAA Helpline</div>
                        <div className="font-serif text-xl font-bold leading-tight">14566</div>
                    </div>
                </div>
                <div className="text-[11px] text-white/80 text-right font-medium">
                    Tap to Call<br />अभी कॉल करें
                </div>
            </div>
        </a>
    );
}
```

### `frontend/src/components/MobileFrame.jsx`

```jsx
import React from "react";
import BottomNav from "./BottomNav";
import Header from "./Header";

export default function MobileFrame({ children, showBack = false, title = null, hideNav = false, headerRight = null }) {
    return (
        <div className="samvedna-shell">
            <div className="frame cream-texture flex flex-col">
                <Header showBack={showBack} title={title} right={headerRight} />
                <main className="flex-1 overflow-y-auto">{children}</main>
                {!hideNav && <BottomNav />}
            </div>
        </div>
    );
}
```

### `frontend/src/components/OTPInput.jsx`

```jsx
import React, { useRef, useEffect } from "react";

export default function OTPInput({ value, onChange, length = 4, testIdPrefix = "otp" }) {
    const refs = useRef([]);

    useEffect(() => {
        if (refs.current[0]) refs.current[0].focus();
    }, []);

    const setDigit = (i, d) => {
        const only = d.replace(/\D/g, "").slice(-1);
        const chars = (value || "").padEnd(length, " ").split("");
        chars[i] = only || " ";
        const next = chars.join("").replace(/ /g, "").slice(0, length);
        onChange(next);
        if (only && i < length - 1) refs.current[i + 1]?.focus();
    };

    const onKey = (i, e) => {
        if (e.key === "Backspace") {
            if (!(value[i] || "") && i > 0) refs.current[i - 1]?.focus();
            else if (value[i]) {
                const chars = value.padEnd(length, " ").split("");
                chars[i] = " ";
                onChange(chars.join("").replace(/ /g, ""));
            }
        } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
        else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
    };

    const onPaste = (e) => {
        const txt = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, length);
        if (txt) {
            e.preventDefault();
            onChange(txt);
            const idx = Math.min(txt.length, length - 1);
            refs.current[idx]?.focus();
        }
    };

    return (
        <div className="flex items-center justify-center gap-3">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    data-testid={`${testIdPrefix}-${i}`}
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => onKey(i, e)}
                    onPaste={onPaste}
                    className="w-12 h-14 text-center text-2xl font-serif font-bold bg-white border border-sand rounded-xl focus:border-olive focus:ring-2 focus:ring-olive/30 outline-none"
                />
            ))}
        </div>
    );
}
```

### `frontend/src/components/ProtectedRoute.jsx`

```jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useApp();
    if (loading) return <div className="samvedna-shell"><div className="frame flex items-center justify-center text-olive font-serif">Loading…</div></div>;
    if (!user) return <Navigate to="/" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/home" replace />;
    return children;
}
```

### `frontend/src/components/SVIGauge.jsx`

```jsx
import React from "react";

const levelColor = (score) => {
    if (score >= 80) return { bg: "#8B2A1A", label: "Critical" };
    if (score >= 55) return { bg: "#C4694A", label: "High" };
    if (score >= 30) return { bg: "#B8862B", label: "Moderate" };
    return { bg: "#25C05F", label: "Low" };
};

export default function SVIGauge({ score = 0 }) {
    const s = Math.max(0, Math.min(100, Number(score) || 0));
    const { bg, label } = levelColor(s);
    // half-doughnut using SVG arc
    const r = 70;
    const circ = Math.PI * r; // half circle
    const dash = (s / 100) * circ;

    return (
        <div className="relative w-full flex flex-col items-center">
            <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
                <path d="M 20 110 A 70 70 0 0 1 180 110" stroke="#D3C7AC" strokeWidth="16" fill="none" strokeLinecap="round" />
                <path
                    d="M 20 110 A 70 70 0 0 1 180 110"
                    stroke={bg}
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    style={{ transition: "stroke-dasharray 0.8s ease-out" }}
                />
            </svg>
            <div className="-mt-10 text-center">
                <div className="font-serif text-5xl font-black" style={{ color: bg }} data-testid="svi-score">
                    {Math.round(s)}
                </div>
                <div
                    className="inline-flex mt-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: bg }}
                    data-testid="svi-level"
                >
                    {label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">SVI 0–100 · Severe Vulnerability Index</div>
            </div>
        </div>
    );
}

export { levelColor };
```

### `frontend/src/components/VoiceRecorder.jsx`

```jsx
import React, { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

/**
 * Records audio using MediaRecorder, extracts voice metrics (pitch variation,
 * pause ratio, speech rate, RMS energy, pitch jitter) using Web Audio API,
 * and uses Web Speech API for live STT.
 */
export default function VoiceRecorder({ language = "en", onResult }) {
    const [recording, setRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState("");
    const [bars, setBars] = useState(Array(28).fill(0.15));
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const rafRef = useRef(null);
    const recognitionRef = useRef(null);
    const metricsRef = useRef({ rmsSamples: [], pitchSamples: [], silentFrames: 0, totalFrames: 0, wordCount: 0, startedAt: 0 });

    const langMap = { en: "en-IN", hi: "hi-IN", hinglish: "en-IN", bn: "bn-IN", mr: "mr-IN", gu: "gu-IN", pa: "pa-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN" };

    const start = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const AC = window.AudioContext || window.webkitAudioContext;
            const ctx = new AC();
            audioCtxRef.current = ctx;
            const src = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 2048;
            src.connect(analyser);
            analyserRef.current = analyser;

            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            chunksRef.current = [];
            mr.ondataavailable = (e) => chunksRef.current.push(e.data);
            mr.start();

            metricsRef.current = { rmsSamples: [], pitchSamples: [], silentFrames: 0, totalFrames: 0, wordCount: 0, startedAt: Date.now() };
            tick();
            setRecording(true);

            // Live STT
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SR) {
                const r = new SR();
                r.lang = langMap[language] || "en-IN";
                r.continuous = true;
                r.interimResults = true;
                r.onresult = (e) => {
                    let full = "";
                    for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + " ";
                    const trimmed = full.trim();
                    setTranscript(trimmed);
                    metricsRef.current.wordCount = trimmed.split(/\s+/).filter(Boolean).length;
                };
                r.onerror = () => {};
                try { r.start(); } catch {}
                recognitionRef.current = r;
            }
        } catch (e) {
            setError(e.message || "Microphone access denied");
        }
    };

    const tick = () => {
        const an = analyserRef.current;
        if (!an) return;
        const buf = new Uint8Array(an.fftSize);
        const freqBuf = new Uint8Array(an.frequencyBinCount);
        const read = () => {
            an.getByteTimeDomainData(buf);
            an.getByteFrequencyData(freqBuf);
            // RMS
            let sum = 0;
            for (let i = 0; i < buf.length; i++) {
                const v = (buf[i] - 128) / 128;
                sum += v * v;
            }
            const rms = Math.sqrt(sum / buf.length);
            metricsRef.current.rmsSamples.push(rms);
            metricsRef.current.totalFrames++;
            if (rms < 0.015) metricsRef.current.silentFrames++;

            // Pseudo pitch: peak frequency bin index weighted
            let maxIdx = 0, maxVal = 0;
            for (let i = 2; i < 128; i++) {
                if (freqBuf[i] > maxVal) { maxVal = freqBuf[i]; maxIdx = i; }
            }
            if (maxVal > 60) metricsRef.current.pitchSamples.push(maxIdx);

            // Waveform bars
            const nextBars = [];
            const step = Math.floor(buf.length / 28);
            for (let i = 0; i < 28; i++) {
                let s = 0;
                for (let j = 0; j < step; j++) s += Math.abs(buf[i * step + j] - 128);
                nextBars.push(Math.min(1, (s / step) / 40));
            }
            setBars(nextBars);
            rafRef.current = requestAnimationFrame(read);
        };
        read();
    };

    const stop = async () => {
        try {
            cancelAnimationFrame(rafRef.current);
            recognitionRef.current?.stop();
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
                await new Promise((res) => (mediaRecorderRef.current.onstop = res));
            }
            streamRef.current?.getTracks().forEach((tr) => tr.stop());
            audioCtxRef.current?.close();

            // Compute metrics 0..1
            const m = metricsRef.current;
            const rms = m.rmsSamples;
            const avgRms = rms.length ? rms.reduce((a, b) => a + b, 0) / rms.length : 0;
            const maxRms = rms.length ? Math.max(...rms) : 0;
            const rmsNorm = Math.min(1, maxRms * 2.2);

            const pauseRatio = m.totalFrames ? m.silentFrames / m.totalFrames : 0;

            const pitches = m.pitchSamples;
            const pavg = pitches.length ? pitches.reduce((a, b) => a + b, 0) / pitches.length : 0;
            const pvar = pitches.length ? Math.sqrt(pitches.reduce((a, b) => a + (b - pavg) ** 2, 0) / pitches.length) : 0;
            const pitchVariation = Math.min(1, pvar / 30);
            let jitSum = 0;
            for (let i = 1; i < pitches.length; i++) jitSum += Math.abs(pitches[i] - pitches[i - 1]);
            const jitter = pitches.length > 1 ? jitSum / (pitches.length - 1) : 0;
            const pitchJitter = Math.min(1, jitter / 10);

            const durSec = Math.max(1, (Date.now() - m.startedAt) / 1000);
            const wps = m.wordCount / durSec;
            // Elevated/jittery when very fast (>2.5 wps) OR unusually slow (<0.6 wps)
            const speechRate = Math.min(1, Math.max(0, (wps > 2.5 ? (wps - 2.5) / 2.5 : (0.6 - wps) / 0.6)));

            const metrics = {
                pitch_variation: Number(pitchVariation.toFixed(3)),
                pause_ratio: Number(pauseRatio.toFixed(3)),
                speech_rate: Number(speechRate.toFixed(3)),
                rms_energy: Number(rmsNorm.toFixed(3)),
                pitch_jitter: Number(pitchJitter.toFixed(3)),
            };

            // Audio base64
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            const b64 = await blobToB64(blob);

            onResult?.({ transcript, metrics, audio_b64: b64, duration_s: durSec });
            setRecording(false);
        } catch (e) {
            setError(e.message || "Error stopping recording");
            setRecording(false);
        }
    };

    const blobToB64 = (blob) =>
        new Promise((res) => {
            const r = new FileReader();
            r.onloadend = () => res(String(r.result).split(",")[1] || "");
            r.readAsDataURL(blob);
        });

    useEffect(() => () => {
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        try { audioCtxRef.current?.close(); } catch {}
        try { recognitionRef.current?.stop(); } catch {}
    }, []);

    return (
        <div className="bg-white border border-sand rounded-[20px] p-5 shadow-sm">
            <div className="flex items-end justify-center gap-[3px] h-20">
                {bars.map((v, i) => (
                    <div
                        key={i}
                        className="wave-bar bg-olive rounded-full"
                        style={{
                            width: 4,
                            height: `${Math.max(6, v * 72)}px`,
                            opacity: recording ? 0.9 : 0.35,
                            transition: "height 90ms linear",
                        }}
                    />
                ))}
            </div>
            {transcript && (
                <div className="mt-3 bg-cream border border-sand rounded-xl p-3 text-sm text-foreground max-h-28 overflow-auto" data-testid="voice-transcript">
                    {transcript}
                </div>
            )}
            <div className="flex items-center justify-between mt-4">
                <div className="text-[11px] text-muted-foreground">
                    {recording ? "Recording… · सुन रहे हैं" : "Live waveform"}
                </div>
                {!recording ? (
                    <button
                        data-testid="voice-start"
                        onClick={start}
                        className="press flex items-center gap-2 bg-gold hover:bg-gold-dark text-white rounded-full py-3 px-5 font-medium transition-colors"
                    >
                        <Mic size={18} /> Tap to Record
                    </button>
                ) : (
                    <button
                        data-testid="voice-stop"
                        onClick={stop}
                        className="press flex items-center gap-2 bg-deepred text-white rounded-full py-3 px-5 font-medium"
                    >
                        <Square size={16} /> Stop
                    </button>
                )}
            </div>
            {error && <div className="text-xs text-deepred mt-2">{error}</div>}
        </div>
    );
}
```

### `frontend/src/components/ui/accordion.jsx`

```jsx
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}>
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```

### `frontend/src/components/ui/alert-dialog.jsx`

```jsx
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref} />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props} />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props} />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props} />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

### `frontend/src/components/ui/alert.jsx`

```jsx
import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
```

### `frontend/src/components/ui/aspect-ratio.jsx`

```jsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
```

### `frontend/src/components/ui/avatar.jsx`

```jsx
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props} />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props} />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props} />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
```

### `frontend/src/components/ui/badge.jsx`

```jsx
import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
```

### `frontend/src/components/ui/breadcrumb.jsx`

```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef(
  ({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props} />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props} />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props} />
  );
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props} />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}>
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
```

### `frontend/src/components/ui/button.jsx`

```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
```

### `frontend/src/components/ui/calendar.jsx`

```jsx
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props} />
  );
}
Calendar.displayName = "Calendar"

export { Calendar }
```

### `frontend/src/components/ui/card.jsx`

```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
    {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

### `frontend/src/components/ui/carousel.jsx`

```jsx
import * as React from "react"
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef((
  {
    orientation = "horizontal",
    opts,
    setApi,
    plugins,
    className,
    children,
    ...props
  },
  ref
) => {
  const [carouselRef, api] = useEmblaCarousel({
    ...opts,
    axis: orientation === "horizontal" ? "x" : "y",
  }, plugins)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api) => {
    if (!api) {
      return
    }

    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback((event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollNext()
    }
  }, [scrollPrev, scrollNext])

  React.useEffect(() => {
    if (!api || !setApi) {
      return
    }

    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) {
      return
    }

    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    };
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}>
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props} />
    </div>
  );
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props} />
  );
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("absolute  h-8 w-8 rounded-full", orientation === "horizontal"
        ? "-left-12 top-1/2 -translate-y-1/2"
        : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}>
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("absolute h-8 w-8 rounded-full", orientation === "horizontal"
        ? "-right-12 top-1/2 -translate-y-1/2"
        : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}>
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
})
CarouselNext.displayName = "CarouselNext"

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
```

### `frontend/src/components/ui/checkbox.jsx`

```jsx
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}>
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```

### `frontend/src/components/ui/collapsible.jsx`

```jsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```

### `frontend/src/components/ui/command.jsx`

```jsx
import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const Command = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props} />
))
Command.displayName = CommandPrimitive.displayName

const CommandDialog = ({
  children,
  ...props
}) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

const CommandInput = React.forwardRef(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props} />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props} />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props} />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props} />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props} />
  );
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
```

### `frontend/src/components/ui/context-menu.jsx`

```jsx
import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]",
      className
    )}
    {...props} />
))
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 max-h-[--radix-context-menu-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]",
        className
      )}
      {...props} />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props} />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const ContextMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      inset && "pl-8",
      className
    )}
    {...props} />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props} />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({
  className,
  ...props
}) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props} />
  );
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
```

### `frontend/src/components/ui/dialog.jsx`

```jsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props} />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}>
      {children}
      <DialogPrimitive.Close
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props} />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

### `frontend/src/components/ui/drawer.jsx`

```jsx
import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props} />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}>
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props} />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props} />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
```

### `frontend/src/components/ui/dropdown-menu.jsx`

```jsx
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}>
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    )}
    {...props} />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className
      )}
      {...props} />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props} />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props} />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props} />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props} />
  );
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
```

### `frontend/src/components/ui/form.jsx`

```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

const FormFieldContext = React.createContext({})

const FormField = (
  {
    ...props
  }
) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

const FormItemContext = React.createContext({})

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props} />
  );
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props} />
  );
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props} />
  );
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}>
      {body}
    </p>
  );
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
```

### `frontend/src/components/ui/hover-card.jsx`

```jsx
import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-hover-card-content-transform-origin]",
      className
    )}
    {...props} />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
```

### `frontend/src/components/ui/input-otp.jsx`

```jsx
import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Minus } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props} />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      )}
      {...props}>
      {char}
      {hasFakeCaret && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
```

### `frontend/src/components/ui/input.jsx`

```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
```

### `frontend/src/components/ui/label.jsx`

```jsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

### `frontend/src/components/ui/menubar.jsx`

```jsx
import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function MenubarMenu({
  ...props
}) {
  return <MenubarPrimitive.Menu {...props} />;
}

function MenubarGroup({
  ...props
}) {
  return <MenubarPrimitive.Group {...props} />;
}

function MenubarPortal({
  ...props
}) {
  return <MenubarPrimitive.Portal {...props} />;
}

function MenubarRadioGroup({
  ...props
}) {
  return <MenubarPrimitive.RadioGroup {...props} />;
}

function MenubarSub({
  ...props
}) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const Menubar = React.forwardRef(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm",
      className
    )}
    {...props} />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props} />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]",
      className
    )}
    {...props} />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef((
  { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
  ref
) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]",
        className
      )}
      {...props} />
  </MenubarPrimitive.Portal>
))
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props} />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props} />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props} />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props} />
  );
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
```

### `frontend/src/components/ui/navigation-menu.jsx`

```jsx
import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const NavigationMenu = React.forwardRef(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}>
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props} />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
)

const NavigationMenuTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}>
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true" />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className
    )}
    {...props} />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props} />
  </div>
))
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuIndicator = React.forwardRef(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}>
    <div
      className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
```

### `frontend/src/components/ui/pagination.jsx`

```jsx
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button";

const Pagination = ({
  className,
  ...props
}) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props} />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props} />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(buttonVariants({
      variant: isActive ? "outline" : "ghost",
      size,
    }), className)}
    {...props} />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
```

### `frontend/src/components/ui/popover.jsx`

```jsx
import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",
        className
      )}
      {...props} />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```

### `frontend/src/components/ui/progress.jsx`

```jsx
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

### `frontend/src/components/ui/radio-group.jsx`

```jsx
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (<RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />);
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
```

### `frontend/src/components/ui/resizable.jsx`

```jsx
import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props} />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}>
    {withHandle && (
      <div
        className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
```

### `frontend/src/components/ui/scroll-area.jsx`

```jsx
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
```

### `frontend/src/components/ui/select.jsx`

```jsx
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}>
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn("p-1", position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
```

### `frontend/src/components/ui/separator.jsx`

```jsx
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef((
  { className, orientation = "horizontal", decorative = true, ...props },
  ref
) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props} />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
```

### `frontend/src/components/ui/sheet.jsx`

```jsx
import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority";
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref} />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      <SheetPrimitive.Close
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props} />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props} />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```

### `frontend/src/components/ui/skeleton.jsx`

```jsx
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props} />
  );
}

export { Skeleton }
```

### `frontend/src/components/ui/slider.jsx`

```jsx
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}>
    <SliderPrimitive.Track
      className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
```

### `frontend/src/components/ui/sonner.jsx`

```jsx
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
```

### `frontend/src/components/ui/switch.jsx`

```jsx
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```

### `frontend/src/components/ui/table.jsx`

```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props} />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props} />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props} />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props} />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props} />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```

### `frontend/src/components/ui/tabs.jsx`

```jsx
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props} />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props} />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

### `frontend/src/components/ui/textarea.jsx`

```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
```

### `frontend/src/components/ui/toast.jsx`

```jsx
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority";
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props} />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props} />
  );
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props} />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}>
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
```

### `frontend/src/components/ui/toaster.jsx`

```jsx
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
```

### `frontend/src/components/ui/toggle-group.jsx`

```jsx
import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}>
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(toggleVariants({
        variant: context.variant || variant,
        size: context.size || size,
      }), className)}
      {...props}>
      {children}
    </ToggleGroupPrimitive.Item>
  );
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
```

### `frontend/src/components/ui/toggle.jsx`

```jsx
"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props} />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
```

### `frontend/src/components/ui/tooltip.jsx`

```jsx
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props} />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

### `frontend/src/constants/testIds/auth.js`

```javascript
// Test IDs for the auth feature (login, register, password reset, logout).
// Add new keys here as you wire up additional auth UI; see ./index.js for
// the recipe to add a new feature file.
//
// Directive:
//   - Keys are camelCase, values are kebab-case shaped as `<feature>-<element>`
//     (or `<feature>-<element>-<qualifier>` when an element repeats). Examples:
//     'login-submit-button', 'cart-quantity-input', 'product-card-image'.
//   - Reference them in JSX as `data-testid={LOGIN.submitButton}`.
//
// Why kebab-case values: required by qabot's CSS-attribute selector matcher
// and the lint rule `emergent(kebab-case-testid)`.

export const LOGIN = {
	emailInput: 'login-email-input',
	passwordInput: 'login-password-input',
	submitButton: 'login-submit-button',
	forgotPasswordLink: 'login-forgot-password-link',
	registerLink: 'login-register-link',
};

export const REGISTER = {
	nameInput: 'register-name-input',
	emailInput: 'register-email-input',
	passwordInput: 'register-password-input',
	passwordConfirmInput: 'register-password-confirm-input',
	submitButton: 'register-submit-button',
	loginLink: 'register-login-link',
};

export const LOGOUT = {
	button: 'logout-button',
};
```

### `frontend/src/constants/testIds/home.js`

```javascript
// Test IDs for the home / landing feature. Naming follows the directive
// in ./auth.js (keys camelCase, values kebab-case `<feature>-<element>`).

export const HOME = {
	emergentLink: 'home-emergent-link',
};
```

### `frontend/src/constants/testIds/index.js`

```javascript
// constants/testIds/ — central registry of data-testid values used by the
// end-to-end testing agent (qabot) to locate and interact with UI elements
// during automated tests. UI without testids cannot be automatically verified.
//
// Structure: each feature lives in its own file (auth.js, cart.js, ...) and
// is re-exported from here, so consumers can do a single import like
// `import { LOGIN, CART } from '@/constants/testIds'` (or relative).
//
// Adding a new feature:
//   1. Create constants/testIds/<feature>.js
//   2. Export named objects (e.g. `export const PROFILE = { ... }`)
//   3. Re-export here: `export * from './<feature>';`

export * from './auth';
export * from './home';
```

### `frontend/src/context/AppContext.jsx`

```jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken, clearToken, getToken } from "@/lib/api";
import { t } from "@/lib/i18n";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem("samvedna_lang") || "");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const translate = useCallback((key) => t(lang || "en", key), [lang]);

    const changeLang = (code) => {
        setLang(code);
        localStorage.setItem("samvedna_lang", code);
    };

    const loadMe = useCallback(async () => {
        if (!getToken()) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const r = await api.get("/me");
            setUser(r.data);
        } catch {
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMe();
    }, [loadMe]);

    const login = async (token, u) => {
        setToken(token);
        setUser(u);
    };

    const logout = () => {
        clearToken();
        setUser(null);
    };

    return (
        <AppContext.Provider value={{ lang, setLang: changeLang, user, setUser, loading, t: translate, login, logout, refreshMe: loadMe }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp outside provider");
    return ctx;
};
```

### `frontend/src/hooks/use-toast.js`

```javascript
"use client";
// Inspired by react-hot-toast library
import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString();
}

const toastTimeouts = new Map()

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

const listeners = []

let memoryState = { toasts: [] }

function dispatch(action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function toast({
  ...props
}) {
  const id = genId()

  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    };
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast }
```

### `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    margin: 0;
    font-family: "Noto Sans", "Noto Sans Devanagari", system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #0f0e0b;
    color: #1A1A1A;
}

h1, h2, h3, h4, h5 {
    font-family: "Noto Serif", "Noto Serif Devanagari", serif;
    letter-spacing: -0.01em;
}

@layer base {
    :root {
        --background: 42 48% 93%;
        --foreground: 0 0% 10%;
        --card: 0 0% 100%;
        --card-foreground: 0 0% 10%;
        --popover: 0 0% 100%;
        --popover-foreground: 0 0% 10%;
        --primary: 72 51% 24%;
        --primary-foreground: 0 0% 100%;
        --secondary: 42 48% 93%;
        --secondary-foreground: 0 0% 10%;
        --muted: 40 25% 85%;
        --muted-foreground: 0 0% 35%;
        --accent: 40 25% 90%;
        --accent-foreground: 72 51% 24%;
        --destructive: 7 69% 32%;
        --destructive-foreground: 0 0% 100%;
        --border: 39 32% 75%;
        --input: 39 32% 85%;
        --ring: 72 51% 24%;
        --radius: 1rem;
    }
}

@layer base {
    * { @apply border-border; }
    body { @apply bg-cream text-foreground; }
}

/* Mobile frame outer shell on desktop */
.samvedna-shell {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: stretch;
    background:
        radial-gradient(1200px 600px at 10% 0%, rgba(74, 90, 30, 0.25), transparent 60%),
        radial-gradient(900px 500px at 90% 100%, rgba(184, 134, 43, 0.18), transparent 60%),
        #0f0e0b;
}

.frame {
    width: 100%;
    max-width: 420px;
    min-height: 100vh;
    background: #F7EFE2;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    position: relative;
    overflow-x: hidden;
}

/* Thin scrollbar inside frame */
.frame::-webkit-scrollbar { width: 6px; }
.frame::-webkit-scrollbar-thumb { background: #D3C7AC; border-radius: 3px; }

/* Noise/texture overlay for warmth */
.cream-texture {
    background-image:
        radial-gradient(rgba(74, 90, 30, 0.03) 1px, transparent 1px);
    background-size: 18px 18px;
}

/* Button micro-interaction */
.press:active { transform: scale(0.98); }

/* Waveform bars */
.wave-bar { transform-origin: center; }

/* Devanagari rendering tweak */
.hindi { font-family: "Noto Serif Devanagari", "Noto Serif", serif; }

@layer base {
    [data-debug-wrapper="true"] { display: contents !important; }
}

/* Hide default button rings but keep accessible focus */
button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible {
    outline: 2px solid #4A5A1E;
    outline-offset: 2px;
}
```

### `frontend/src/index.js`

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

### `frontend/src/lib/api.js`

```javascript
import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("samvedna_token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export const setToken = (t) => localStorage.setItem("samvedna_token", t);
export const clearToken = () => localStorage.removeItem("samvedna_token");
export const getToken = () => localStorage.getItem("samvedna_token");
```

### `frontend/src/lib/i18n.js`

```javascript
// Hinglish-first bilingual labels. en/hi/hinglish fully translated; others fall back to en.
export const LANGUAGES = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिंदी" },
    { code: "hinglish", label: "Hinglish", native: "Hinglish" },
    { code: "bn", label: "Bengali", native: "বাংলা" },
    { code: "mr", label: "Marathi", native: "मराठी" },
    { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
    { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
    { code: "te", label: "Telugu", native: "తెలుగు" },
    { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

const en = {
    app_name: "Samvedna",
    app_sub: "संवेदना",
    helpline_banner: "24/7 Helpline — Tap to Call 14566",
    continue: "Continue",
    continue_hi: "Aage Badhein",
    back: "Back",
    verify: "Verify",
    resend: "Resend",
    choose_language: "Choose your language",
    choose_language_hi: "अपनी भाषा चुनें",
    login_title: "Secure Login",
    login_sub: "सुरक्षित लॉगिन",
    phone_label: "Mobile Number",
    email_label: "Email Address",
    send_otp: "Send OTP",
    enter_mobile_otp: "Enter the 4-digit code sent to your mobile",
    enter_email_otp: "Enter the 4-digit code sent to your email",
    whatsapp_option: "Continue via WhatsApp",
    play_audio_help: "Play audio instructions",
    home_hero_title: "Describe a New Problem",
    home_hero_sub: "अपनी समस्या बताएँ",
    home_hero_cta: "Start Now / शुरू करें",
    tile_timeline: "Case Timeline",
    tile_support: "Support Directory",
    tile_drafts: "Drafted Complaints",
    tile_history: "Query History",
    category_title: "Choose a Category",
    category_sub: "श्रेणी चुनें",
    cat_physical: "Physical Violence",
    cat_physical_hi: "शारीरिक हिंसा",
    cat_caste: "Caste-based Abuse / Threats",
    cat_caste_hi: "जाति आधारित दुर्व्यवहार",
    cat_property: "Land / Property / Eviction",
    cat_property_hi: "भूमि / संपत्ति / बेदखली",
    cat_social: "Social Boycott / Economic Harassment",
    cat_social_hi: "सामाजिक बहिष्कार",
    cat_sexual: "Sexual Violence",
    cat_sexual_hi: "यौन हिंसा",
    cat_discrim: "Discrimination at Work/School",
    cat_discrim_hi: "कार्यस्थल में भेदभाव",
    consent_title: "Allow Voice Input",
    consent_sub: "आवाज़ से बताइए",
    consent_body: "We will record your voice to understand your distress. Your audio is encrypted and only visible to assigned counsellors.",
    allow_voice: "Allow Voice Input",
    type_instead: "Type Instead",
    intake_title: "Tell Us What Happened",
    intake_sub: "हमें बताएँ",
    intake_record: "Tap to Record",
    intake_stop: "Stop Recording",
    intake_placeholder: "Type what happened, in your own words...",
    verify_title: "Step 3 of 4 — Fact check",
    verify_sub: "पुष्टि",
    yes_correct: "Yes, That's Right",
    let_me_clarify: "Let Me Clarify",
    assessment_title: "Your Assessment",
    assessment_sub: "आपका आकलन",
    assessment_disclaimer: "Triage, not diagnosis — a counsellor will review this.",
    top_factors: "Top factors",
    rights_card_title: "Your Rights",
    rights_card_body: "Under the SC/ST (Prevention of Atrocities) Act, 1989 — you are protected against caste-based intimidation, abuse and economic boycott. Legal aid is free under NALSA.",
    what_this_means: "What This Means For You",
    next_steps: "Next Steps",
    talk_to_counsellor: "Talk to Senior Counsellor",
    call_14566: "Tap to Call 14566",
    draft_title: "Complaint Draft",
    draft_sub: "शिकायत मसौदा",
    download_pdf: "Download PDF",
    download_docx: "Download DOCX",
    timeline_title: "Case Timeline",
    stage_logged: "Logged",
    stage_verified: "Verified",
    stage_guidance: "Guidance",
    stage_drafted: "Drafted",
    stage_filed: "Filed",
    stage_followup: "Follow-up",
    nav_guidance: "Guidance",
    nav_thread: "Thread",
    nav_helpline: "Helpline",
    nav_profile: "Profile",
    counsellor_portal: "Counsellor Portal",
    priority_queue: "Priority Queue",
    accept_case: "Accept",
    escalate: "Escalate",
    add_note: "Add Note",
    svi_low: "Low",
    svi_moderate: "Moderate",
    svi_high: "High",
    svi_critical: "Critical",
    operator_title: "Operator Assist — Live SVI",
    supervisor_title: "Supervisor — Audit Log",
    logout: "Logout",
    enter_narrative_min: "Please add more details so we can help you (minimum 10 characters).",
    recording: "Recording…",
    live_waveform: "Live waveform",
    allow_mic_hint: "Microphone permission is required.",
    saved: "Saved",
    error_generic: "Something went wrong. Please try again.",
    sent_dev: "DEV MODE: OTPs are visible on-screen for testing.",
    dev_otp_mobile: "Mobile OTP",
    dev_otp_email: "Email OTP",
    timeline_header: "Case",
    no_cases: "No cases yet.",
    support_dir_title: "Support Directory",
    support_dir_sub: "सहायता निर्देशिका",
    history_title: "Query History",
    drafts_title: "Drafted Complaints",
    profile_title: "Profile",
    language: "Language",
    threat_q: "Is the threat still active?",
    isolation_q: "Do you feel isolated?",
    yes: "Yes",
    no: "No",
    create_case: "Submit & Analyse",
    sections_updated: "Case updated",
};

const hi = {
    ...en,
    app_name: "Samvedna",
    app_sub: "संवेदना",
    helpline_banner: "24 घंटे हेल्पलाइन — 14566 पर कॉल करें",
    continue: "Aage Badhein",
    continue_hi: "आगे बढ़ें",
    back: "वापस",
    verify: "सत्यापित करें",
    resend: "फिर भेजें",
    choose_language: "अपनी भाषा चुनें",
    choose_language_hi: "Choose your language",
    login_title: "सुरक्षित लॉगिन",
    login_sub: "Secure Login",
    phone_label: "मोबाइल नंबर",
    email_label: "ईमेल पता",
    send_otp: "OTP भेजें",
    enter_mobile_otp: "मोबाइल पर आया 4-अंकीय कोड डालें",
    enter_email_otp: "ईमेल पर आया 4-अंकीय कोड डालें",
    whatsapp_option: "WhatsApp से जारी रखें",
    play_audio_help: "सुनकर मदद लें",
    home_hero_title: "नई समस्या बताएँ",
    home_hero_sub: "Describe a New Problem",
    home_hero_cta: "शुरू करें / Start Now",
    tile_timeline: "केस टाइमलाइन",
    tile_support: "सहायता निर्देशिका",
    tile_drafts: "शिकायत मसौदे",
    tile_history: "पूर्व पूछताछ",
    category_title: "श्रेणी चुनें",
    category_sub: "Choose a Category",
    cat_physical: "शारीरिक हिंसा",
    cat_caste: "जाति आधारित दुर्व्यवहार",
    cat_property: "भूमि / संपत्ति / बेदखली",
    cat_social: "सामाजिक बहिष्कार",
    cat_sexual: "यौन हिंसा",
    cat_discrim: "कार्यस्थल में भेदभाव",
    consent_title: "आवाज़ दर्ज करें",
    consent_body: "हम आपकी आवाज़ रिकॉर्ड करेंगे ताकि आपकी स्थिति समझ सकें। ऑडियो एन्क्रिप्टेड है और केवल काउंसलर देख पाएंगे।",
    allow_voice: "आवाज़ अनुमति दें",
    type_instead: "लिखकर बताएँ",
    intake_title: "क्या हुआ, हमें बताइए",
    intake_record: "रिकॉर्ड करें",
    intake_stop: "रुकें",
    intake_placeholder: "अपनी भाषा में लिखिए क्या हुआ...",
    verify_title: "चरण 3/4 — पुष्टि",
    yes_correct: "हाँ, सही है",
    let_me_clarify: "थोड़ा स्पष्ट करें",
    assessment_title: "आपका आकलन",
    assessment_disclaimer: "ट्राइएज मात्र — काउंसलर समीक्षा करेंगे।",
    top_factors: "मुख्य कारक",
    rights_card_title: "आपके अधिकार",
    rights_card_body: "SC/ST (अत्याचार निवारण) अधिनियम, 1989 के अंतर्गत — आप जाति आधारित धमकी, दुर्व्यवहार और आर्थिक बहिष्कार से सुरक्षित हैं। NALSA के तहत विधिक सहायता निःशुल्क।",
    what_this_means: "आपके लिए क्या मायने रखता है",
    next_steps: "अगले कदम",
    talk_to_counsellor: "वरिष्ठ काउंसलर से बात करें",
    call_14566: "14566 पर कॉल करें",
    draft_title: "शिकायत मसौदा",
    download_pdf: "PDF डाउनलोड",
    download_docx: "DOCX डाउनलोड",
    nav_guidance: "मार्गदर्शन",
    nav_thread: "थ्रेड",
    nav_helpline: "हेल्पलाइन",
    nav_profile: "प्रोफाइल",
    yes: "हाँ",
    no: "नहीं",
    create_case: "भेजें और विश्लेषण करें",
};

const hinglish = {
    ...en,
    helpline_banner: "24/7 Helpline — 14566 pe call karein",
    continue: "Aage Badhein",
    continue_hi: "Continue",
    back: "Peeche",
    verify: "Verify Karein",
    resend: "Firse bhejein",
    choose_language: "Apni bhasha chunein",
    login_title: "Secure Login",
    phone_label: "Mobile Number",
    email_label: "Email Address",
    send_otp: "OTP Bhejein",
    enter_mobile_otp: "Mobile pe aaya 4-digit code daalein",
    enter_email_otp: "Email pe aaya 4-digit code daalein",
    home_hero_title: "Nayi Samasya Bataiye",
    home_hero_sub: "Describe a New Problem",
    home_hero_cta: "Shuru Karein",
    tile_timeline: "Case Timeline",
    tile_support: "Support Directory",
    tile_drafts: "Draft Complaints",
    tile_history: "Puraani Puchhtaach",
    category_title: "Category Chunein",
    cat_physical: "Sharirik Hinsa / Physical Violence",
    cat_caste: "Jaati Dushpraysa / Caste Abuse",
    cat_property: "Zameen / Property / Bedakhli",
    cat_social: "Samajik Bahishkar",
    cat_sexual: "Yaun Hinsa / Sexual Violence",
    cat_discrim: "Bhedbhav at Work/School",
    consent_title: "Awaaz Allow Karein",
    allow_voice: "Awaaz Allow Karein",
    type_instead: "Likh Kar Batayein",
    intake_title: "Kya Hua Hamein Batayein",
    intake_record: "Record karein",
    intake_stop: "Rukein",
    yes_correct: "Haan, Sahi Hai",
    let_me_clarify: "Thoda Clarify Karein",
    assessment_title: "Aapka Assessment",
    talk_to_counsellor: "Senior Counsellor se baat karein",
    call_14566: "14566 par call karein",
    draft_title: "Shikayat Draft",
    nav_guidance: "Guidance",
    nav_thread: "Thread",
    nav_helpline: "Helpline",
    nav_profile: "Profile",
    yes: "Haan",
    no: "Nahi",
    create_case: "Bhejein aur Analyse karein",
};

export const DICTS = { en, hi, hinglish };

// Merge Indic translations (fall back to en for missing keys)
import { bn, mr, gu, pa, ta, te, kn } from "./i18n_indic";
const mergeFallback = (base, overrides) => ({ ...base, ...overrides });
DICTS.bn = mergeFallback(en, bn);
DICTS.mr = mergeFallback(en, mr);
DICTS.gu = mergeFallback(en, gu);
DICTS.pa = mergeFallback(en, pa);
DICTS.ta = mergeFallback(en, ta);
DICTS.te = mergeFallback(en, te);
DICTS.kn = mergeFallback(en, kn);

export function t(code, key) {
    const dict = DICTS[code] || DICTS[en] || en;
    return (dict && dict[key]) || en[key] || key;
}
```

### `frontend/src/lib/i18n_indic.js`

```javascript
// Full Indic translations for Samvedna. 10 scripts fully covered; others defined in i18n.js.
// This module exports the 7 additional languages (bn, mr, gu, pa, ta, te, kn).

export const bn = {
    app_name: "Samvedna",
    app_sub: "সংবেদনা",
    helpline_banner: "২৪/৭ হেল্পলাইন — ১৪৫৬৬-এ কল করুন",
    continue: "এগিয়ে যান",
    continue_hi: "Continue",
    back: "ফিরে যান",
    verify: "যাচাই করুন",
    resend: "আবার পাঠান",
    choose_language: "আপনার ভাষা বাছুন",
    choose_language_hi: "अपनी भाषा चुनें",
    login_title: "নিরাপদ লগইন",
    login_sub: "Secure Login",
    phone_label: "মোবাইল নম্বর",
    email_label: "ইমেল",
    send_otp: "OTP পাঠান",
    enter_mobile_otp: "মোবাইলে পাঠানো ৪-অঙ্কের কোডটি লিখুন",
    enter_email_otp: "ইমেলে পাঠানো ৪-অঙ্কের কোডটি লিখুন",
    whatsapp_option: "WhatsApp দিয়ে চালিয়ে যান",
    home_hero_title: "নতুন সমস্যা জানান",
    home_hero_sub: "Describe a New Problem",
    tile_timeline: "কেস টাইমলাইন",
    tile_support: "সহায়তা তালিকা",
    tile_drafts: "খসড়া অভিযোগ",
    tile_history: "পূর্বের অনুসন্ধান",
    category_title: "একটি শ্রেণী বাছুন",
    cat_physical: "শারীরিক হিংসা",
    cat_caste: "জাতিগত হেনস্থা / হুমকি",
    cat_property: "জমি / সম্পত্তি / উচ্ছেদ",
    cat_social: "সামাজিক বয়কট",
    cat_sexual: "যৌন হিংসা",
    cat_discrim: "কর্মস্থল / বিদ্যালয়ে বৈষম্য",
    consent_title: "ভয়েস ইনপুট অনুমতি",
    allow_voice: "ভয়েস অনুমতি দিন",
    type_instead: "টাইপ করে বলুন",
    intake_title: "আপনার কথা শুনতে চাই",
    intake_record: "রেকর্ড করুন",
    intake_stop: "থামুন",
    yes_correct: "হ্যাঁ, ঠিক আছে",
    let_me_clarify: "আরো স্পষ্ট করি",
    assessment_title: "আপনার মূল্যায়ন",
    assessment_disclaimer: "ট্রাইয়েজ মাত্র — কাউন্সেলর পর্যালোচনা করবেন।",
    top_factors: "প্রধান কারণ",
    rights_card_title: "আপনার অধিকার",
    what_this_means: "এর অর্থ কী",
    next_steps: "পরবর্তী পদক্ষেপ",
    talk_to_counsellor: "সিনিয়র কাউন্সেলরের সঙ্গে কথা বলুন",
    call_14566: "১৪৫৬৬-এ কল করুন",
    draft_title: "অভিযোগ খসড়া",
    download_pdf: "PDF ডাউনলোড",
    download_docx: "DOCX ডাউনলোড",
    nav_guidance: "দিকনির্দেশ",
    nav_thread: "থ্রেড",
    nav_helpline: "হেল্পলাইন",
    nav_profile: "প্রোফাইল",
    yes: "হ্যাঁ",
    no: "না",
    create_case: "পাঠান ও বিশ্লেষণ করুন",
};

export const mr = {
    app_name: "Samvedna",
    app_sub: "संवेदना",
    helpline_banner: "२४/७ हेल्पलाइन — १४५६६ वर कॉल करा",
    continue: "पुढे जा",
    continue_hi: "Continue",
    back: "मागे",
    verify: "सत्यापित करा",
    resend: "पुन्हा पाठवा",
    choose_language: "आपली भाषा निवडा",
    login_title: "सुरक्षित प्रवेश",
    phone_label: "मोबाइल क्रमांक",
    email_label: "ईमेल",
    send_otp: "OTP पाठवा",
    enter_mobile_otp: "मोबाइलवर आलेला ४-अंकी कोड टाका",
    enter_email_otp: "ईमेलवर आलेला ४-अंकी कोड टाका",
    home_hero_title: "नवी समस्या सांगा",
    home_hero_sub: "Describe a New Problem",
    tile_timeline: "केस टाइमलाइन",
    tile_support: "मदत संचालिका",
    tile_drafts: "मसुदा तक्रारी",
    tile_history: "मागील चौकशी",
    category_title: "श्रेणी निवडा",
    cat_physical: "शारीरिक हिंसा",
    cat_caste: "जातीय शिवीगाळ / धमक्या",
    cat_property: "जमीन / मालमत्ता / हकालपट्टी",
    cat_social: "सामाजिक बहिष्कार",
    cat_sexual: "लैंगिक हिंसा",
    cat_discrim: "कामाच्या ठिकाणी भेदभाव",
    consent_title: "आवाज अनुमती द्या",
    allow_voice: "आवाज अनुमती",
    type_instead: "टाइप करून सांगा",
    intake_title: "काय झाले ते सांगा",
    intake_record: "रेकॉर्ड करा",
    intake_stop: "थांबा",
    yes_correct: "होय, बरोबर आहे",
    let_me_clarify: "थोडे स्पष्ट करू द्या",
    assessment_title: "आपले मूल्यमापन",
    top_factors: "मुख्य कारणे",
    rights_card_title: "आपले अधिकार",
    what_this_means: "याचा काय अर्थ",
    next_steps: "पुढील पावले",
    talk_to_counsellor: "वरिष्ठ कौन्सेलरशी बोला",
    call_14566: "१४५६६ वर कॉल करा",
    draft_title: "तक्रार मसुदा",
    download_pdf: "PDF डाउनलोड",
    download_docx: "DOCX डाउनलोड",
    nav_guidance: "मार्गदर्शन",
    nav_thread: "थ्रेड",
    nav_helpline: "हेल्पलाइन",
    nav_profile: "प्रोफाइल",
    yes: "होय",
    no: "नाही",
    create_case: "पाठवा आणि विश्लेषण करा",
};

export const gu = {
    app_name: "Samvedna",
    app_sub: "સંવેદના",
    helpline_banner: "૨૪/૭ હેલ્પલાઈન — ૧૪૫૬૬ પર કૉલ કરો",
    continue: "આગળ વધો",
    back: "પાછળ",
    verify: "ચકાસો",
    resend: "ફરીથી મોકલો",
    choose_language: "તમારી ભાષા પસંદ કરો",
    login_title: "સુરક્ષિત લોગિન",
    phone_label: "મોબાઈલ નંબર",
    email_label: "ઈમેલ",
    send_otp: "OTP મોકલો",
    enter_mobile_otp: "મોબાઈલ પર આવેલ ૪-આંકડાનો કોડ દાખલ કરો",
    enter_email_otp: "ઈમેલ પર આવેલ ૪-આંકડાનો કોડ દાખલ કરો",
    home_hero_title: "નવી સમસ્યા જણાવો",
    home_hero_sub: "Describe a New Problem",
    tile_timeline: "કેસ ટાઈમલાઈન",
    tile_support: "સહાય નિર્દેશિકા",
    tile_drafts: "ડ્રાફ્ટ ફરિયાદ",
    tile_history: "અગાઉના પ્રશ્નો",
    category_title: "વિભાગ પસંદ કરો",
    cat_physical: "શારીરિક હિંસા",
    cat_caste: "જાતિગત દુર્વ્યવહાર / ધમકી",
    cat_property: "જમીન / મિલકત / હટાવ",
    cat_social: "સામાજિક બહિષ્કાર",
    cat_sexual: "જાતીય હિંસા",
    cat_discrim: "કાર્યસ્થળ / શાળામાં ભેદભાવ",
    consent_title: "અવાજ પરવાનગી આપો",
    allow_voice: "અવાજ પરવાનગી",
    type_instead: "લખીને જણાવો",
    intake_title: "શું થયું, અમને જણાવો",
    intake_record: "રેકોર્ડ કરો",
    intake_stop: "અટકો",
    yes_correct: "હા, બરાબર છે",
    let_me_clarify: "થોડું સ્પષ્ટ કરું",
    assessment_title: "તમારું મૂલ્યાંકન",
    top_factors: "મુખ્ય પરિબળો",
    rights_card_title: "તમારા અધિકારો",
    what_this_means: "આનો શું અર્થ",
    next_steps: "આગળનાં પગલાં",
    talk_to_counsellor: "સિનિયર કાઉન્સેલર સાથે વાત કરો",
    call_14566: "૧૪૫૬૬ પર કૉલ કરો",
    draft_title: "ફરિયાદ મસુદો",
    download_pdf: "PDF ડાઉનલોડ",
    download_docx: "DOCX ડાઉનલોડ",
    nav_guidance: "માર્ગદર્શન",
    nav_thread: "થ્રેડ",
    nav_helpline: "હેલ્પલાઈન",
    nav_profile: "પ્રોફાઇલ",
    yes: "હા",
    no: "ના",
    create_case: "મોકલો અને વિશ્લેષણ કરો",
};

export const pa = {
    app_name: "Samvedna",
    app_sub: "ਸੰਵੇਦਨਾ",
    helpline_banner: "੨੪/੭ ਹੈਲਪਲਾਈਨ — ੧੪੫੬੬ 'ਤੇ ਕਾਲ ਕਰੋ",
    continue: "ਅੱਗੇ ਵਧੋ",
    back: "ਵਾਪਸ",
    verify: "ਤਸਦੀਕ ਕਰੋ",
    resend: "ਮੁੜ ਭੇਜੋ",
    choose_language: "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ",
    login_title: "ਸੁਰੱਖਿਅਤ ਲਾਗਇਨ",
    phone_label: "ਮੋਬਾਈਲ ਨੰਬਰ",
    email_label: "ਈਮੇਲ",
    send_otp: "OTP ਭੇਜੋ",
    enter_mobile_otp: "ਮੋਬਾਈਲ 'ਤੇ ਆਇਆ ੪-ਅੰਕੀ ਕੋਡ ਪਾਓ",
    enter_email_otp: "ਈਮੇਲ 'ਤੇ ਆਇਆ ੪-ਅੰਕੀ ਕੋਡ ਪਾਓ",
    home_hero_title: "ਨਵੀਂ ਸਮੱਸਿਆ ਦੱਸੋ",
    home_hero_sub: "Describe a New Problem",
    tile_timeline: "ਕੇਸ ਟਾਈਮਲਾਈਨ",
    tile_support: "ਸਹਾਇਤਾ ਸੂਚੀ",
    tile_drafts: "ਡਰਾਫਟ ਸ਼ਿਕਾਇਤਾਂ",
    tile_history: "ਪਿਛਲੀ ਪੁੱਛਗਿੱਛ",
    category_title: "ਸ਼੍ਰੇਣੀ ਚੁਣੋ",
    cat_physical: "ਸਰੀਰਕ ਹਿੰਸਾ",
    cat_caste: "ਜਾਤੀ ਆਧਾਰਿਤ ਦੁਰਵਿਵਹਾਰ",
    cat_property: "ਜ਼ਮੀਨ / ਜਾਇਦਾਦ / ਬੇਦਖ਼ਲੀ",
    cat_social: "ਸਮਾਜਿਕ ਬਾਈਕਾਟ",
    cat_sexual: "ਜਿਨਸੀ ਹਿੰਸਾ",
    cat_discrim: "ਕੰਮ ਵਾਲੀ ਥਾਂ 'ਤੇ ਵਿਤਕਰਾ",
    consent_title: "ਆਵਾਜ਼ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ",
    allow_voice: "ਆਵਾਜ਼ ਇਜਾਜ਼ਤ",
    type_instead: "ਲਿਖ ਕੇ ਦੱਸੋ",
    intake_title: "ਕੀ ਹੋਇਆ, ਸਾਨੂੰ ਦੱਸੋ",
    intake_record: "ਰਿਕਾਰਡ ਕਰੋ",
    intake_stop: "ਰੁਕੋ",
    yes_correct: "ਹਾਂ, ਠੀਕ ਹੈ",
    let_me_clarify: "ਥੋੜ੍ਹਾ ਸਪੱਸ਼ਟ ਕਰੀਏ",
    assessment_title: "ਤੁਹਾਡਾ ਮੁਲਾਂਕਣ",
    top_factors: "ਮੁੱਖ ਕਾਰਕ",
    rights_card_title: "ਤੁਹਾਡੇ ਹੱਕ",
    what_this_means: "ਇਸਦਾ ਕੀ ਮਤਲਬ",
    next_steps: "ਅਗਲੇ ਕਦਮ",
    talk_to_counsellor: "ਸੀਨੀਅਰ ਕਾਊਂਸਲਰ ਨਾਲ ਗੱਲ ਕਰੋ",
    call_14566: "੧੪੫੬੬ 'ਤੇ ਕਾਲ ਕਰੋ",
    draft_title: "ਸ਼ਿਕਾਇਤ ਡਰਾਫਟ",
    download_pdf: "PDF ਡਾਊਨਲੋਡ",
    download_docx: "DOCX ਡਾਊਨਲੋਡ",
    nav_guidance: "ਮਾਰਗਦਰਸ਼ਨ",
    nav_thread: "ਥ੍ਰੈੱਡ",
    nav_helpline: "ਹੈਲਪਲਾਈਨ",
    nav_profile: "ਪ੍ਰੋਫਾਈਲ",
    yes: "ਹਾਂ",
    no: "ਨਹੀਂ",
    create_case: "ਭੇਜੋ ਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
};

export const ta = {
    app_name: "Samvedna",
    app_sub: "சம்வேதனா",
    helpline_banner: "24/7 உதவி எண் — 14566 அழைக்கவும்",
    continue: "தொடரவும்",
    back: "பின்",
    verify: "சரிபார்க்கவும்",
    resend: "மீண்டும் அனுப்பு",
    choose_language: "உங்கள் மொழியை தேர்ந்தெடுக்கவும்",
    login_title: "பாதுகாப்பான உள்நுழைவு",
    phone_label: "கைபேசி எண்",
    email_label: "மின்னஞ்சல்",
    send_otp: "OTP அனுப்பு",
    enter_mobile_otp: "கைபேசிக்கு வந்த 4-இலக்க குறியீட்டை இடுக",
    enter_email_otp: "மின்னஞ்சலுக்கு வந்த 4-இலக்க குறியீட்டை இடுக",
    home_hero_title: "புதிய பிரச்சனையை பகிர்க",
    home_hero_sub: "Describe a New Problem",
    tile_timeline: "வழக்கு காலக்கோடு",
    tile_support: "ஆதரவு பட்டியல்",
    tile_drafts: "புகார் வரைவுகள்",
    tile_history: "முந்தைய கேள்விகள்",
    category_title: "வகையை தேர்ந்தெடுக்கவும்",
    cat_physical: "உடல் வன்முறை",
    cat_caste: "சாதி சார்ந்த துஷ்பிரயோகம்",
    cat_property: "நிலம் / சொத்து / வெளியேற்றம்",
    cat_social: "சமூக புறக்கணிப்பு",
    cat_sexual: "பாலியல் வன்முறை",
    cat_discrim: "பணியிடம் / பள்ளியில் பாகுபாடு",
    consent_title: "குரல் அனுமதி",
    allow_voice: "குரல் அனுமதி வழங்கு",
    type_instead: "தட்டச்சு செய்க",
    intake_title: "என்ன நடந்தது சொல்லுங்கள்",
    intake_record: "பதிவு செய்யவும்",
    intake_stop: "நிறுத்து",
    yes_correct: "ஆம், சரிதான்",
    let_me_clarify: "கொஞ்சம் தெளிவுபடுத்த",
    assessment_title: "உங்கள் மதிப்பீடு",
    top_factors: "முக்கிய காரணிகள்",
    rights_card_title: "உங்கள் உரிமைகள்",
    what_this_means: "இதன் பொருள்",
    next_steps: "அடுத்த படிகள்",
    talk_to_counsellor: "முதன்மை ஆலோசகரிடம் பேசவும்",
    call_14566: "14566 அழைக்கவும்",
    draft_title: "புகார் வரைவு",
    download_pdf: "PDF பதிவிறக்கம்",
    download_docx: "DOCX பதிவிறக்கம்",
    nav_guidance: "வழிகாட்டி",
    nav_thread: "இழை",
    nav_helpline: "உதவி எண்",
    nav_profile: "சுயவிவரம்",
    yes: "ஆம்",
    no: "இல்லை",
    create_case: "அனுப்பி பகுப்பாய்",
};

export const te = {
    app_name: "Samvedna",
    app_sub: "సంవేదన",
    helpline_banner: "24/7 హెల్ప్‌లైన్ — 14566కు కాల్ చేయండి",
    continue: "ముందుకు",
    back: "వెనుకకు",
    verify: "ధృవీకరించండి",
    resend: "మళ్ళీ పంపండి",
    choose_language: "మీ భాష ఎంచుకోండి",
    login_title: "సురక్షిత లాగిన్",
    phone_label: "మొబైల్ నంబర్",
    email_label: "ఈమెయిల్",
    send_otp: "OTP పంపండి",
    enter_mobile_otp: "మొబైల్‌కు వచ్చిన 4-అంకెల కోడ్ ఎంటర్ చేయండి",
    enter_email_otp: "ఈమెయిల్‌కు వచ్చిన 4-అంకెల కోడ్ ఎంటర్ చేయండి",
    home_hero_title: "కొత్త సమస్య చెప్పండి",
    home_hero_sub: "Describe a New Problem",
    tile_timeline: "కేస్ టైమ్‌లైన్",
    tile_support: "సహాయ డైరెక్టరీ",
    tile_drafts: "ముసాయిదా ఫిర్యాదులు",
    tile_history: "మునుపటి ప్రశ్నలు",
    category_title: "వర్గం ఎంచుకోండి",
    cat_physical: "శారీరిక హింస",
    cat_caste: "కుల ఆధారిత దుర్వినియోగం",
    cat_property: "భూమి / ఆస్తి / బహిష్కరణ",
    cat_social: "సామాజిక బహిష్కరణ",
    cat_sexual: "లైంగిక హింస",
    cat_discrim: "కార్యస్థలంలో వివక్ష",
    consent_title: "వాయిస్ అనుమతి",
    allow_voice: "వాయిస్ అనుమతి ఇవ్వండి",
    type_instead: "టైప్ చేయండి",
    intake_title: "ఏం జరిగిందో చెప్పండి",
    intake_record: "రికార్డ్ చేయండి",
    intake_stop: "ఆపండి",
    yes_correct: "అవును, సరే",
    let_me_clarify: "కొంచెం స్పష్టం చేస్తాను",
    assessment_title: "మీ మూల్యాంకనం",
    top_factors: "ముఖ్య కారకాలు",
    rights_card_title: "మీ హక్కులు",
    what_this_means: "దీని అర్థం",
    next_steps: "తర్వాతి దశలు",
    talk_to_counsellor: "సీనియర్ కౌన్సెలర్‌తో మాట్లాడండి",
    call_14566: "14566కు కాల్ చేయండి",
    draft_title: "ఫిర్యాదు ముసాయిదా",
    download_pdf: "PDF డౌన్‌లోడ్",
    download_docx: "DOCX డౌన్‌లోడ్",
    nav_guidance: "మార్గదర్శనం",
    nav_thread: "థ్రెడ్",
    nav_helpline: "హెల్ప్‌లైన్",
    nav_profile: "ప్రొఫైల్",
    yes: "అవును",
    no: "కాదు",
    create_case: "పంపి విశ్లేషించండి",
};

export const kn = {
    app_name: "Samvedna",
    app_sub: "ಸಂವೇದನಾ",
    helpline_banner: "24/7 ಹೆಲ್ಪ್‌ಲೈನ್ — 14566 ಗೆ ಕರೆ ಮಾಡಿ",
    continue: "ಮುಂದುವರಿ",
    back: "ಹಿಂತಿರುಗಿ",
    verify: "ದೃಢೀಕರಿಸಿ",
    resend: "ಮತ್ತೊಮ್ಮೆ ಕಳುಹಿಸಿ",
    choose_language: "ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    login_title: "ಸುರಕ್ಷಿತ ಲಾಗಿನ್",
    phone_label: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    email_label: "ಇಮೇಲ್",
    send_otp: "OTP ಕಳುಹಿಸಿ",
    enter_mobile_otp: "ಮೊಬೈಲ್‌ಗೆ ಬಂದ 4-ಅಂಕಿಯ ಕೋಡ್ ನಮೂದಿಸಿ",
    enter_email_otp: "ಇಮೇಲ್‌ಗೆ ಬಂದ 4-ಅಂಕಿಯ ಕೋಡ್ ನಮೂದಿಸಿ",
    home_hero_title: "ಹೊಸ ಸಮಸ್ಯೆ ಹೇಳಿ",
    home_hero_sub: "Describe a New Problem",
    tile_timeline: "ಕೇಸ್ ಟೈಮ್‌ಲೈನ್",
    tile_support: "ಸಹಾಯ ಪಟ್ಟಿ",
    tile_drafts: "ಕರಡು ದೂರುಗಳು",
    tile_history: "ಹಿಂದಿನ ಪ್ರಶ್ನೆಗಳು",
    category_title: "ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ",
    cat_physical: "ದೈಹಿಕ ಹಿಂಸೆ",
    cat_caste: "ಜಾತಿ ಆಧಾರಿತ ದುರ್ಬಳಕೆ",
    cat_property: "ಭೂಮಿ / ಆಸ್ತಿ / ಹೊರಹಾಕುವಿಕೆ",
    cat_social: "ಸಾಮಾಜಿಕ ಬಹಿಷ್ಕಾರ",
    cat_sexual: "ಲೈಂಗಿಕ ಹಿಂಸೆ",
    cat_discrim: "ಕಾರ್ಯಸ್ಥಳದಲ್ಲಿ ತಾರತಮ್ಯ",
    consent_title: "ಧ್ವನಿ ಅನುಮತಿ",
    allow_voice: "ಧ್ವನಿ ಅನುಮತಿ ನೀಡಿ",
    type_instead: "ಟೈಪ್ ಮಾಡಿ",
    intake_title: "ಏನಾಯಿತು ಹೇಳಿ",
    intake_record: "ದಾಖಲಿಸಿ",
    intake_stop: "ನಿಲ್ಲಿಸಿ",
    yes_correct: "ಹೌದು, ಸರಿಯಾಗಿದೆ",
    let_me_clarify: "ಸ್ವಲ್ಪ ಸ್ಪಷ್ಟಪಡಿಸಲಿ",
    assessment_title: "ನಿಮ್ಮ ಮೌಲ್ಯಮಾಪನ",
    top_factors: "ಪ್ರಮುಖ ಅಂಶಗಳು",
    rights_card_title: "ನಿಮ್ಮ ಹಕ್ಕುಗಳು",
    what_this_means: "ಇದರ ಅರ್ಥ",
    next_steps: "ಮುಂದಿನ ಹಂತಗಳು",
    talk_to_counsellor: "ಹಿರಿಯ ಸಲಹೆಗಾರರೊಂದಿಗೆ ಮಾತನಾಡಿ",
    call_14566: "14566 ಗೆ ಕರೆ ಮಾಡಿ",
    draft_title: "ದೂರಿನ ಕರಡು",
    download_pdf: "PDF ಡೌನ್‌ಲೋಡ್",
    download_docx: "DOCX ಡೌನ್‌ಲೋಡ್",
    nav_guidance: "ಮಾರ್ಗದರ್ಶನ",
    nav_thread: "ಥ್ರೆಡ್",
    nav_helpline: "ಹೆಲ್ಪ್‌ಲೈನ್",
    nav_profile: "ಪ್ರೊಫೈಲ್",
    yes: "ಹೌದು",
    no: "ಇಲ್ಲ",
    create_case: "ಕಳುಹಿಸಿ ಮತ್ತು ವಿಶ್ಲೇಷಿಸಿ",
};
```

### `frontend/src/lib/push.js`

```javascript
// Web push helpers for Samvedna counsellor portal.
import { api } from "./api";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
}

export async function enablePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push not supported in this browser");
    }
    const reg = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Notification permission denied");

    let publicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    if (!publicKey) {
        const r = await api.get("/push/public-key");
        publicKey = r.data.public_key;
    }

    const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await api.post("/push/subscribe", { subscription: sub.toJSON ? sub.toJSON() : sub });
    return sub;
}

export async function testPush() {
    const r = await api.post("/push/test");
    return r.data;
}

export async function isPushEnabled() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
}
```

### `frontend/src/lib/utils.js`

```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### `frontend/src/lib/voice.js`

```javascript
// Multilingual voice helpers using Web Speech API.
export const LANG_TO_BCP47 = {
    en: "en-IN",
    hi: "hi-IN",
    hinglish: "en-IN",
    bn: "bn-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    pa: "pa-IN",
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN",
};

export function speakText(text, langCode = "en") {
    try {
        if (!("speechSynthesis" in window)) return false;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = LANG_TO_BCP47[langCode] || "en-IN";
        u.rate = 0.95;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
        return true;
    } catch (e) {
        return false;
    }
}

export function stopSpeaking() {
    try { window.speechSynthesis.cancel(); } catch (_) {}
}
```

### `frontend/src/pages/AssessmentPage.jsx`

```jsx
import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { useIntakeStore } from "@/pages/IntakeStore";
import SVIGauge from "@/components/SVIGauge";
import { useApp } from "@/context/AppContext";
import { speakText, stopSpeaking } from "@/lib/voice";
import { ScrollText, HeartHandshake, Info, Volume2, Square } from "lucide-react";

export default function AssessmentPage() {
    const nav = useNavigate();
    const s = useIntakeStore();
    const { lang } = useApp();
    const [speaking, setSpeaking] = React.useState(false);
    const a = s.assessment;
    if (!a) {
        return (
            <MobileFrame showBack>
                <div className="p-6 text-center text-muted-foreground">No assessment yet. Please complete intake.</div>
            </MobileFrame>
        );
    }

    const whatMeans = {
        Critical: "This signals an urgent risk. Please call 14566 immediately — we will connect a senior counsellor and share your case with law enforcement.",
        High: "Your situation needs urgent attention. We strongly recommend speaking to a counsellor today and keeping proof safe.",
        Moderate: "There is clear distress. A counsellor review and formal complaint draft will help you move forward safely.",
        Low: "Your account is logged. We can still help you file a complaint and connect with support services if things escalate.",
    }[a.level];

    const listen = () => {
        if (speaking) {
            stopSpeaking();
            setSpeaking(false);
            return;
        }
        const factorsText = (a.factors || []).map((f) => f.label).join(", ");
        const script = `Your assessment: Severe Vulnerability Index ${Math.round(a.svi)}, level ${a.level}. Top factors: ${factorsText}. ${whatMeans}`;
        if (speakText(script, lang || "en")) setSpeaking(true);
    };

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 4 of 4 · Assessment</div>
                <div className="flex items-center justify-between">
                    <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Your Assessment</h2>
                    <button
                        data-testid="listen-assessment"
                        onClick={listen}
                        className={`press flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${speaking ? "bg-deepred text-white" : "bg-olive text-white"}`}
                    >
                        {speaking ? <Square size={12}/> : <Volume2 size={12}/>} {speaking ? "Stop" : "Listen"}
                    </button>
                </div>
                <div className="hindi text-sm text-brown">आपका आकलन</div>

                <div className="mt-4 bg-white border border-sand rounded-[20px] p-5 shadow-sm">
                    <SVIGauge score={a.svi} />
                    <div className="text-[11px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                        <Info size={11} /> Triage, not diagnosis · Case #{s.case_id}
                    </div>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive flex items-center gap-2"><ScrollText size={16} /> Top factors</div>
                    <div className="hindi text-[11px] text-muted-foreground">मुख्य कारक</div>
                    <ul className="mt-2 space-y-2">
                        {(a.factors || []).map((f, i) => (
                            <li key={i} className="flex items-start justify-between gap-3 bg-cream border border-sand rounded-xl p-3">
                                <div>
                                    <div className="text-sm font-semibold text-olive">{f.label}</div>
                                    <div className="text-[11px] text-muted-foreground">{f.detail}</div>
                                </div>
                                <div className="text-[11px] bg-white border border-sand rounded-full px-2 py-0.5 text-brown font-medium whitespace-nowrap">
                                    {f.signal}
                                </div>
                            </li>
                        ))}
                        {(!a.factors || a.factors.length === 0) && (
                            <li className="text-sm text-muted-foreground">No strong distress indicators detected.</li>
                        )}
                    </ul>
                </div>

                <div className="mt-4 bg-olive text-white rounded-[20px] p-5">
                    <div className="font-serif font-bold text-lg">What This Means For You</div>
                    <div className="hindi text-cream/80 text-xs mt-0.5">आपके लिए क्या मायने रखता है</div>
                    <p className="text-sm text-cream/90 mt-2 leading-relaxed">{whatMeans}</p>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive flex items-center gap-2"><HeartHandshake size={16} /> Your Rights (informational)</div>
                    <p className="text-sm text-foreground/85 mt-2">
                        Under the <span className="font-semibold">SC/ST (Prevention of Atrocities) Act, 1989</span>, you are protected against caste-based intimidation, abuse and economic boycott. Legal aid is free under NALSA (Helpline 15100). This information does not replace legal counsel.
                    </p>
                </div>

                <button
                    data-testid="next-steps-btn"
                    onClick={() => nav("/intake/next-steps")}
                    className="press mt-5 w-full bg-gold hover:bg-gold-dark text-white rounded-full py-3.5 font-medium"
                >
                    See Next Steps / अगले कदम
                </button>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/CategoryPage.jsx`

```jsx
import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { intakeStore } from "@/pages/IntakeStore";
import { HandCoins, Shield, Home, UsersRound, HeartCrack, Briefcase } from "lucide-react";

const CATS = [
    { key: "physical", en: "Physical Violence", hi: "शारीरिक हिंसा", Icon: HeartCrack },
    { key: "caste", en: "Caste-based Abuse / Threats", hi: "जाति आधारित दुर्व्यवहार", Icon: Shield },
    { key: "property", en: "Land / Property / Eviction", hi: "भूमि / संपत्ति / बेदखली", Icon: Home },
    { key: "social_boycott", en: "Social Boycott / Economic Harassment", hi: "सामाजिक बहिष्कार", Icon: HandCoins },
    { key: "sexual", en: "Sexual Violence", hi: "यौन हिंसा", Icon: UsersRound },
    { key: "discrimination", en: "Discrimination at Work / School", hi: "कार्यस्थल में भेदभाव", Icon: Briefcase },
];

export default function CategoryPage() {
    const nav = useNavigate();

    const pick = (key) => {
        intakeStore.setField("category", key);
        nav("/intake/consent");
    };

    return (
        <MobileFrame showBack title="Samvedna">
            <div className="px-5 pt-5 pb-24 animate-fade-up">
                <div className="mb-4">
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 1 of 4</div>
                    <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">
                        Choose a Category
                    </h2>
                    <div className="hindi text-sm text-brown">श्रेणी चुनें</div>
                </div>

                <div className="space-y-3">
                    {CATS.map(({ key, en, hi, Icon }) => (
                        <button
                            key={key}
                            data-testid={`cat-${key}`}
                            onClick={() => pick(key)}
                            className="press w-full flex items-center gap-3 bg-white border border-sand rounded-2xl p-4 text-left hover:-translate-y-0.5 transition-transform"
                        >
                            <div className="h-11 w-11 rounded-xl bg-cream border border-sand flex items-center justify-center text-olive">
                                <Icon size={20} />
                            </div>
                            <div className="min-w-0">
                                <div className="font-serif font-bold text-olive leading-tight">{en}</div>
                                <div className="hindi text-[12px] text-muted-foreground">{hi}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/ComplaintPage.jsx`

```jsx
import React, { useEffect, useRef, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { useIntakeStore } from "@/pages/IntakeStore";
import { useParams } from "react-router-dom";
import { api, API } from "@/lib/api";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { saveAs } from "file-saver";
import { Download, FileText, Paperclip, Package, Mail, Trash2 } from "lucide-react";

export default function ComplaintPage() {
    const { caseId: paramCase } = useParams();
    const s = useIntakeStore();
    const caseId = paramCase || s.case_id;
    const [draft, setDraft] = useState(null);
    const [tab, setTab] = useState("english");
    const [attachments, setAttachments] = useState([]);
    const [busy, setBusy] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        if (!caseId) return;
        api.get(`/cases/${caseId}/draft`).then((r) => setDraft(r.data)).catch(() => toast.error("Could not load draft"));
        api.get(`/cases/${caseId}/attachments`).then((r) => setAttachments(r.data)).catch(() => {});
    }, [caseId]);

    const downloadPDF = () => {
        if (!draft) return;
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const text = tab === "english" ? draft.english : draft.english + "\n\n---\n(Hindi version is in the DOCX for proper Devanagari rendering.)";
        const lines = doc.splitTextToSize(text, 520);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(lines, 40, 50);
        doc.save(`Samvedna-Complaint-${caseId}.pdf`);
    };

    const downloadDOCX = async () => {
        if (!draft) return;
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: `Samvedna / संवेदना — Complaint Draft #${caseId}`, heading: HeadingLevel.TITLE }),
                    new Paragraph(""),
                    new Paragraph({ text: "English", heading: HeadingLevel.HEADING_1 }),
                    ...draft.english.split("\n").map((l) => new Paragraph({ children: [new TextRun(l)] })),
                    new Paragraph(""),
                    new Paragraph({ text: "हिंदी", heading: HeadingLevel.HEADING_1 }),
                    ...draft.hindi.split("\n").map((l) => new Paragraph({ children: [new TextRun(l)] })),
                ],
            }],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Samvedna-Complaint-${caseId}.docx`);
    };

    const addAttachments = async (e) => {
        const files = Array.from(e.target.files || []);
        setBusy(true);
        try {
            for (const f of files) {
                if (f.size > 5 * 1024 * 1024) {
                    toast.error(`${f.name} too large (max 5 MB)`);
                    continue;
                }
                const b64 = await new Promise((res) => {
                    const r = new FileReader();
                    r.onloadend = () => res(String(r.result).split(",")[1] || "");
                    r.readAsDataURL(f);
                });
                const r = await api.post(`/cases/${caseId}/attachments`, {
                    filename: f.name,
                    content_type: f.type || "application/octet-stream",
                    data_b64: b64,
                });
                setAttachments((xs) => [...xs, r.data]);
            }
            toast.success("Encrypted & attached");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Upload failed");
        } finally {
            setBusy(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const downloadAttachment = async (att) => {
        try {
            const r = await api.get(`/cases/${caseId}/attachments/${att.id}`);
            const bin = atob(r.data.data_b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            saveAs(new Blob([bytes], { type: r.data.content_type }), r.data.filename);
        } catch {
            toast.error("Could not decrypt attachment");
        }
    };

    const exportPack = async () => {
        try {
            const token = localStorage.getItem("samvedna_token");
            const res = await fetch(`${API}/cases/${caseId}/export`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("export failed");
            const blob = await res.blob();
            saveAs(blob, `Samvedna-${caseId}.zip`);
            toast.success("Evidence pack downloaded");
        } catch {
            toast.error("Export failed");
        }
    };

    const emailLegalAid = () => {
        const subject = encodeURIComponent(`Samvedna Case #${caseId} — Evidence pack enclosed`);
        const body = encodeURIComponent(
            `Namaste,\n\nI am sharing the evidence pack for Samvedna case #${caseId} under the SC/ST (PoA) Act, 1989.\n\n` +
            `Attach the downloaded Samvedna-${caseId}.zip file to this email before sending.\n\n` +
            `Case summary and bilingual complaint draft are inside the zip.\n\nRegards,\nSamvedna / संवेदना`
        );
        window.location.href = `mailto:nalsa-dc@nic.in?cc=&subject=${subject}&body=${body}`;
    };

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Complaint Draft</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Bilingual Draft</h2>
                <div className="hindi text-sm text-brown">शिकायत मसौदा</div>

                {!draft ? (
                    <div className="mt-6 text-muted-foreground text-sm">Generating draft…</div>
                ) : (
                    <>
                        <div className="mt-4 inline-flex bg-white border border-sand rounded-full p-1 text-sm">
                            <button data-testid="draft-tab-en" className={`px-4 py-1.5 rounded-full font-medium ${tab === "english" ? "bg-olive text-white" : "text-brown"}`} onClick={() => setTab("english")}>English</button>
                            <button data-testid="draft-tab-hi" className={`px-4 py-1.5 rounded-full font-medium ${tab === "hindi" ? "bg-olive text-white" : "text-brown"}`} onClick={() => setTab("hindi")}>हिंदी</button>
                        </div>
                        <div className="mt-4 bg-white border border-sand rounded-2xl p-4 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90 max-h-[42vh] overflow-y-auto" data-testid="draft-body">
                            {tab === "english" ? draft.english : draft.hindi}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button data-testid="download-pdf" onClick={downloadPDF} className="press bg-gold hover:bg-gold-dark text-white rounded-full py-3 font-medium flex items-center justify-center gap-2">
                                <Download size={16}/> PDF
                            </button>
                            <button data-testid="download-docx" onClick={downloadDOCX} className="press bg-brown hover:bg-brown/90 text-white rounded-full py-3 font-medium flex items-center justify-center gap-2">
                                <FileText size={16}/> DOCX
                            </button>
                        </div>
                    </>
                )}

                {/* Attachments */}
                <div className="mt-5 bg-white border border-sand rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-serif font-bold text-olive flex items-center gap-2"><Paperclip size={16}/> Proof Attachments</div>
                            <div className="hindi text-[11px] text-muted-foreground">सबूत संलग्न</div>
                        </div>
                        <button
                            data-testid="add-attachment"
                            onClick={() => fileRef.current?.click()}
                            disabled={busy}
                            className="press bg-gold hover:bg-gold-dark text-white rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1"
                        >
                            + Attach
                        </button>
                        <input ref={fileRef} data-testid="attachment-input" type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={addAttachments} className="hidden" />
                    </div>
                    <div className="mt-3 space-y-2">
                        {attachments.map((a) => (
                            <div key={a.id} className="flex items-center gap-2 bg-cream border border-sand rounded-xl p-2 text-sm">
                                <FileText size={14} className="text-olive"/>
                                <div className="flex-1 min-w-0 truncate">{a.filename}</div>
                                <button data-testid={`dl-att-${a.id}`} onClick={() => downloadAttachment(a)} className="press text-xs text-olive underline">Decrypt & Save</button>
                            </div>
                        ))}
                        {attachments.length === 0 && (
                            <div className="text-[11px] text-muted-foreground">No proof attached yet. Add images or PDFs — they're AES-256 encrypted and only decrypted on your or your counsellor's device.</div>
                        )}
                    </div>
                </div>

                {/* Govt Export Pack */}
                <div className="mt-5 bg-olive text-white rounded-[20px] p-5">
                    <div className="font-serif font-bold text-lg flex items-center gap-2"><Package size={18}/> Govt Export Pack</div>
                    <div className="hindi text-cream/80 text-xs mt-0.5">सरकारी सबूत पैक</div>
                    <p className="text-sm text-cream/90 mt-2 leading-relaxed">
                        One tap bundles your bilingual complaint, audio, proof files and metadata into a single zip, ready to email to a legal-aid officer or NHAA desk.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <button data-testid="export-zip-btn" onClick={exportPack} className="press bg-gold hover:bg-gold-dark text-white rounded-full py-2.5 font-medium flex items-center justify-center gap-2">
                            <Download size={16}/> Download .zip
                        </button>
                        <button data-testid="email-handoff-btn" onClick={emailLegalAid} className="press bg-wa text-white rounded-full py-2.5 font-medium flex items-center justify-center gap-2">
                            <Mail size={16}/> Email Handoff
                        </button>
                    </div>
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/ConsentPage.jsx`

```jsx
import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { intakeStore } from "@/pages/IntakeStore";
import { Mic, Keyboard, ShieldCheck } from "lucide-react";

export default function ConsentPage() {
    const nav = useNavigate();
    const pick = (voice) => {
        intakeStore.set({ voice_consent: voice, consent_at: new Date().toISOString() });
        nav("/intake/record");
    };
    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-24 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 2 of 4</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Allow Voice Input</h2>
                <div className="hindi text-sm text-brown">आवाज़ से बताइए</div>

                <div className="mt-5 bg-white border border-sand rounded-[20px] p-5 shadow-sm">
                    <div className="h-12 w-12 rounded-2xl bg-cream border border-sand flex items-center justify-center text-olive">
                        <Mic size={22} />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-olive mt-3">We will listen with care</h3>
                    <p className="text-sm text-foreground/80 mt-1">
                        Your voice helps our AI understand distress signals (pitch tremor, pauses, energy) that text alone can miss.
                        Audio is encrypted at rest and visible only to the assigned counsellor.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-3">
                        <ShieldCheck size={13} className="text-olive" />
                        AES-256 at rest · Role-based access · Audit-logged
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <button
                        data-testid="allow-voice-btn"
                        onClick={() => pick(true)}
                        className="press w-full bg-gold hover:bg-gold-dark text-white rounded-full py-3.5 font-medium flex items-center justify-center gap-2"
                    >
                        <Mic size={18} /> Allow Voice Input / आवाज़ अनुमति दें
                    </button>
                    <button
                        data-testid="type-instead-btn"
                        onClick={() => pick(false)}
                        className="press w-full bg-brown hover:bg-brown/90 text-white rounded-full py-3.5 font-medium flex items-center justify-center gap-2"
                    >
                        <Keyboard size={18} /> Type Instead / लिखकर बताएँ
                    </button>
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/CounsellorDetailPage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { toast } from "sonner";
import SVIGauge from "@/components/SVIGauge";
import CaseTimeline from "@/components/CaseTimeline";
import CaseChat from "@/components/CaseChat";
import { Check, Flag, Megaphone, NotebookPen, Play } from "lucide-react";

export default function CounsellorDetailPage() {
    const { caseId } = useParams();
    const nav = useNavigate();
    const [c, setC] = useState(null);
    const [note, setNote] = useState("");
    const [escalateTarget, setEscalateTarget] = useState("counselling");
    const [busy, setBusy] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);

    const load = () => api.get(`/cases/${caseId}`).then((r) => setC(r.data));

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [caseId]);

    const playAudio = async () => {
        try {
            const r = await api.get(`/cases/${caseId}/audio`);
            if (!r.data.audio_b64) return toast.info("No audio recorded for this case");
            const bin = atob(r.data.audio_b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            const blob = new Blob([bytes], { type: "audio/webm" });
            setAudioUrl(URL.createObjectURL(blob));
            toast.success("Audio decrypted · playing");
        } catch { toast.error("Failed to decrypt audio"); }
    };

    const accept = async () => {
        setBusy(true);
        try { await api.patch(`/cases/${caseId}`, { accept: true, stage: "Verified" }); toast.success("Accepted"); load(); }
        catch { toast.error("Failed"); } finally { setBusy(false); }
    };

    const addNote = async () => {
        if (!note.trim()) return;
        setBusy(true);
        try { await api.patch(`/cases/${caseId}`, { notes: note }); setNote(""); toast.success("Note saved"); load(); }
        catch { toast.error("Failed"); } finally { setBusy(false); }
    };

    const escalate = async () => {
        setBusy(true);
        try { await api.post(`/cases/${caseId}/escalate`, { target: escalateTarget, note: "escalated via portal" }); toast.success("Mock NHAA hand-off logged"); load(); }
        catch { toast.error("Failed"); } finally { setBusy(false); }
    };

    if (!c) return <MobileFrame showBack><div className="p-6">Loading…</div></MobileFrame>;

    return (
        <MobileFrame showBack hideNav>
            <div className="px-5 pt-5 pb-24 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Case #{c.case_id}</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">{c.category}</h2>
                <div className="text-[11px] text-muted-foreground">{c.user_masked} · {new Date(c.created_at).toLocaleString()}</div>

                <div className="mt-4 bg-white border border-sand rounded-[20px] p-4">
                    <SVIGauge score={c.assessment?.svi} />
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive mb-2">Narrative</div>
                    <div className="text-sm text-foreground/85 whitespace-pre-wrap" data-testid="case-narrative">{c.narrative}</div>
                    {c.voice_consent && (
                        <div className="mt-3">
                            <button
                                data-testid="play-audio-btn"
                                onClick={playAudio}
                                className="press inline-flex items-center gap-2 bg-olive text-white rounded-full px-4 py-2 text-xs font-medium"
                            >
                                <Play size={14}/> Play Encrypted Audio
                            </button>
                            {audioUrl && (
                                <audio controls src={audioUrl} className="mt-3 w-full" data-testid="audio-player" />
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive mb-2">SVI Factors</div>
                    <ul className="space-y-2">
                        {(c.assessment?.factors || []).map((f, i) => (
                            <li key={i} className="text-sm bg-cream border border-sand rounded-xl p-2">
                                <span className="font-semibold text-olive">{f.label}</span> · <span className="text-muted-foreground">{f.detail}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive mb-2">Timeline</div>
                    <CaseTimeline completed={c.stages_completed} current={c.stage} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button data-testid="accept-case" onClick={accept} disabled={busy} className="press bg-olive text-white rounded-full py-3 font-medium flex items-center justify-center gap-2">
                        <Check size={16}/> Accept
                    </button>
                    <button data-testid="open-case-draft" onClick={() => nav(`/complaint/${c.case_id}`)} className="press border border-sand bg-white text-brown rounded-full py-3 font-medium">Open Draft</button>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive flex items-center gap-2"><NotebookPen size={16}/> Add Note</div>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} data-testid="counsellor-note" className="mt-2 w-full bg-cream border border-sand rounded-xl p-3 text-sm outline-none focus:border-olive" placeholder="Internal note…" />
                    <button data-testid="save-note-btn" onClick={addNote} disabled={busy} className="press mt-2 bg-gold hover:bg-gold-dark text-white rounded-full py-2 px-4 text-sm">Save Note</button>
                    <div className="mt-3 space-y-2">
                        {(c.notes || []).map((n, i) => (
                            <div key={i} className="text-[12px] bg-cream border border-sand rounded-xl p-2">
                                <div className="text-muted-foreground text-[10px]">{new Date(n.at).toLocaleString()}</div>
                                {n.text}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="font-serif font-bold text-olive flex items-center gap-2"><Flag size={16}/> Escalate (Mock NHAA)</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {["law_enforcement", "counselling", "rehab"].map((k) => (
                            <button key={k} data-testid={`escalate-target-${k}`} onClick={() => setEscalateTarget(k)} className={`press px-3 py-1.5 rounded-full text-xs border ${escalateTarget === k ? "bg-olive text-white border-olive" : "bg-cream border-sand text-brown"}`}>
                                {k.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                    <button data-testid="escalate-btn" onClick={escalate} disabled={busy} className="press mt-3 bg-deepred text-white rounded-full py-2.5 px-5 text-sm font-medium flex items-center gap-2">
                        <Megaphone size={16}/> Submit Hand-off
                    </button>
                </div>

                <div className="mt-4">
                    <CaseChat caseId={c.case_id} />
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/CounsellorLoginPage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import OTPInput from "@/components/OTPInput";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function CounsellorLoginPage() {
    const { login, user } = useApp();
    const nav = useNavigate();
    const [email, setEmail] = useState("priya.counsellor@samvedna.in");
    const [session, setSession] = useState(null);
    const [otp, setOtp] = useState("");
    const [resendIn, setResendIn] = useState(0);
    const [busy, setBusy] = useState(false);
    const [dev, setDev] = useState("");

    useEffect(() => {
        if (user && (user.role === "counsellor" || user.role === "supervisor")) nav("/counsellor");
    }, [user, nav]);

    useEffect(() => {
        if (!resendIn) return;
        const id = setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
        return () => clearInterval(id);
    }, [resendIn]);

    const sendOtp = async () => {
        setBusy(true);
        try {
            const r = await api.post("/counsellor/request-otp", { email });
            setSession(r.data.session_id);
            setResendIn(30);
            if (r.data.dev_mode) {
                setDev(r.data.dev_email_otp);
                toast.success(`DEV MODE · OTP ${r.data.dev_email_otp}`, { duration: 10000 });
            }
        } catch (e) {
            toast.error(e.response?.data?.detail || "Not registered");
        } finally {
            setBusy(false);
        }
    };

    const verify = async () => {
        setBusy(true);
        try {
            const r = await api.post("/counsellor/verify", { session_id: session, code: otp });
            await login(r.data.token, r.data.user);
            nav("/counsellor");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Invalid OTP");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="samvedna-shell">
            <div className="frame cream-texture flex flex-col px-5 py-10">
                <div className="flex items-center gap-2 text-olive">
                    <Shield size={18}/> <span className="font-serif font-bold">Counsellor Portal</span>
                </div>
                <h1 className="font-serif font-black text-3xl text-olive leading-tight mt-6">Secure Access</h1>
                <div className="hindi text-sm text-brown">काउंसलर प्रवेश</div>

                {!session ? (
                    <>
                        <label className="mt-6 text-[13px] font-semibold text-olive">Email</label>
                        <input
                            data-testid="counsellor-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 bg-white border border-sand rounded-xl px-4 py-3 outline-none focus:border-olive"
                        />
                        <button
                            data-testid="counsellor-send-otp"
                            disabled={busy}
                            onClick={sendOtp}
                            className="press mt-4 bg-gold hover:bg-gold-dark text-white rounded-full py-3 font-medium disabled:opacity-60"
                        >
                            {busy ? "Sending…" : "Send OTP"}
                        </button>
                        <div className="mt-6 text-[11px] text-muted-foreground">
                            Demo accounts (after seed): priya.counsellor@samvedna.in · verma.supervisor@samvedna.in
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mt-6 text-sm text-muted-foreground">Enter the 4-digit code sent to {email}</div>
                        <div className="mt-3"><OTPInput value={otp} onChange={setOtp} testIdPrefix="counsellor-otp" /></div>
                        {dev && (
                            <div className="text-[11px] text-brown mt-2 bg-cream border border-sand rounded-xl p-2 text-center">
                                DEV OTP: <span data-testid="counsellor-dev-otp" className="font-bold">{dev}</span>
                            </div>
                        )}
                        <button
                            data-testid="counsellor-verify"
                            disabled={busy}
                            onClick={verify}
                            className="press mt-4 bg-gold hover:bg-gold-dark text-white rounded-full py-3 font-medium disabled:opacity-60"
                        >
                            Verify & Enter
                        </button>
                        <button
                            disabled={resendIn > 0}
                            onClick={sendOtp}
                            className="mt-3 text-sm text-brown disabled:opacity-50"
                        >
                            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
```

### `frontend/src/pages/CounsellorQueuePage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { levelColor } from "@/components/SVIGauge";
import { AlertTriangle, Headphones, LogOut, Users, Bell, BellRing } from "lucide-react";
import { enablePush, isPushEnabled, testPush } from "@/lib/push";
import { toast } from "sonner";

export default function CounsellorQueuePage() {
    const { user, logout } = useApp();
    const nav = useNavigate();
    const [cases, setCases] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState("all"); // all | Critical | High | Moderate | Low
    const [pushOn, setPushOn] = useState(false);

    useEffect(() => {
        api.get("/counsellor/queue").then((r) => setCases(r.data)).catch(() => {});
        api.get("/counsellor/alerts").then((r) => setAlerts(r.data)).catch(() => {});
        isPushEnabled().then(setPushOn);
    }, []);

    const togglePush = async () => {
        try {
            if (pushOn) {
                const r = await testPush();
                toast.success(`Test push sent to ${r.sent}/${r.subs} subscription(s)`);
            } else {
                await enablePush();
                setPushOn(true);
                toast.success("Push alerts enabled · critical cases will notify you");
            }
        } catch (e) {
            toast.error(e.message || "Push setup failed");
        }
    };

    const list = filter === "all" ? cases : cases.filter((c) => c.assessment?.level === filter);

    return (
        <MobileFrame hideNav>
            <div className="px-5 pt-5 pb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">{user?.role?.toUpperCase()}</div>
                        <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Priority Queue</h2>
                        <div className="hindi text-sm text-brown">प्राथमिकता सूची</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button data-testid="toggle-push" onClick={togglePush} className={`press text-xs rounded-full px-3 py-1.5 flex items-center gap-1 ${pushOn ? "bg-wa text-white" : "bg-white border border-sand text-brown"}`}>
                            {pushOn ? <BellRing size={13}/> : <Bell size={13}/>}
                            {pushOn ? "Test Alert" : "Enable Alerts"}
                        </button>
                        {user?.role === "supervisor" && (
                            <>
                                <button data-testid="go-impact" onClick={() => nav("/impact")} className="press text-xs bg-brown text-white rounded-full px-3 py-1.5">Impact</button>
                                <button data-testid="go-supervisor" onClick={() => nav("/supervisor")} className="press text-xs bg-olive text-white rounded-full px-3 py-1.5">Audit Log</button>
                            </>
                        )}
                        <button data-testid="go-operator" onClick={() => nav("/operator")} className="press text-xs border border-sand bg-white rounded-full px-3 py-1.5 text-brown flex items-center gap-1">
                            <Headphones size={13}/> Operator
                        </button>
                        <button data-testid="counsellor-logout" onClick={() => { logout(); nav("/counsellor"); }} className="press h-8 w-8 rounded-full bg-white border border-sand flex items-center justify-center text-brown">
                            <LogOut size={14}/>
                        </button>
                    </div>
                </div>

                {alerts.length > 0 && (
                    <div className="mt-4 bg-deepred text-white rounded-2xl p-4 flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <div className="text-sm">
                            <div className="font-semibold">Critical alerts</div>
                            <div className="text-white/80 text-xs">{alerts.slice(0, 3).map((a) => a.message).join(" · ")}</div>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex gap-2 overflow-x-auto">
                    {["all", "Critical", "High", "Moderate", "Low"].map((f) => (
                        <button
                            key={f}
                            data-testid={`q-filter-${f}`}
                            onClick={() => setFilter(f)}
                            className={`press px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                                filter === f ? "bg-olive text-white border-olive" : "bg-white text-brown border-sand"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Users size={13}/> {list.length} cases · sorted by SVI
                </div>

                <div className="mt-3 space-y-3">
                    {list.map((c) => (
                        <button
                            key={c.case_id}
                            data-testid={`q-row-${c.case_id}`}
                            onClick={() => nav(`/counsellor/${c.case_id}`)}
                            className="press w-full text-left bg-white border border-sand rounded-2xl p-4 flex items-center gap-3"
                        >
                            <div
                                className="h-12 w-12 rounded-xl text-white flex items-center justify-center font-serif font-bold"
                                style={{ backgroundColor: levelColor(c.assessment?.svi || 0).bg }}
                            >
                                {Math.round(c.assessment?.svi || 0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif font-bold text-olive">#{c.case_id} · {c.assessment?.level}</div>
                                <div className="text-[11px] text-muted-foreground">{c.category} · {c.user_masked} · {c.stage}</div>
                                <div className="text-[12px] text-foreground/80 line-clamp-1 mt-1">{c.narrative}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/DraftsPage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

export default function DraftsPage() {
    const [cases, setCases] = useState([]);
    const nav = useNavigate();
    useEffect(() => { api.get("/cases").then((r) => setCases(r.data)); }, []);
    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Drafted Complaints</h2>
                <div className="hindi text-sm text-brown">शिकायत मसौदे</div>
                <div className="mt-4 space-y-3">
                    {cases.map((c) => (
                        <button
                            key={c.case_id}
                            onClick={() => nav(`/complaint/${c.case_id}`)}
                            className="press w-full text-left bg-white border border-sand rounded-2xl p-4 flex items-center gap-3"
                            data-testid={`draft-row-${c.case_id}`}
                        >
                            <div className="h-11 w-11 rounded-xl bg-olive text-white flex items-center justify-center">
                                <FileText size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif font-bold text-olive">#{c.case_id}</div>
                                <div className="text-[12px] text-muted-foreground truncate">{c.narrative}</div>
                            </div>
                        </button>
                    ))}
                    {cases.length === 0 && (
                        <div className="text-sm text-muted-foreground bg-white border border-sand rounded-2xl p-5 text-center">
                            No drafts yet.
                        </div>
                    )}
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/HistoryPage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { levelColor } from "@/components/SVIGauge";
import { ChevronRight } from "lucide-react";

export default function HistoryPage() {
    const [cases, setCases] = useState([]);
    const nav = useNavigate();
    useEffect(() => {
        api.get("/cases").then((r) => setCases(r.data)).catch(() => {});
    }, []);
    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Your Cases</h2>
                <div className="hindi text-sm text-brown">आपके केस</div>
                {cases.length === 0 && (
                    <div className="mt-6 text-sm text-muted-foreground bg-white border border-sand rounded-2xl p-5 text-center">
                        No cases yet. Start by describing a new problem.
                    </div>
                )}
                <div className="mt-4 space-y-3">
                    {cases.map((c) => (
                        <button
                            key={c.case_id}
                            data-testid={`case-row-${c.case_id}`}
                            onClick={() => nav(`/timeline/${c.case_id}`)}
                            className="press w-full text-left bg-white border border-sand rounded-2xl p-4 flex items-center gap-3"
                        >
                            <div
                                className="h-11 w-11 rounded-xl text-white flex items-center justify-center font-serif font-bold text-sm"
                                style={{ backgroundColor: levelColor(c.assessment?.svi || 0).bg }}
                            >
                                {Math.round(c.assessment?.svi || 0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif font-bold text-olive truncate">#{c.case_id} · {c.stage}</div>
                                <div className="text-[12px] text-muted-foreground truncate">{c.narrative}</div>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                        </button>
                    ))}
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/HomePage.jsx`

```jsx
import React from "react";
import MobileFrame from "@/components/MobileFrame";
import HelplineBanner from "@/components/HelplineBanner";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowRight, ClipboardList, Users, FileText, History, Mic } from "lucide-react";

const Tile = ({ Icon, label, hi, to, testid }) => {
    const nav = useNavigate();
    return (
        <button
            data-testid={testid}
            onClick={() => nav(to)}
            className="press text-left bg-white border border-sand rounded-2xl p-4 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform"
        >
            <div className="h-10 w-10 rounded-xl bg-cream border border-sand flex items-center justify-center text-olive">
                <Icon size={18} />
            </div>
            <div>
                <div className="font-serif font-bold text-olive leading-tight">{label}</div>
                <div className="hindi text-[11px] text-muted-foreground">{hi}</div>
            </div>
        </button>
    );
};

export default function HomePage() {
    const nav = useNavigate();
    const { user } = useApp();

    return (
        <MobileFrame>
            <div className="px-5 pt-4 pb-24">
                <HelplineBanner />
                <div className="mt-5 bg-olive text-white rounded-[20px] p-5 shadow-md relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="hindi text-cream/70 text-xs font-medium">नई समस्या बताएँ</div>
                        <div className="font-serif font-black text-2xl mt-1 leading-tight">
                            Describe a New Problem
                        </div>
                        <div className="text-sm text-cream/80 mt-1 max-w-[280px]">
                            Share what happened — voice or text. Our AI will triage urgency and guide you to the right help.
                        </div>
                        <button
                            data-testid="start-intake-btn"
                            onClick={() => nav("/intake/category")}
                            className="press mt-4 inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white rounded-full py-3 px-5 font-medium transition-colors"
                        >
                            <Mic size={16} /> Start Now · शुरू करें <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="font-serif font-bold text-olive text-lg">Your Toolkit</div>
                    <div className="hindi text-xs text-muted-foreground">आपका टूलकिट</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <Tile Icon={ClipboardList} label="Case Timeline" hi="केस टाइमलाइन" to="/history" testid="tile-timeline" />
                    <Tile Icon={Users} label="Nearby Help" hi="नज़दीकी मदद" to="/nearby" testid="tile-nearby" />
                    <Tile Icon={FileText} label="Drafted Complaints" hi="शिकायत मसौदे" to="/drafts" testid="tile-drafts" />
                    <Tile Icon={History} label="Query History" hi="पूर्व पूछताछ" to="/history" testid="tile-history" />
                </div>

                <div className="mt-6 bg-white border border-sand rounded-2xl p-4 text-[12px] text-muted-foreground">
                    Logged in as <span className="text-foreground font-medium">{user?.email}</span>
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/ImpactPage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, AlertOctagon, Timer, Flame } from "lucide-react";

const SVI_COLORS = { Low: "#25C05F", Moderate: "#B8862B", High: "#C4694A", Critical: "#8B2A1A" };

export default function ImpactPage() {
    const [data, setData] = useState(null);
    useEffect(() => {
        api.get("/supervisor/impact?days=7").then((r) => setData(r.data));
    }, []);

    if (!data) return <MobileFrame showBack hideNav><div className="p-6">Loading impact…</div></MobileFrame>;

    return (
        <MobileFrame showBack hideNav>
            <div className="px-5 pt-5 pb-10 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Supervisor</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Impact Dashboard</h2>
                <div className="hindi text-sm text-brown">सप्ताहिक रिपोर्ट · last 7 days</div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Kpi Icon={TrendingUp} label="Total cases" sub="पिछले ७ दिन" value={data.total_cases} color="#4A5A1E" testid="kpi-total"/>
                    <Kpi Icon={AlertOctagon} label="Critical" sub="तत्काल" value={data.critical_cases} color="#8B2A1A" testid="kpi-critical"/>
                    <Kpi Icon={Flame} label="Escalations" sub="भेजे गए" value={data.total_escalations} color="#C4694A" testid="kpi-esc"/>
                    <Kpi Icon={Timer} label="Avg time-to-escalate" sub="मिनट" value={data.avg_time_to_escalation_min ?? "—"} suffix={data.avg_time_to_escalation_min != null ? " min" : ""} color="#7A4A12" testid="kpi-tte"/>
                </div>

                <Card title="Daily case volume" hi="रोज़ाना मामले" testid="chart-daily">
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={data.daily}>
                            <CartesianGrid stroke="#D3C7AC" strokeDasharray="3 3"/>
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7A4A12" }} tickFormatter={(d) => d.slice(5)} />
                            <YAxis tick={{ fontSize: 10, fill: "#7A4A12" }} allowDecimals={false}/>
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, borderColor: "#D3C7AC" }}/>
                            <Bar dataKey="count" fill="#4A5A1E" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="SVI distribution" hi="गंभीरता वितरण" testid="chart-svi">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={data.svi_distribution} dataKey="count" nameKey="level" outerRadius={70} innerRadius={38} paddingAngle={2}>
                                {data.svi_distribution.map((e, i) => <Cell key={i} fill={SVI_COLORS[e.level] || "#D3C7AC"}/>)}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, borderColor: "#D3C7AC" }}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 mt-2">
                        {data.svi_distribution.map((e) => (
                            <div key={e.level} className="flex items-center gap-1 text-[11px] text-brown">
                                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SVI_COLORS[e.level] }}/>
                                {e.level} · {e.count}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Case categories" hi="श्रेणीवार" testid="chart-categories">
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart layout="vertical" data={data.categories}>
                            <CartesianGrid stroke="#D3C7AC" strokeDasharray="3 3"/>
                            <XAxis type="number" tick={{ fontSize: 10, fill: "#7A4A12" }} allowDecimals={false}/>
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#7A4A12" }} width={100}/>
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, borderColor: "#D3C7AC" }}/>
                            <Bar dataKey="count" fill="#B8862B" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </MobileFrame>
    );
}

function Kpi({ Icon, label, sub, value, color, suffix = "", testid }) {
    return (
        <div className="bg-white border border-sand rounded-2xl p-4" data-testid={testid}>
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                <Icon size={16}/>
            </div>
            <div className="font-serif font-black text-2xl text-olive mt-2 leading-none">{value}{suffix}</div>
            <div className="text-[11px] text-brown font-medium mt-1">{label}</div>
            <div className="hindi text-[10px] text-muted-foreground">{sub}</div>
        </div>
    );
}

function Card({ title, hi, children, testid }) {
    return (
        <div className="mt-4 bg-white border border-sand rounded-2xl p-4" data-testid={testid}>
            <div className="font-serif font-bold text-olive">{title}</div>
            <div className="hindi text-[11px] text-muted-foreground">{hi}</div>
            <div className="mt-2">{children}</div>
        </div>
    );
}
```

### `frontend/src/pages/IntakePage.jsx`

```jsx
import React, { useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { intakeStore, useIntakeStore } from "@/pages/IntakeStore";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useApp } from "@/context/AppContext";
import { ArrowRight } from "lucide-react";

export default function IntakePage() {
    const nav = useNavigate();
    const { lang } = useApp();
    const s = useIntakeStore();
    const [text, setText] = useState(s.narrative || "");

    const onVoiceResult = ({ transcript, metrics, audio_b64 }) => {
        setText((t) => (t ? t + " " + transcript : transcript));
        intakeStore.set({ voice_metrics: metrics, audio_b64, language: lang || "en" });
    };

    const next = () => {
        intakeStore.set({ narrative: text, language: lang || "en" });
        nav("/intake/verify");
    };

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-24 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 2 of 4</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Tell us what happened</h2>
                <div className="hindi text-sm text-brown">हमें बताएँ</div>

                {s.voice_consent && (
                    <div className="mt-5">
                        <VoiceRecorder language={lang || "en"} onResult={onVoiceResult} />
                    </div>
                )}

                <div className="mt-5">
                    <label className="text-[13px] font-semibold text-olive">
                        Write or edit the narrative
                    </label>
                    <textarea
                        data-testid="narrative-textarea"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                        placeholder="Type what happened, in your own words..."
                        className="mt-1 w-full bg-white border border-sand rounded-2xl px-4 py-3 outline-none focus:border-olive"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <input
                        data-testid="input-timeline"
                        placeholder="When did it happen?"
                        value={s.timeline}
                        onChange={(e) => intakeStore.setField("timeline", e.target.value)}
                        className="bg-white border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-olive"
                    />
                    <input
                        data-testid="input-location"
                        placeholder="Where?"
                        value={s.location}
                        onChange={(e) => intakeStore.setField("location", e.target.value)}
                        className="bg-white border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-olive"
                    />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                        data-testid="toggle-threat"
                        onClick={() => intakeStore.setField("threat_present", !s.threat_present)}
                        className={`press border rounded-xl py-2.5 px-4 text-sm font-medium ${s.threat_present ? "bg-deepred text-white border-deepred" : "bg-white border-sand text-brown"}`}
                    >
                        Threat is active · धमकी जारी है
                    </button>
                    <button
                        data-testid="toggle-isolation"
                        onClick={() => intakeStore.setField("isolation", !s.isolation)}
                        className={`press border rounded-xl py-2.5 px-4 text-sm font-medium ${s.isolation ? "bg-terracotta text-white border-terracotta" : "bg-white border-sand text-brown"}`}
                    >
                        I feel isolated · अकेला
                    </button>
                </div>

                <button
                    data-testid="intake-next-btn"
                    onClick={next}
                    disabled={!text || text.length < 10}
                    className="press mt-6 w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white rounded-full py-3.5 font-medium flex items-center justify-center gap-2"
                >
                    Continue / Aage Badhein <ArrowRight size={16} />
                </button>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/IntakeStore.js`

```javascript
// Simple global store for the multi-step intake flow using React state hook pattern
import { useSyncExternalStore } from "react";

const initial = {
    category: null,
    narrative: "",
    voice_metrics: null,
    audio_b64: null,
    language: "en",
    voice_consent: false,
    timeline: "",
    location: "",
    proof_files: [],
    threat_present: false,
    isolation: false,
    assessment: null,
    case_id: null,
};

let state = { ...initial };
const listeners = new Set();

function emit() {
    listeners.forEach((l) => l());
}

export const intakeStore = {
    get: () => state,
    set: (patch) => { state = { ...state, ...patch }; emit(); },
    setField: (k, v) => { state = { ...state, [k]: v }; emit(); },
    reset: () => { state = { ...initial }; emit(); },
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
};

export function useIntakeStore(selector = (s) => s) {
    return useSyncExternalStore(
        intakeStore.subscribe,
        () => selector(state),
        () => selector(initial),
    );
}

// Convenience hook: returns the mutators (never changes identity)
export const useIntakeActions = () => ({
    set: intakeStore.set,
    setField: intakeStore.setField,
    reset: intakeStore.reset,
});
```

### `frontend/src/pages/LanguagePage.jsx`

```jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { LANGUAGES } from "@/lib/i18n";
import { Globe2, ShieldCheck, Volume2 } from "lucide-react";

export default function LanguagePage() {
    const { lang, setLang } = useApp();
    const nav = useNavigate();

    const choose = (code) => {
        setLang(code);
        nav("/login");
    };

    const speak = (text) => {
        try {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "en-IN";
            window.speechSynthesis.speak(u);
        } catch {}
    };

    return (
        <div className="samvedna-shell">
            <div className="frame cream-texture flex flex-col">
                <div className="px-5 pt-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-serif font-black text-3xl text-olive leading-tight">
                                Samvedna
                            </h1>
                            <div className="hindi text-brown font-serif text-xl -mt-1">संवेदना</div>
                            <div className="text-xs text-muted-foreground mt-1 font-medium">
                                NHAA · National Helpline Against Atrocities · 14566
                            </div>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-olive text-cream flex items-center justify-center shadow-md">
                            <Globe2 size={26} />
                        </div>
                    </div>
                </div>

                <div className="px-5">
                    <div className="bg-olive text-white rounded-[20px] p-5 shadow-md">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="font-serif font-bold text-xl leading-snug">
                                    Choose your language
                                </div>
                                <div className="hindi text-cream/80 text-sm mt-1">अपनी भाषा चुनें</div>
                            </div>
                            <button
                                data-testid="audio-help"
                                onClick={() => speak("Choose your language. अपनी भाषा चुनें")}
                                className="press h-10 w-10 rounded-full bg-white/15 flex items-center justify-center ring-1 ring-white/20"
                            >
                                <Volume2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-5 grid grid-cols-2 gap-3">
                    {LANGUAGES.map((l) => (
                        <button
                            key={l.code}
                            data-testid={`choose-lang-${l.code}`}
                            onClick={() => choose(l.code)}
                            className={`press text-left bg-white border rounded-2xl p-4 transition-all hover:-translate-y-0.5 ${
                                lang === l.code ? "border-olive ring-2 ring-olive/20" : "border-sand"
                            }`}
                        >
                            <div className="font-serif font-bold text-lg text-olive">{l.native}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{l.label}</div>
                        </button>
                    ))}
                </div>

                <div className="px-5 pb-8 mt-auto">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <ShieldCheck size={14} className="text-olive" />
                        <span>Minimal data · AES-256 encryption at rest · Role-based access</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

### `frontend/src/pages/LoginPage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import OTPInput from "@/components/OTPInput";
import { Volume2, MessageSquare, ShieldCheck, Mail, Smartphone } from "lucide-react";

export default function LoginPage() {
    const { lang, login, t } = useApp();
    const nav = useNavigate();
    const [step, setStep] = useState("details"); // details | mobile_otp | email_otp
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [channel, setChannel] = useState("sms");
    const [session, setSession] = useState(null);
    const [mobileOtp, setMobileOtp] = useState("");
    const [emailOtp, setEmailOtp] = useState("");
    const [resendIn, setResendIn] = useState(0);
    const [busy, setBusy] = useState(false);
    const [devInfo, setDevInfo] = useState(null);

    useEffect(() => {
        if (!resendIn) return;
        const id = setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
        return () => clearInterval(id);
    }, [resendIn]);

    const speak = (txt) => {
        try {
            const u = new SpeechSynthesisUtterance(txt);
            u.lang = lang === "hi" ? "hi-IN" : "en-IN";
            window.speechSynthesis.speak(u);
        } catch {}
    };

    const sendOTP = async () => {
        if (!phone.match(/^\+?\d{10,15}$/)) return toast.error("Enter a valid phone with country code, e.g. +9199xxxxxxxx");
        if (!email.includes("@")) return toast.error("Enter a valid email");
        setBusy(true);
        try {
            const r = await api.post("/auth/request-otp", { phone, email, channel, language: lang || "en" });
            setSession(r.data.session_id);
            setStep("mobile_otp");
            setResendIn(30);
            if (r.data.dev_mode) {
                setDevInfo({ m: r.data.dev_mobile_otp, e: r.data.dev_email_otp });
                toast.success(`DEV MODE: Mobile OTP ${r.data.dev_mobile_otp} · Email OTP ${r.data.dev_email_otp}`, { duration: 10000 });
            } else {
                toast.success("OTPs sent to your mobile and email");
            }
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to send OTP");
        } finally {
            setBusy(false);
        }
    };

    const resend = async () => {
        setResendIn(30);
        await sendOTP();
    };

    const verifyMobile = async () => {
        if (mobileOtp.length !== 4) return toast.error("Enter 4-digit OTP");
        setBusy(true);
        try {
            await api.post("/auth/verify-mobile", { session_id: session, code: mobileOtp });
            setStep("email_otp");
            setResendIn(30);
            toast.success("Mobile verified · now verify email");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Invalid OTP");
        } finally {
            setBusy(false);
        }
    };

    const verifyEmail = async () => {
        if (emailOtp.length !== 4) return toast.error("Enter 4-digit OTP");
        setBusy(true);
        try {
            const r = await api.post("/auth/verify-email", { session_id: session, code: emailOtp });
            await login(r.data.token, r.data.user);
            toast.success("Welcome to Samvedna");
            nav("/home");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Invalid OTP");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="samvedna-shell">
            <div className="frame cream-texture flex flex-col">
                <div className="px-5 pt-10 pb-6">
                    <h1 className="font-serif font-black text-3xl text-olive leading-tight">
                        Secure Login
                    </h1>
                    <div className="hindi text-brown font-serif text-lg -mt-1">सुरक्षित लॉगिन</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">
                        Two-step verification · Mobile + Email
                    </div>
                </div>

                <div className="px-5 flex-1">
                    {step === "details" && (
                        <div className="animate-fade-up space-y-4">
                            <div>
                                <label className="text-[13px] font-semibold text-olive flex items-center gap-2">
                                    <Smartphone size={14} /> Mobile Number
                                </label>
                                <input
                                    data-testid="input-phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+9199xxxxxxxx"
                                    className="mt-1 w-full bg-white border border-sand rounded-xl px-4 py-3 font-medium outline-none focus:border-olive"
                                />
                            </div>
                            <div>
                                <label className="text-[13px] font-semibold text-olive flex items-center gap-2">
                                    <Mail size={14} /> Email Address
                                </label>
                                <input
                                    data-testid="input-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="mt-1 w-full bg-white border border-sand rounded-xl px-4 py-3 font-medium outline-none focus:border-olive"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    data-testid="channel-sms"
                                    onClick={() => setChannel("sms")}
                                    className={`press border rounded-xl py-3 px-4 text-sm font-medium ${
                                        channel === "sms" ? "bg-olive text-white border-olive" : "bg-white border-sand text-brown"
                                    }`}
                                >
                                    SMS OTP
                                </button>
                                <button
                                    data-testid="channel-whatsapp"
                                    onClick={() => setChannel("whatsapp")}
                                    className={`press border rounded-xl py-3 px-4 text-sm font-medium flex items-center justify-center gap-1 ${
                                        channel === "whatsapp" ? "bg-wa text-white border-wa" : "bg-white border-sand text-brown"
                                    }`}
                                >
                                    <MessageSquare size={14} /> WhatsApp
                                </button>
                            </div>

                            <button
                                data-testid="send-otp-btn"
                                disabled={busy}
                                onClick={sendOTP}
                                className="press w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-white rounded-full py-3.5 font-medium"
                            >
                                {busy ? "Sending…" : "Send OTP / OTP भेजें"}
                            </button>
                        </div>
                    )}

                    {step === "mobile_otp" && (
                        <div className="animate-fade-up space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-serif font-bold text-lg text-olive">Verify Mobile</div>
                                    <div className="hindi text-xs text-muted-foreground">मोबाइल सत्यापित करें</div>
                                </div>
                                <button
                                    data-testid="audio-help-mobile"
                                    onClick={() => speak(t("enter_mobile_otp"))}
                                    className="press h-10 w-10 rounded-full bg-olive text-white flex items-center justify-center"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                            <div className="text-sm text-muted-foreground">{t("enter_mobile_otp")}</div>
                            <OTPInput value={mobileOtp} onChange={setMobileOtp} testIdPrefix="otp-mobile" />
                            {devInfo && (
                                <div className="text-[11px] text-brown bg-cream border border-sand rounded-xl p-2 text-center">
                                    DEV · Mobile OTP: <span data-testid="dev-mobile-otp" className="font-bold">{devInfo.m}</span>
                                </div>
                            )}
                            <button
                                data-testid="verify-mobile-btn"
                                disabled={busy}
                                onClick={verifyMobile}
                                className="press w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-white rounded-full py-3.5 font-medium"
                            >
                                Verify / सत्यापित करें
                            </button>
                            <button
                                data-testid="resend-mobile"
                                disabled={resendIn > 0}
                                onClick={resend}
                                className="w-full text-sm text-brown disabled:opacity-50"
                            >
                                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                            </button>
                        </div>
                    )}

                    {step === "email_otp" && (
                        <div className="animate-fade-up space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-serif font-bold text-lg text-olive">Verify Email</div>
                                    <div className="hindi text-xs text-muted-foreground">ईमेल सत्यापित करें</div>
                                </div>
                                <button
                                    onClick={() => speak(t("enter_email_otp"))}
                                    className="press h-10 w-10 rounded-full bg-olive text-white flex items-center justify-center"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                            <div className="text-sm text-muted-foreground">{t("enter_email_otp")}</div>
                            <OTPInput value={emailOtp} onChange={setEmailOtp} testIdPrefix="otp-email" />
                            {devInfo && (
                                <div className="text-[11px] text-brown bg-cream border border-sand rounded-xl p-2 text-center">
                                    DEV · Email OTP: <span data-testid="dev-email-otp" className="font-bold">{devInfo.e}</span>
                                </div>
                            )}
                            <button
                                data-testid="verify-email-btn"
                                disabled={busy}
                                onClick={verifyEmail}
                                className="press w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-white rounded-full py-3.5 font-medium"
                            >
                                Verify & Enter / प्रवेश
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-5 py-5">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <ShieldCheck size={14} className="text-olive" />
                        <span>Hashed OTP · 5-min expiry · 3 attempts max · Rate-limited</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

### `frontend/src/pages/NearbyMapPage.jsx`

```jsx
import React, { useEffect, useMemo, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { MapPin, Phone, Navigation, Users, Scale, Heart } from "lucide-react";

const TYPES = {
    counsellor: { Icon: Users, label: "Counsellor", color: "#4A5A1E" },
    legal_aid: { Icon: Scale, label: "Legal Aid", color: "#7A4A12" },
    rehab: { Icon: Heart, label: "Rehab", color: "#C4694A" },
};

// Haversine distance in km
function haversine(a, b) {
    if (!a || !b || a.lat == null || b.lat == null) return null;
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const la1 = toRad(a.lat);
    const la2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

export default function NearbyMapPage() {
    const [rows, setRows] = useState([]);
    const [me, setMe] = useState(null); // {lat, lng}
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        api.get("/support-directory").then((r) => setRows(r.data));
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (p) => setMe({ lat: p.coords.latitude, lng: p.coords.longitude }),
                () => setMe({ lat: 28.6139, lng: 77.2090 }), // default Delhi
                { enableHighAccuracy: false, timeout: 6000 }
            );
        } else {
            setMe({ lat: 28.6139, lng: 77.2090 });
        }
    }, []);

    const sorted = useMemo(() => {
        const base = filter === "all" ? rows : rows.filter((r) => r.type === filter);
        if (!me) return base;
        return [...base]
            .map((r) => ({ ...r, _dist: haversine(me, r) }))
            .sort((a, b) => (a._dist ?? 9e9) - (b._dist ?? 9e9));
    }, [rows, me, filter]);

    // Build OpenStreetMap static embed URL (no key needed)
    const mapSrc = useMemo(() => {
        if (!me) return null;
        const bb = `${me.lng - 2.5}%2C${me.lat - 2.5}%2C${me.lng + 2.5}%2C${me.lat + 2.5}`;
        const marker = `${me.lat}%2C${me.lng}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bb}&layer=mapnik&marker=${marker}`;
    }, [me]);

    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Nearby Help</h2>
                <div className="hindi text-sm text-brown">नज़दीकी मदद</div>

                <div className="mt-3 bg-white border border-sand rounded-2xl overflow-hidden" data-testid="nearby-map">
                    {mapSrc ? (
                        <iframe
                            title="Nearby map"
                            src={mapSrc}
                            className="w-full h-48 border-0"
                            loading="lazy"
                        />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Fetching your location…</div>
                    )}
                    <div className="px-3 py-2 border-t border-sand text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin size={11} className="text-olive"/>
                        {me ? `${me.lat.toFixed(3)}, ${me.lng.toFixed(3)}` : "—"} · map © OpenStreetMap
                    </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto">
                    {["all", "legal_aid", "rehab", "counsellor"].map((k) => (
                        <button
                            key={k}
                            data-testid={`nearby-filter-${k}`}
                            onClick={() => setFilter(k)}
                            className={`press px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                                filter === k ? "bg-olive text-white border-olive" : "bg-white text-brown border-sand"
                            }`}
                        >
                            {k === "all" ? "All" : TYPES[k].label}
                        </button>
                    ))}
                </div>

                <div className="mt-4 space-y-3">
                    {sorted.map((r) => {
                        const T = TYPES[r.type] || TYPES.counsellor;
                        const Icon = T.Icon;
                        const dist = r._dist != null ? r._dist.toFixed(0) + " km" : "";
                        const dirHref = `https://www.openstreetmap.org/directions?from=${me?.lat},${me?.lng}&to=${r.lat},${r.lng}`;
                        return (
                            <div key={r.id} className="bg-white border border-sand rounded-2xl p-4 flex items-start gap-3" data-testid={`nearby-row-${r.id}`}>
                                <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: T.color }}>
                                    <Icon size={18}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-serif font-bold text-olive truncate">{r.name}</div>
                                    <div className="text-[11px] text-muted-foreground">{T.label} · {r.city} · {dist}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <a href={`tel:${r.phone.replace(/\s+/g, "")}`} className="press bg-wa text-white rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1" data-testid={`nearby-call-${r.id}`}>
                                        <Phone size={12}/> Call
                                    </a>
                                    <a href={dirHref} target="_blank" rel="noreferrer" className="press border border-sand text-olive bg-white rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1" data-testid={`nearby-dir-${r.id}`}>
                                        <Navigation size={12}/> Route
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/NextStepsPage.jsx`

```jsx
import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { useIntakeStore } from "@/pages/IntakeStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { speakText, stopSpeaking } from "@/lib/voice";
import { PhoneCall, UserCheck, FileText, ClipboardList, Volume2, Square } from "lucide-react";

export default function NextStepsPage() {
    const nav = useNavigate();
    const s = useIntakeStore();
    const { lang } = useApp();
    const [speaking, setSpeaking] = React.useState(false);

    const steps = [
        { n: 1, title: "Secure yourself", body: "Move to a safe place or trusted neighbour; keep your phone charged." , hi: "सुरक्षित जगह पर जाएँ" },
        { n: 2, title: "Preserve evidence", body: "Save messages, photos, medical reports — avoid washing clothes in physical cases.", hi: "सबूत सुरक्षित रखें" },
        { n: 3, title: "Talk to a counsellor", body: "A senior counsellor can guide you in your language and prepare paperwork.", hi: "काउंसलर से बात करें" },
        { n: 4, title: "File the drafted complaint", body: "We'll prepare a bilingual complaint you can take to the police station or legal aid centre.", hi: "मसौदा शिकायत दर्ज कराएँ" },
    ];

    const listenSteps = () => {
        if (speaking) { stopSpeaking(); setSpeaking(false); return; }
        const script = "Next steps. " + steps.map((x) => `Step ${x.n}. ${x.title}. ${x.body}`).join(" ");
        if (speakText(script, lang || "en")) setSpeaking(true);
    };

    const connectCounsellor = async () => {
        try {
            await api.patch(`/cases/${s.case_id}`, { stage: "Guidance", notes: "User requested senior counsellor" });
            toast.success("Senior counsellor notified · केस आगे बढ़ाया गया");
        } catch (e) {
            toast.error("Could not connect right now");
        }
    };

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Guidance</div>
                <div className="flex items-center justify-between">
                    <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Next Steps</h2>
                    <button
                        data-testid="listen-steps"
                        onClick={listenSteps}
                        className={`press flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${speaking ? "bg-deepred text-white" : "bg-olive text-white"}`}
                    >
                        {speaking ? <Square size={12}/> : <Volume2 size={12}/>} {speaking ? "Stop" : "Listen"}
                    </button>
                </div>
                <div className="hindi text-sm text-brown">अगले कदम</div>

                <ol className="mt-4 space-y-3">
                    {steps.map((x) => (
                        <li key={x.n} className="bg-white border border-sand rounded-2xl p-4 flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-olive text-white flex items-center justify-center font-serif font-bold">{x.n}</div>
                            <div className="flex-1">
                                <div className="font-serif font-bold text-olive">{x.title}</div>
                                <div className="hindi text-[11px] text-muted-foreground">{x.hi}</div>
                                <div className="text-sm text-foreground/85 mt-1">{x.body}</div>
                            </div>
                        </li>
                    ))}
                </ol>

                <button
                    data-testid="talk-counsellor-btn"
                    onClick={connectCounsellor}
                    className="press mt-5 w-full bg-brown hover:bg-brown/90 text-white rounded-full py-3.5 font-medium flex items-center justify-center gap-2"
                >
                    <UserCheck size={18} /> Talk to Senior Counsellor
                </button>

                <a
                    data-testid="tap-call-14566"
                    href="tel:14566"
                    className="press mt-3 w-full bg-terracotta text-white rounded-[20px] py-4 px-5 font-medium flex items-center justify-between shadow-md"
                >
                    <div>
                        <div className="font-serif font-bold text-lg">Tap to Call 14566</div>
                        <div className="hindi text-xs opacity-80">14566 पर कॉल करें</div>
                    </div>
                    <PhoneCall />
                </a>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                        data-testid="go-complaint-btn"
                        onClick={() => nav(`/intake/complaint`)}
                        className="press bg-white border border-sand rounded-2xl p-4 text-left"
                    >
                        <FileText className="text-olive" size={18} />
                        <div className="font-serif font-bold text-olive mt-2">Complaint Draft</div>
                        <div className="hindi text-[11px] text-muted-foreground">शिकायत मसौदा</div>
                    </button>
                    <button
                        data-testid="go-timeline-btn"
                        onClick={() => nav(`/timeline/${s.case_id}`)}
                        className="press bg-white border border-sand rounded-2xl p-4 text-left"
                    >
                        <ClipboardList className="text-olive" size={18} />
                        <div className="font-serif font-bold text-olive mt-2">Case Timeline</div>
                        <div className="hindi text-[11px] text-muted-foreground">केस टाइमलाइन</div>
                    </button>
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/OperatorPage.jsx`

```jsx
import React, { useState, useRef } from "react";
import MobileFrame from "@/components/MobileFrame";
import SVIGauge from "@/components/SVIGauge";
import { api } from "@/lib/api";
import { Mic, Square, Headphones } from "lucide-react";

/** Operator Assist — live SVI meter while operator types or dictates call notes. */
export default function OperatorPage() {
    const [text, setText] = useState("");
    const [threat, setThreat] = useState(false);
    const [isolation, setIsolation] = useState(false);
    const [score, setScore] = useState({ svi: 0, level: "Low", factors: [] });
    const [listening, setListening] = useState(false);
    const recRef = useRef(null);
    const debRef = useRef(null);

    const rescore = (t) => {
        if (debRef.current) clearTimeout(debRef.current);
        debRef.current = setTimeout(async () => {
            try {
                const r = await api.post("/svi/live", { text: t, threat_present: threat, isolation });
                setScore(r.data);
            } catch {}
        }, 350);
    };

    const onText = (v) => {
        setText(v);
        rescore(v);
    };

    const toggleListen = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return alert("Speech recognition not supported here.");
        if (listening) {
            recRef.current?.stop();
            setListening(false);
            return;
        }
        const r = new SR();
        r.lang = "en-IN";
        r.continuous = true;
        r.interimResults = true;
        r.onresult = (e) => {
            let full = "";
            for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + " ";
            onText(full.trim());
        };
        r.onend = () => setListening(false);
        try { r.start(); setListening(true); recRef.current = r; } catch {}
    };

    return (
        <MobileFrame showBack hideNav>
            <div className="px-5 pt-5 pb-10 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Operator Assist</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1 flex items-center gap-2">
                    <Headphones size={20}/> Live SVI Meter
                </h2>
                <div className="hindi text-sm text-brown">सहायक · लाइव SVI</div>

                <div className="mt-4 bg-white border border-sand rounded-[20px] p-4">
                    <SVIGauge score={score.svi} />
                </div>

                <div className="mt-4">
                    <label className="text-[13px] font-semibold text-olive">Type or dictate call notes</label>
                    <textarea
                        data-testid="operator-text"
                        value={text}
                        onChange={(e) => onText(e.target.value)}
                        rows={5}
                        className="mt-1 w-full bg-white border border-sand rounded-2xl px-4 py-3 outline-none focus:border-olive"
                        placeholder="Caller says... they are being threatened and feel alone..."
                    />
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                data-testid="operator-threat"
                                onClick={() => { setThreat((v) => !v); rescore(text); }}
                                className={`press px-3 py-1.5 rounded-full text-xs font-medium border ${threat ? "bg-deepred text-white border-deepred" : "bg-white border-sand text-brown"}`}
                            >Threat</button>
                            <button
                                data-testid="operator-isolation"
                                onClick={() => { setIsolation((v) => !v); rescore(text); }}
                                className={`press px-3 py-1.5 rounded-full text-xs font-medium border ${isolation ? "bg-terracotta text-white border-terracotta" : "bg-white border-sand text-brown"}`}
                            >Isolation</button>
                        </div>
                        <button
                            data-testid="operator-mic"
                            onClick={toggleListen}
                            className={`press flex items-center gap-2 rounded-full px-4 py-2 font-medium ${listening ? "bg-deepred text-white" : "bg-gold hover:bg-gold-dark text-white"}`}
                        >
                            {listening ? <Square size={14}/> : <Mic size={14}/>} {listening ? "Stop" : "Dictate"}
                        </button>
                    </div>
                </div>

                {score.factors?.length > 0 && (
                    <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                        <div className="font-serif font-bold text-olive">Live factors</div>
                        <ul className="mt-2 space-y-1 text-sm">
                            {score.factors.map((f, i) => (
                                <li key={i}><span className="font-semibold text-olive">{f.label}</span> <span className="text-muted-foreground">· {f.detail}</span></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/ProfilePage.jsx`

```jsx
import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield, Globe2, User } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";

export default function ProfilePage() {
    const { user, logout, lang, setLang } = useApp();
    const nav = useNavigate();
    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Profile</h2>
                <div className="hindi text-sm text-brown">प्रोफाइल</div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-5 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-olive text-white flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="font-serif font-bold text-olive truncate">{user?.name || "Anonymous User"}</div>
                        <div className="text-[12px] text-muted-foreground truncate">{user?.email}</div>
                        <div className="text-[12px] text-muted-foreground truncate">{user?.masked_phone}</div>
                    </div>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-olive"><Globe2 size={16}/> <span className="font-serif font-bold">Language</span></div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {LANGUAGES.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => setLang(l.code)}
                                data-testid={`profile-lang-${l.code}`}
                                className={`press text-left px-3 py-2 rounded-xl text-sm border ${
                                    lang === l.code ? "bg-olive text-white border-olive" : "bg-cream border-sand text-brown"
                                }`}
                            >
                                {l.native}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-olive"><Shield size={16}/> <span className="font-serif font-bold">Privacy</span></div>
                    <div className="text-[12px] text-muted-foreground mt-2">AES-256 at rest · minimal data · consent-first voice · audit log of every view/action.</div>
                </div>

                <button
                    data-testid="logout-btn"
                    onClick={() => { logout(); nav("/"); }}
                    className="press mt-4 w-full border border-sand bg-white text-brown rounded-full py-3 font-medium flex items-center justify-center gap-2"
                >
                    <LogOut size={16}/> Logout
                </button>

                <button
                    data-testid="go-counsellor-btn"
                    onClick={() => nav("/counsellor")}
                    className="press mt-3 w-full bg-olive text-white rounded-full py-3 font-medium"
                >
                    Counsellor Portal
                </button>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/SupervisorPage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { Eye } from "lucide-react";

export default function SupervisorPage() {
    const [rows, setRows] = useState([]);
    useEffect(() => { api.get("/supervisor/audit-log").then((r) => setRows(r.data)).catch(() => {}); }, []);
    return (
        <MobileFrame showBack hideNav>
            <div className="px-5 pt-5 pb-10">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Supervisor</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Audit Log</h2>
                <div className="hindi text-sm text-brown">लेखा-जोखा</div>

                <div className="mt-4 space-y-2">
                    {rows.map((r) => (
                        <div key={r.id} className="bg-white border border-sand rounded-2xl p-3 text-sm flex items-start gap-3">
                            <Eye size={14} className="text-olive mt-1"/>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif font-semibold text-olive">{r.action}</div>
                                <div className="text-[11px] text-muted-foreground">{new Date(r.timestamp).toLocaleString()} · user {r.user_id?.slice(0, 8)} · target {r.target?.slice(0, 8)}</div>
                            </div>
                        </div>
                    ))}
                    {rows.length === 0 && (
                        <div className="text-sm text-muted-foreground bg-white border border-sand rounded-2xl p-5 text-center">No audit entries yet.</div>
                    )}
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/SupportDirectoryPage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import MobileFrame from "@/components/MobileFrame";
import { api } from "@/lib/api";
import { Phone, Scale, Heart, Users } from "lucide-react";

const TYPES = {
    counsellor: { Icon: Users, label: "Counsellor", color: "#4A5A1E" },
    legal_aid: { Icon: Scale, label: "Legal Aid", color: "#7A4A12" },
    rehab: { Icon: Heart, label: "Rehab", color: "#C4694A" },
};

export default function SupportDirectoryPage() {
    const [rows, setRows] = useState([]);
    const [filter, setFilter] = useState("all");
    useEffect(() => { api.get("/support-directory").then((r) => setRows(r.data)); }, []);
    const list = filter === "all" ? rows : rows.filter((r) => r.type === filter);
    return (
        <MobileFrame>
            <div className="px-5 pt-5 pb-24">
                <h2 className="font-serif font-black text-2xl text-olive">Support Directory</h2>
                <div className="hindi text-sm text-brown">सहायता निर्देशिका</div>
                <div className="mt-4 flex gap-2 overflow-x-auto">
                    {["all", "counsellor", "legal_aid", "rehab"].map((k) => (
                        <button
                            key={k}
                            data-testid={`filter-${k}`}
                            onClick={() => setFilter(k)}
                            className={`press px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                                filter === k ? "bg-olive text-white border-olive" : "bg-white text-brown border-sand"
                            }`}
                        >
                            {k === "all" ? "All" : TYPES[k].label}
                        </button>
                    ))}
                </div>
                <div className="mt-4 space-y-3">
                    {list.map((r) => {
                        const T = TYPES[r.type] || TYPES.counsellor;
                        const Icon = T.Icon;
                        return (
                            <div key={r.id} className="bg-white border border-sand rounded-2xl p-4 flex items-start gap-3">
                                <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: T.color }}>
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-serif font-bold text-olive">{r.name}</div>
                                    <div className="text-[11px] text-muted-foreground">{T.label} · {r.city} · {r.lang.join(", ")}</div>
                                </div>
                                <a href={`tel:${r.phone.replace(/\s+/g, "")}`} className="press bg-wa text-white rounded-full px-3 py-2 text-xs font-medium flex items-center gap-1" data-testid={`call-${r.id}`}>
                                    <Phone size={14} /> Call
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/TimelinePage.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileFrame from "@/components/MobileFrame";
import CaseTimeline from "@/components/CaseTimeline";
import SVIGauge, { levelColor } from "@/components/SVIGauge";
import CaseChat from "@/components/CaseChat";
import { api } from "@/lib/api";
import { FileText, PhoneCall } from "lucide-react";

export default function TimelinePage() {
    const { caseId } = useParams();
    const nav = useNavigate();
    const [c, setC] = useState(null);

    useEffect(() => {
        api.get(`/cases/${caseId}`).then((r) => setC(r.data)).catch(() => {});
    }, [caseId]);

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Case</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">#{c?.case_id || caseId}</h2>
                <div className="hindi text-sm text-brown">केस टाइमलाइन</div>

                {c && (
                    <>
                        <div className="mt-4 bg-white border border-sand rounded-2xl p-4 flex items-center gap-4">
                            <div className="flex-1">
                                <div className="text-[11px] uppercase text-brown">Current stage</div>
                                <div className="font-serif font-bold text-olive text-xl">{c.stage}</div>
                                <div className="text-[11px] text-muted-foreground">Updated {new Date(c.updated_at).toLocaleString()}</div>
                            </div>
                            <div
                                className="rounded-full px-3 py-1 text-xs text-white font-semibold"
                                style={{ backgroundColor: levelColor(c.assessment?.svi || 0).bg }}
                            >
                                SVI {Math.round(c.assessment?.svi || 0)} · {c.assessment?.level}
                            </div>
                        </div>

                        <div className="mt-4 bg-white border border-sand rounded-2xl p-4">
                            <CaseTimeline completed={c.stages_completed} current={c.stage} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                data-testid="open-draft-btn"
                                onClick={() => nav(`/complaint/${c.case_id}`)}
                                className="press bg-white border border-sand rounded-2xl p-4 text-left"
                            >
                                <FileText className="text-olive" size={18} />
                                <div className="font-serif font-bold text-olive mt-2">Open Draft</div>
                            </button>
                            <a href="tel:14566" className="press bg-terracotta text-white rounded-2xl p-4 text-left">
                                <PhoneCall size={18} />
                                <div className="font-serif font-bold mt-2">Call 14566</div>
                            </a>
                        </div>

                        <div className="mt-4">
                            <CaseChat caseId={c.case_id} />
                        </div>
                    </>
                )}
            </div>
        </MobileFrame>
    );
}
```

### `frontend/src/pages/VerifyPage.jsx`

```jsx
import React from "react";
import MobileFrame from "@/components/MobileFrame";
import { useNavigate } from "react-router-dom";
import { intakeStore, useIntakeStore } from "@/pages/IntakeStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCheck, Pencil, FilePlus } from "lucide-react";

const CAT_LABEL = {
    physical: "Physical Violence · शारीरिक हिंसा",
    caste: "Caste-based Abuse · जाति आधारित दुर्व्यवहार",
    property: "Property / Eviction · संपत्ति",
    social_boycott: "Social Boycott · सामाजिक बहिष्कार",
    sexual: "Sexual Violence · यौन हिंसा",
    discrimination: "Discrimination · भेदभाव",
};

export default function VerifyPage() {
    const nav = useNavigate();
    const s = useIntakeStore();
    const [busy, setBusy] = React.useState(false);

    const confirm = async () => {
        setBusy(true);
        try {
            const payload = {
                category: s.category,
                narrative: s.narrative,
                language: s.language,
                voice_metrics: s.voice_metrics,
                threat_present: s.threat_present,
                isolation: s.isolation,
                timeline: s.timeline,
                location: s.location,
                voice_consent: s.voice_consent,
                audio_b64: s.audio_b64,
                proof_files: s.proof_files,
            };
            const r = await api.post("/cases", payload);
            intakeStore.set({ assessment: r.data.assessment, case_id: r.data.case_id });
            // Advance stage
            try { await api.patch(`/cases/${r.data.case_id}`, { stage: "Verified" }); } catch {}
            nav("/intake/assessment");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Could not submit case");
        } finally {
            setBusy(false);
        }
    };

    const onProofChange = async (e) => {
        const files = Array.from(e.target.files || []);
        const encoded = await Promise.all(files.map((f) => new Promise((res) => {
            const r = new FileReader();
            r.onloadend = () => res({ name: f.name, size: f.size, type: f.type, data: String(r.result).slice(0, 200000) });
            r.readAsDataURL(f);
        })));
        intakeStore.setField("proof_files", encoded);
    };

    return (
        <MobileFrame showBack>
            <div className="px-5 pt-5 pb-28 animate-fade-up">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-brown">Step 3 of 4 · Fact check</div>
                <h2 className="font-serif font-black text-2xl text-olive leading-tight mt-1">Does this look right?</h2>
                <div className="hindi text-sm text-brown">क्या विवरण सही है?</div>

                <div className="mt-4 space-y-3">
                    <div className="bg-white border border-sand rounded-2xl p-4">
                        <div className="text-[11px] font-semibold uppercase text-brown">Category</div>
                        <div className="font-serif text-olive font-semibold mt-0.5">{CAT_LABEL[s.category] || s.category}</div>
                    </div>
                    <div className="bg-white border border-sand rounded-2xl p-4">
                        <div className="text-[11px] font-semibold uppercase text-brown">Grievance narrative</div>
                        <div className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap" data-testid="verify-narrative">
                            {s.narrative || "—"}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-sand rounded-2xl p-4">
                            <div className="text-[11px] font-semibold uppercase text-brown">When</div>
                            <div className="text-sm mt-1">{s.timeline || "—"}</div>
                        </div>
                        <div className="bg-white border border-sand rounded-2xl p-4">
                            <div className="text-[11px] font-semibold uppercase text-brown">Where</div>
                            <div className="text-sm mt-1">{s.location || "—"}</div>
                        </div>
                    </div>
                    <label className="bg-white border border-sand rounded-2xl p-4 flex items-center gap-3 cursor-pointer">
                        <div className="h-10 w-10 rounded-xl bg-cream border border-sand flex items-center justify-center text-olive">
                            <FilePlus size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-olive">Attach proof (optional)</div>
                            <div className="text-[11px] text-muted-foreground">Photos, documents · {s.proof_files?.length || 0} added</div>
                        </div>
                        <input data-testid="proof-input" type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={onProofChange} className="hidden" />
                    </label>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        data-testid="clarify-btn"
                        onClick={() => nav("/intake/record")}
                        className="press border border-sand bg-white text-brown rounded-full py-3 font-medium flex items-center justify-center gap-2"
                    >
                        <Pencil size={16} /> Let Me Clarify
                    </button>
                    <button
                        data-testid="confirm-btn"
                        disabled={busy}
                        onClick={confirm}
                        className="press bg-gold hover:bg-gold-dark text-white rounded-full py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <CheckCheck size={16} /> Yes, That's Right
                    </button>
                </div>
            </div>
        </MobileFrame>
    );
}
```

### `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
    blocklist: ["overline"],
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Noto Serif"', '"Noto Serif Devanagari"', "serif"],
                sans: ['"Noto Sans"', '"Noto Sans Devanagari"', "system-ui", "sans-serif"],
            },
            colors: {
                cream: "#F7EFE2",
                olive: "#4A5A1E",
                "olive-dark": "#3a4718",
                gold: "#B8862B",
                "gold-dark": "#9a701f",
                brown: "#7A4A12",
                terracotta: "#C4694A",
                deepred: "#8B2A1A",
                wa: "#25C05F",
                sand: "#D3C7AC",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
                popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
                primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
                secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
                muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
                accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
                destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
                "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
                "wave-pulse": {
                    "0%, 100%": { transform: "scaleY(0.3)" },
                    "50%": { transform: "scaleY(1)" },
                },
                "fade-up": { "0%": { opacity: 0, transform: "translateY(10px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "wave-pulse": "wave-pulse 0.8s ease-in-out infinite",
                "fade-up": "fade-up 0.35s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
```

