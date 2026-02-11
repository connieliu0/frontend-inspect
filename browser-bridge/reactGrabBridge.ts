/**
 * React Grab → VS Code Bridge
 *
 * Sends React Grab selection stacks to the VS Code extension's localhost
 * HTTP server so you can jump to source with one keystroke.
 *
 * Usage (client-only, dev-only):
 *   import { startReactGrabBridge } from './reactGrabBridge';
 *   startReactGrabBridge();                          // defaults to 127.0.0.1:3344
 *   startReactGrabBridge({ endpointUrl: 'http://127.0.0.1:4000/selection' });
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Frame {
  raw: string;
  name: string | null;
  file: string;
  line: number;
  col: number;
}

export interface SelectionPayload {
  domLabel: string | null;
  frames: Frame[];
}

export interface BridgeOptions {
  /** POST target. Default: "http://127.0.0.1:3344/selection" */
  endpointUrl?: string;
  /** Debounce interval in ms. Default: 150 */
  debounceMs?: number;
  /** Allow non-localhost endpoints. Default: false */
  allowNonLocalhost?: boolean;
  /** Log level. Default: "minimal" (one line per POST). "verbose" adds parse details. "silent" suppresses all. */
  logLevel?: "minimal" | "verbose" | "silent";
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_ENDPOINT = "http://127.0.0.1:3344/selection";
const DEFAULT_DEBOUNCE = 150;
const SOURCE_EXTS = /\.(tsx?|jsx?):/;

/* ------------------------------------------------------------------ */
/*  Parsing helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Parse a React Grab selection text block into a structured payload.
 *
 * Input examples:
 *
 *   @<TabBarItem>
 *   <button class="tab-item">Settings</button>
 *     in /(app-pages-browser)/./src/components/spring-ui/tab-bar.tsx:68:11
 *     in /(app-pages-browser)/./src/components/spring-ui/tab-bar.tsx:43:11
 *     in RightPanel (at /(app-pages-browser)/./src/components/designer/layout/panels/rightpanel/RightPanel.tsx:28:86)
 *
 *   @<CanvasBar>
 *   <div class="canvas-bar">...</div>
 *     in CanvasBar (at /(app-pages-browser)/./src/components/designer/layout/CanvasBar.tsx:21:201)
 *     in LayoutContentInner (at /(app-pages-browser)/./src/components/designer/layout/LayoutContent.tsx:37:11)
 *     in CanvasSelectionProvider (at /(app-pages-browser)/./src/context/CanvasSelectionContext.tsx:21:11)
 */
export function parseReactGrabText(text: string): SelectionPayload | null {
  const lines = text.split("\n").map((l) => l.trimEnd());

  // --- domLabel ---
  // Matches "@<ComponentName>" at the start, or "@<Component.Sub>"
  let domLabel: string | null = null;
  const labelLine = lines.find((l) => /^@<.+>/.test(l.trim()));
  if (labelLine) {
    const m = labelLine.trim().match(/^@<(.+)>$/);
    if (m) {
      domLabel = m[1];
    }
  }

  // --- frames ---
  // Two patterns for "  in ..." lines:
  //   A) "  in Name (at PATH:line:col)"        → named component
  //   B) "  in PATH:line:col"                   → anonymous / primitive
  //
  // Regex A: "in" + ws + NAME + " (at " + PATH + ":" + LINE + ":" + COL + ")"
  // Regex B: "in" + ws + PATH + ":" + LINE + ":" + COL
  const reNamed = /^\s*in\s+(.+?)\s+\(at\s+(.+):(\d+):(\d+)\)\s*$/;
  const reAnon = /^\s*in\s+(.+):(\d+):(\d+)\s*$/;

  const frames: Frame[] = [];

  for (const line of lines) {
    // Skip non-"in" lines
    if (!/^\s*in\s+/.test(line)) {
      continue;
    }

    let name: string | null = null;
    let file: string;
    let lineNum: number;
    let col: number;

    const namedMatch = line.match(reNamed);
    if (namedMatch) {
      name = namedMatch[1];
      file = namedMatch[2];
      lineNum = parseInt(namedMatch[3], 10);
      col = parseInt(namedMatch[4], 10);
    } else {
      const anonMatch = line.match(reAnon);
      if (!anonMatch) {
        continue; // unparseable "in" line — skip
      }
      file = anonMatch[1];
      lineNum = parseInt(anonMatch[2], 10);
      col = parseInt(anonMatch[3], 10);
    }

    // Only keep source files (.ts/.tsx/.js/.jsx)
    if (!SOURCE_EXTS.test(file + ":")) {
      continue;
    }

    // Validate positive ints
    if (lineNum < 1 || col < 1 || !Number.isFinite(lineNum) || !Number.isFinite(col)) {
      continue;
    }

    frames.push({ raw: line.trim(), name, file, line: lineNum, col });
  }

  if (frames.length === 0) {
    return null;
  }

  return { domLabel, frames };
}

/* ------------------------------------------------------------------ */
/*  Debounce                                                           */
/* ------------------------------------------------------------------ */

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* ------------------------------------------------------------------ */
/*  POST helper                                                        */
/* ------------------------------------------------------------------ */

async function postPayload(
  url: string,
  payload: SelectionPayload,
  logLevel: BridgeOptions["logLevel"]
): Promise<void> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (logLevel !== "silent") {
      const tag = `[react-grab-bridge]`;
      if (res.ok) {
        console.log(
          `${tag} sent ${payload.frames.length} frame(s) → ${res.status}`
        );
      } else {
        const body = await res.text().catch(() => "");
        console.warn(`${tag} POST failed: ${res.status} ${body}`);
      }
    }
  } catch (err) {
    if (logLevel !== "silent") {
      console.warn(`[react-grab-bridge] POST error:`, (err as Error).message);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Localhost guard                                                     */
/* ------------------------------------------------------------------ */

function isLocalhost(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname === "127.0.0.1" ||
      u.hostname === "localhost" ||
      u.hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  React Grab plugin API (best-effort)                                */
/* ------------------------------------------------------------------ */

declare global {
  interface Window {
    __REACT_GRAB__?: {
      registerPlugin?: (plugin: ReactGrabPlugin) => (() => void) | void;
      onSelection?: (cb: (data: ReactGrabSelectionEvent) => void) => (() => void) | void;
      version?: string;
    };
  }
}

interface ReactGrabPlugin {
  name: string;
  onSelection?: (data: ReactGrabSelectionEvent) => void;
  onCopy?: (data: ReactGrabCopyEvent) => void;
}

interface ReactGrabSelectionEvent {
  /** Raw text as shown in the overlay */
  text?: string;
  /** Already-parsed component name */
  componentName?: string;
  /** Already-parsed frames (if the plugin API provides structured data) */
  frames?: Array<{ raw?: string; name?: string | null; file?: string; line?: number; col?: number }>;
}

interface ReactGrabCopyEvent {
  text?: string;
}

/**
 * Try to register via the React Grab plugin API.
 * Returns true if we successfully hooked in; false if we should fall back.
 */
function tryPluginApi(send: (payload: SelectionPayload) => void, logLevel: BridgeOptions["logLevel"]): boolean {
  const rg = window.__REACT_GRAB__;
  if (!rg) return false;

  // --- Strategy 1: registerPlugin with onSelection / onCopy ---
  if (typeof rg.registerPlugin === "function") {
    let receivedEvent = false;

    const plugin: ReactGrabPlugin = {
      name: "react-grab-vscode-bridge",

      onSelection(data) {
        receivedEvent = true;
        handlePluginData(data, send, logLevel);
      },

      onCopy(data) {
        receivedEvent = true;
        if (data.text) {
          const payload = parseReactGrabText(data.text);
          if (payload) send(payload);
        }
      },
    };

    try {
      rg.registerPlugin(plugin);
      if (logLevel === "verbose") {
        console.log("[react-grab-bridge] registered plugin via registerPlugin()");
      }

      // Give it a few seconds; if nothing fires, the clipboard fallback
      // will also be running as a safety net — see startReactGrabBridge().
      // We return true so the caller knows we *attempted* plugin registration,
      // but we always install the clipboard fallback too, guarded by a
      // dedup flag so we don't double-post.
      return true;
    } catch (err) {
      if (logLevel !== "silent") {
        console.warn("[react-grab-bridge] registerPlugin() threw:", err);
      }
    }
  }

  // --- Strategy 2: onSelection callback directly on __REACT_GRAB__ ---
  if (typeof rg.onSelection === "function") {
    try {
      rg.onSelection((data) => {
        handlePluginData(data, send, logLevel);
      });
      if (logLevel === "verbose") {
        console.log("[react-grab-bridge] registered via onSelection()");
      }
      return true;
    } catch (err) {
      if (logLevel !== "silent") {
        console.warn("[react-grab-bridge] onSelection() threw:", err);
      }
    }
  }

  return false;
}

function handlePluginData(
  data: ReactGrabSelectionEvent,
  send: (payload: SelectionPayload) => void,
  logLevel: BridgeOptions["logLevel"]
): void {
  // If the plugin gives us structured frames, use them directly
  if (data.frames && Array.isArray(data.frames) && data.frames.length > 0) {
    const frames: Frame[] = data.frames
      .filter(
        (f): f is { raw: string; name: string | null; file: string; line: number; col: number } =>
          typeof f.file === "string" &&
          typeof f.line === "number" &&
          typeof f.col === "number" &&
          f.line > 0 &&
          f.col > 0
      )
      .map((f) => ({
        raw: f.raw ?? `${f.name ?? ""} ${f.file}:${f.line}:${f.col}`,
        name: f.name ?? null,
        file: f.file,
        line: f.line,
        col: f.col,
      }));

    if (frames.length > 0) {
      send({ domLabel: data.componentName ?? null, frames });
      return;
    }
  }

  // Fallback: parse the text representation
  if (data.text) {
    const payload = parseReactGrabText(data.text);
    if (payload) {
      send(payload);
    } else if (logLevel === "verbose") {
      console.log("[react-grab-bridge] plugin text could not be parsed");
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Clipboard fallback                                                 */
/* ------------------------------------------------------------------ */

function installClipboardFallback(
  send: (payload: SelectionPayload) => void,
  logLevel: BridgeOptions["logLevel"]
): () => void {
  // Track the last payload hash to avoid double-posting when the plugin API
  // already handled the same selection.
  let lastHash = "";

  const handler = async () => {
    // Small delay to let the clipboard populate
    await new Promise((r) => setTimeout(r, 50));

    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      // Permission denied or not available — silently bail
      return;
    }

    // Quick sniff: does this look like React Grab output?
    if (!text.includes("\n") || !/^\s*in\s+/m.test(text)) {
      return;
    }

    const payload = parseReactGrabText(text);
    if (!payload) return;

    // Dedup
    const hash = JSON.stringify(payload);
    if (hash === lastHash) return;
    lastHash = hash;

    if (logLevel === "verbose") {
      console.log("[react-grab-bridge] parsed from clipboard");
    }

    send(payload);
  };

  document.addEventListener("copy", handler);
  return () => document.removeEventListener("copy", handler);
}

/* ------------------------------------------------------------------ */
/*  Main entry point                                                   */
/* ------------------------------------------------------------------ */

/**
 * Start the React Grab → VS Code bridge.
 *
 * Call once in your app's dev-only client bootstrap.
 * Returns a cleanup function that tears down all listeners.
 */
export function startReactGrabBridge(options: BridgeOptions = {}): () => void {
  const {
    endpointUrl = DEFAULT_ENDPOINT,
    debounceMs = DEFAULT_DEBOUNCE,
    allowNonLocalhost = false,
    logLevel = "minimal",
  } = options;

  // Safety: refuse non-localhost unless explicitly allowed
  if (!allowNonLocalhost && !isLocalhost(endpointUrl)) {
    console.error(
      `[react-grab-bridge] refusing non-localhost endpoint "${endpointUrl}". ` +
        `Pass allowNonLocalhost: true to override.`
    );
    return () => {};
  }

  if (logLevel !== "silent") {
    console.log(`[react-grab-bridge] starting → ${endpointUrl}`);
  }

  // Debounced sender
  const debouncedPost = debounce((...args: unknown[]) => {
    const payload = args[0] as SelectionPayload;
    postPayload(endpointUrl, payload, logLevel);
  }, debounceMs);

  const send = (payload: SelectionPayload) => debouncedPost(payload);

  // 1. Try plugin API
  const pluginRegistered = tryPluginApi(send, logLevel);
  if (pluginRegistered && logLevel !== "silent") {
    console.log("[react-grab-bridge] plugin API detected — using it (clipboard fallback also active)");
  }

  // 2. Always install clipboard fallback as safety net
  const removeClipboard = installClipboardFallback(send, logLevel);

  // Cleanup
  return () => {
    removeClipboard();
    if (logLevel !== "silent") {
      console.log("[react-grab-bridge] stopped");
    }
  };
}

/* ------------------------------------------------------------------ */
/*  Default export for convenience                                     */
/* ------------------------------------------------------------------ */

export default startReactGrabBridge;
