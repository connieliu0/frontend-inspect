# React Grab Bridge — VS Code Extension

A VS Code extension that runs a localhost HTTP server so browser dev-tools (or any script) can send **React component selection stacks** and VS Code jumps straight to the right source file.

---

## Features

| Command | Description |
|---|---|
| **React Grab: Start Bridge** | Starts the HTTP server on `127.0.0.1:3344` |
| **React Grab: Stop Bridge** | Stops the HTTP server |
| **React Grab: Open Rendered By** | Opens the component that *rendered* the selected element |
| **React Grab: Open Used In** | Opens the *parent / consumer* component |
| **React Grab: Open Frame (QuickPick)** | Pick any frame from the last selection |
| **React Grab: Show Last Selection** | Debug: show a summary notification |

A status-bar item (`React Grab: On/Off`) lets you toggle the server with one click.

---

## Build & Run

### Prerequisites

- Node.js ≥ 18
- VS Code ≥ 1.80

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Compile TypeScript
npm run compile
```

Then press **F5** in VS Code to launch the Extension Development Host.

Inside the dev host, open the Command Palette (`Cmd+Shift+P`) and run:

```
React Grab: Start Bridge
```

The status bar should update to **React Grab: On**.

---

## Test Harness

A Node script is provided that POSTs two sample payloads to the bridge.

```bash
# Make sure the bridge is running in the Extension Development Host, then:
npm run test:post

# Or send only one example:
node scripts/postSelection.js A
node scripts/postSelection.js B
```

### Example A — primitive element + usage

Frames:
1. `tab-bar.tsx:68:11` (anonymous — primitive render)
2. `tab-bar.tsx:43:11` (anonymous — same file)
3. `RightPanel @ RightPanel.tsx:28:86` (parent consumer)

Expected: **Rendered by** → `tab-bar.tsx:68`, **Used in** → `RightPanel.tsx:28`.

### Example B — component + parent + provider

Frames:
1. `CanvasBar @ CanvasBar.tsx:21:201`
2. `LayoutContentInner @ LayoutContent.tsx:37:11`
3. `CanvasSelectionProvider @ CanvasSelectionContext.tsx:21:11` (wrapper)

Expected: **Rendered by** → `CanvasBar.tsx:21`, **Used in** → `LayoutContent.tsx:37` (skips the provider).

---

## Suggested Keybindings

These are registered by default in the extension:

| Shortcut | Command |
|---|---|
| `Cmd+Enter` | React Grab: Open Rendered By |
| `Cmd+Shift+Enter` | React Grab: Open Used In |

They activate when an editor has text focus.

---

## HTTP API

### `POST /selection`

**URL:** `http://127.0.0.1:3344/selection`

**Body (JSON):**

```json
{
  "domLabel": "div.my-class",
  "frames": [
    {
      "raw": "MyComponent (at /app/src/components/MyComponent.tsx:12:5)",
      "name": "MyComponent",
      "file": "/app/src/components/MyComponent.tsx",
      "line": 12,
      "col": 5
    }
  ]
}
```

**Constraints:**
- `Content-Type: application/json`
- Body ≤ 200 KB
- `frames` must have ≥ 1 entry
- `line` / `col` must be positive integers

**Success response:** `200 { "ok": true }`

---

## How It Works

1. A browser companion script (or React DevTools integration) captures the component stack for a selected DOM element.
2. It POSTs the stack to `127.0.0.1:3344/selection`.
3. The extension normalizes file paths (strips webpack prefixes, keeps the `src/…` portion).
4. **Rendered by** picks the first meaningful `src/` frame.
5. **Used in** walks up the stack to find the nearest non-wrapper parent in a different file.
6. VS Code opens the file and places the cursor at the exact line/col.

---

## Local Development Setup

To connect your local dev server (e.g. a Next.js app) to the extension, you need to add a small browser-side bridge that POSTs selection data to the extension's HTTP server. There are three files involved — one you copy, two you create.

### 1. Copy the bridge module into your project

Copy `browser-bridge/reactGrabBridge.ts` from this repo into your project's `src/lib/` directory (or wherever you keep utilities):

```
your-app/
  src/
    lib/
      reactGrabBridge.ts   ← copy from this repo
```

No modifications are needed. The module defaults to posting to `http://127.0.0.1:3344/selection`, which is where the extension listens.

### 2. Create a dev-only bridge component

Create a client component that dynamically imports the bridge so it's never bundled in production.

**App Router** — `src/components/ReactGrabDevBridge.tsx`

```tsx
"use client";

import { useEffect } from "react";

export default function ReactGrabDevBridge() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let cleanup: (() => void) | undefined;

    import("../lib/reactGrabBridge").then(({ startReactGrabBridge }) => {
      cleanup = startReactGrabBridge();
    });

    return () => cleanup?.();
  }, []);

  return null;
}
```

**Pages Router** — add to `pages/_app.tsx`

```tsx
import { useEffect } from "react";
import type { AppProps } from "next/app";

function useReactGrabBridge() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;

    let cleanup: (() => void) | undefined;

    import("../lib/reactGrabBridge").then(({ startReactGrabBridge }) => {
      cleanup = startReactGrabBridge();
    });

    return () => cleanup?.();
  }, []);
}

export default function App({ Component, pageProps }: AppProps) {
  useReactGrabBridge();
  return <Component {...pageProps} />;
}
```

### 3. Render the bridge in your layout (App Router)

In your root `src/app/layout.tsx`, import the component and render it inside `<body>`, gated to development:

```tsx
import ReactGrabDevBridge from "../components/ReactGrabDevBridge";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV === "development" && <ReactGrabDevBridge />}
      </body>
    </html>
  );
}
```

### 4. Start the extension and your dev server

1. Launch the Extension Development Host (press **F5** in this repo's VS Code window).
2. In the dev host, open the Command Palette and run **React Grab: Start Bridge**.
3. Start your app's dev server (`npm run dev`).
4. Open your app in the browser — the bridge will connect automatically.

When you select a component via React Grab in the browser, the extension receives the selection and you can jump to source with `Cmd+Enter` (Rendered By) or `Cmd+Shift+Enter` (Used In).

### Notes

- **No proxy needed.** The extension server includes CORS headers, so the browser can POST directly from `localhost:3000` (or any origin) to `127.0.0.1:3344`.
- **Custom endpoint.** If you change the extension's port, pass it to the bridge: `startReactGrabBridge({ endpointUrl: 'http://127.0.0.1:5000/selection' })`.
- **Production safe.** The `process.env.NODE_ENV` guard and dynamic `import()` ensure zero bridge code ships in production builds.
- Full example files are in `browser-bridge/examples/`.

---

## License

MIT
