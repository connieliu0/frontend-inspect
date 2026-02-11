#!/usr/bin/env node

/**
 * Test harness — POSTs sample selection payloads to the React Grab Bridge.
 *
 * Usage:
 *   node scripts/postSelection.js          # sends both examples
 *   node scripts/postSelection.js A        # sends example A only
 *   node scripts/postSelection.js B        # sends example B only
 */

const http = require("http");

/* ------------------------------------------------------------------ */
/*  Helper: parse a raw React DevTools frame string into an object     */
/* ------------------------------------------------------------------ */

function parseFrame(raw) {
  // Two patterns:
  //   "ComponentName (at /(prefix)/./path/to/file.tsx:line:col)"
  //   "/(prefix)/./path/to/file.tsx:line:col"
  let name = null;
  let file, line, col;

  const namedMatch = raw.match(
    /^(.+?)\s+\(at\s+(.+):(\d+):(\d+)\)$/
  );
  if (namedMatch) {
    name = namedMatch[1];
    file = namedMatch[2];
    line = parseInt(namedMatch[3], 10);
    col = parseInt(namedMatch[4], 10);
  } else {
    const plainMatch = raw.match(/^(.+):(\d+):(\d+)$/);
    if (!plainMatch) {
      throw new Error(`Cannot parse frame: ${raw}`);
    }
    file = plainMatch[1];
    line = parseInt(plainMatch[2], 10);
    col = parseInt(plainMatch[3], 10);
  }

  return { raw, name, file, line, col };
}

/* ------------------------------------------------------------------ */
/*  Sample payloads                                                    */
/* ------------------------------------------------------------------ */

const exampleA = {
  domLabel: "div.tab-item",
  frames: [
    "/(app-pages-browser)/./src/components/spring-ui/tab-bar.tsx:68:11",
    "/(app-pages-browser)/./src/components/spring-ui/tab-bar.tsx:43:11",
    "RightPanel (at /(app-pages-browser)/./src/components/designer/layout/panels/rightpanel/RightPanel.tsx:28:86)",
  ].map(parseFrame),
};

const exampleB = {
  domLabel: "button.canvas-bar-btn",
  frames: [
    "CanvasBar (at /(app-pages-browser)/./src/components/designer/layout/CanvasBar.tsx:21:201)",
    "LayoutContentInner (at /(app-pages-browser)/./src/components/designer/layout/LayoutContent.tsx:37:11)",
    "CanvasSelectionProvider (at /(app-pages-browser)/./src/context/CanvasSelectionContext.tsx:21:11)",
  ].map(parseFrame),
};

/* ------------------------------------------------------------------ */
/*  POST helper                                                        */
/* ------------------------------------------------------------------ */

function post(label, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 3344,
        path: "/selection",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          console.log(`[${label}] ${res.statusCode} ${body}`);
          resolve();
        });
      }
    );
    req.on("error", (err) => {
      console.error(`[${label}] Error: ${err.message}`);
      reject(err);
    });
    req.write(data);
    req.end();
  });
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  const which = (process.argv[2] || "").toUpperCase();

  console.log("--- React Grab Bridge Test Harness ---\n");

  if (which === "A" || which === "") {
    console.log("Sending Example A (primitive + usage)…");
    console.log(JSON.stringify(exampleA, null, 2));
    console.log();
    await post("Example A", exampleA);
    console.log();
  }

  if (which === "B" || which === "") {
    console.log("Sending Example B (component + parent + provider)…");
    console.log(JSON.stringify(exampleB, null, 2));
    console.log();
    await post("Example B", exampleB);
    console.log();
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
