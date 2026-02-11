import * as vscode from "vscode";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Frame {
  raw: string;
  name: string | null;
  file: string;
  line: number;
  col: number;
}

interface Selection {
  domLabel: string | null;
  frames: Frame[];
}

interface NormalizedFrame extends Frame {
  normalizedFile: string;
}

/* ------------------------------------------------------------------ */
/*  Module-level state                                                 */
/* ------------------------------------------------------------------ */

let server: http.Server | null = null;
let serverRunning = false;
let lastSelection: Selection | null = null;
let statusBarItem: vscode.StatusBarItem;

/* ------------------------------------------------------------------ */
/*  Path normalization + resolving                                     */
/* ------------------------------------------------------------------ */

function normalizePath(file: string): string {
  // Keep substring starting at "/src/" or "src\"
  const srcSlash = file.indexOf("/src/");
  const srcBackslash = file.indexOf("src\\");
  let result: string;
  if (srcSlash !== -1) {
    result = file.substring(srcSlash + 1); // strip leading "/"
  } else if (srcBackslash !== -1) {
    result = file.substring(srcBackslash);
  } else {
    result = file;
  }
  // Strip leading "/" and replace backslashes
  result = result.replace(/^\/+/, "").replace(/\\/g, "/");
  return result;
}

function resolveToAbsolute(normalizedFile: string): string | null {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) {
    return null;
  }
  for (const folder of folders) {
    const candidate = path.join(folder.uri.fsPath, normalizedFile);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Normalize all frames in a selection                                */
/* ------------------------------------------------------------------ */

function normalizeFrames(sel: Selection): NormalizedFrame[] {
  return sel.frames.map((f) => ({
    ...f,
    normalizedFile: normalizePath(f.file),
  }));
}

/* ------------------------------------------------------------------ */
/*  Target selection algorithm                                         */
/* ------------------------------------------------------------------ */

function isWrapper(frame: NormalizedFrame): boolean {
  const f = frame.normalizedFile;
  const n = frame.name ?? "";
  return (
    f.includes("/context/") ||
    f.includes("/providers/") ||
    n.includes("Provider") ||
    n.includes("Context") ||
    n.includes("Boundary")
  );
}

function findRenderedBy(frames: NormalizedFrame[]): {
  frame: NormalizedFrame;
  index: number;
} | null {
  // Choose the first frame whose normalized path starts with "src/" and line > 0
  const candidates = frames
    .map((f, i) => ({ f, i }))
    .filter((x) => x.f.normalizedFile.startsWith("src/") && x.f.line > 0);

  if (candidates.length === 0) {
    return null;
  }

  // Prefer one with name != null; otherwise first
  const withName = candidates.find((c) => c.f.name !== null);
  const chosen = withName ?? candidates[0];
  return { frame: chosen.f, index: chosen.i };
}

function findUsedIn(
  frames: NormalizedFrame[],
  rendered: { frame: NormalizedFrame; index: number }
): NormalizedFrame {
  const renderedFile = rendered.frame.normalizedFile;

  // Scan from i+1 downward
  for (let j = rendered.index + 1; j < frames.length; j++) {
    const f = frames[j];
    if (!isWrapper(f) && f.normalizedFile !== renderedFile) {
      return f;
    }
  }

  // Fallback: first frame where file differs (even if wrapper)
  for (let j = rendered.index + 1; j < frames.length; j++) {
    const f = frames[j];
    if (f.normalizedFile !== renderedFile) {
      return f;
    }
  }

  // Final fallback: rendered itself
  return rendered.frame;
}

/* ------------------------------------------------------------------ */
/*  Open file at line/col                                              */
/* ------------------------------------------------------------------ */

async function openAtLineCol(
  normalizedFile: string,
  line: number,
  col: number
): Promise<void> {
  const absPath = resolveToAbsolute(normalizedFile);
  if (!absPath) {
    vscode.window.showErrorMessage(
      `React Grab: could not find "${normalizedFile}" in any workspace folder.`
    );
    return;
  }
  const uri = vscode.Uri.file(absPath);
  const zeroLine = Math.max(0, line - 1);
  const zeroCol = Math.max(0, col - 1);
  const pos = new vscode.Position(zeroLine, zeroCol);
  const sel = new vscode.Selection(pos, pos);

  const doc = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(doc);
  editor.selection = sel;
  editor.revealRange(
    new vscode.Range(pos, pos),
    vscode.TextEditorRevealType.InCenter
  );
}

/* ------------------------------------------------------------------ */
/*  HTTP server                                                        */
/* ------------------------------------------------------------------ */

const MAX_BODY = 200 * 1024; // 200 KB

function startServer(): void {
  if (server) {
    vscode.window.showInformationMessage("React Grab Bridge already running.");
    return;
  }

  server = http.createServer((req, res) => {
    // ---- CORS headers (allow any origin on localhost) ----
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check — visit http://127.0.0.1:3344 in a browser to confirm the server is up
    if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          server: "react-grab-bridge",
          lastSelection: lastSelection
            ? {
                domLabel: lastSelection.domLabel,
                frameCount: lastSelection.frames.length,
              }
            : null,
        })
      );
      return;
    }

    // Only accept POST /selection
    if (req.method !== "POST" || req.url !== "/selection") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    let body = "";
    let tooLarge = false;

    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
      if (body.length > MAX_BODY) {
        tooLarge = true;
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Body too large" }));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (tooLarge) {
        return;
      }

      // Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(body);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }

      // Validate shape
      const validationError = validateSelection(parsed);
      if (validationError) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: validationError }));
        return;
      }

      lastSelection = parsed as Selection;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));

      // Show quick info in the status bar
      const nFrames = normalizeFrames(lastSelection);
      const rendered = findRenderedBy(nFrames);
      if (rendered) {
        const label = lastSelection.domLabel ?? "(unknown)";
        vscode.window.setStatusBarMessage(
          `React Grab: received "${label}" — ${nFrames.length} frames`,
          5000
        );
      }
    });
  });

  server.listen(3344, "127.0.0.1", () => {
    serverRunning = true;
    updateStatusBar();
    vscode.window.showInformationMessage(
      "React Grab Bridge started on 127.0.0.1:3344"
    );
  });

  server.on("error", (err) => {
    vscode.window.showErrorMessage(
      `React Grab Bridge error: ${err.message}`
    );
    server = null;
    serverRunning = false;
    updateStatusBar();
  });
}

function stopServer(): void {
  if (!server) {
    vscode.window.showInformationMessage("React Grab Bridge is not running.");
    return;
  }
  server.close(() => {
    server = null;
    serverRunning = false;
    updateStatusBar();
    vscode.window.showInformationMessage("React Grab Bridge stopped.");
  });
}

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

function validateSelection(data: unknown): string | null {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return "Body must be a JSON object";
  }

  const obj = data as Record<string, unknown>;

  // domLabel: string | null
  if (obj.domLabel !== null && typeof obj.domLabel !== "string") {
    return "domLabel must be a string or null";
  }

  // frames: array
  if (!Array.isArray(obj.frames)) {
    return "frames must be an array";
  }
  if (obj.frames.length < 1) {
    return "frames must have at least 1 entry";
  }

  for (let i = 0; i < obj.frames.length; i++) {
    const f = obj.frames[i];
    if (typeof f !== "object" || f === null || Array.isArray(f)) {
      return `frames[${i}] must be an object`;
    }
    const frame = f as Record<string, unknown>;
    if (typeof frame.raw !== "string") {
      return `frames[${i}].raw must be a string`;
    }
    if (frame.name !== null && typeof frame.name !== "string") {
      return `frames[${i}].name must be a string or null`;
    }
    if (typeof frame.file !== "string") {
      return `frames[${i}].file must be a string`;
    }
    if (
      typeof frame.line !== "number" ||
      !Number.isInteger(frame.line) ||
      frame.line < 1
    ) {
      return `frames[${i}].line must be a positive integer`;
    }
    if (
      typeof frame.col !== "number" ||
      !Number.isInteger(frame.col) ||
      frame.col < 1
    ) {
      return `frames[${i}].col must be a positive integer`;
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Status bar                                                         */
/* ------------------------------------------------------------------ */

function updateStatusBar(): void {
  statusBarItem.text = serverRunning
    ? "$(radio-tower) React Grab: On"
    : "$(circle-slash) React Grab: Off";
  statusBarItem.tooltip = serverRunning
    ? "Click to stop React Grab Bridge"
    : "Click to start React Grab Bridge";
  statusBarItem.command = serverRunning
    ? "reactGrab.stopBridge"
    : "reactGrab.startBridge";
}

/* ------------------------------------------------------------------ */
/*  QuickPick                                                          */
/* ------------------------------------------------------------------ */

async function showQuickPick(): Promise<void> {
  if (!lastSelection) {
    vscode.window.showWarningMessage(
      "React Grab: no selection received yet."
    );
    return;
  }

  const nFrames = normalizeFrames(lastSelection);
  const rendered = findRenderedBy(nFrames);
  const usedIn = rendered ? findUsedIn(nFrames, rendered) : null;

  const items: vscode.QuickPickItem[] = [];

  // Special entries at top
  if (rendered) {
    const r = rendered.frame;
    items.push({
      label: `$(arrow-right) Rendered by: ${r.name ?? "(anonymous)"} — ${r.normalizedFile}:${r.line}:${r.col}`,
      description: "best component that rendered the element",
      detail: r.raw,
    });
  }
  if (usedIn) {
    items.push({
      label: `$(arrow-up) Used in: ${usedIn.name ?? "(anonymous)"} — ${usedIn.normalizedFile}:${usedIn.line}:${usedIn.col}`,
      description: "parent / consumer frame",
      detail: usedIn.raw,
    });
  }

  // Separator
  items.push({ label: "", kind: vscode.QuickPickItemKind.Separator });

  // All frames
  for (const f of nFrames) {
    items.push({
      label: `${f.name ?? "(anonymous)"} — ${f.normalizedFile}:${f.line}:${f.col}`,
      detail: f.raw,
    });
  }

  const picked = await vscode.window.showQuickPick(items, {
    title: "React Grab: Open Frame",
    placeHolder: "Select a frame to open…",
  });

  if (!picked) {
    return;
  }

  // Find the matching frame
  if (rendered && picked.label.startsWith("$(arrow-right)")) {
    await openAtLineCol(
      rendered.frame.normalizedFile,
      rendered.frame.line,
      rendered.frame.col
    );
    return;
  }
  if (usedIn && picked.label.startsWith("$(arrow-up)")) {
    await openAtLineCol(usedIn.normalizedFile, usedIn.line, usedIn.col);
    return;
  }

  // Match from frame list
  const match = nFrames.find(
    (f) =>
      `${f.name ?? "(anonymous)"} — ${f.normalizedFile}:${f.line}:${f.col}` ===
      picked.label
  );
  if (match) {
    await openAtLineCol(match.normalizedFile, match.line, match.col);
  }
}

/* ------------------------------------------------------------------ */
/*  Activation                                                         */
/* ------------------------------------------------------------------ */

export function activate(context: vscode.ExtensionContext): void {
  // Status bar
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  updateStatusBar();
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("reactGrab.startBridge", () => {
      startServer();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("reactGrab.stopBridge", () => {
      stopServer();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("reactGrab.openRenderedBy", async () => {
      if (!lastSelection) {
        vscode.window.showWarningMessage(
          "React Grab: no selection received yet."
        );
        return;
      }
      const nFrames = normalizeFrames(lastSelection);
      const rendered = findRenderedBy(nFrames);
      if (!rendered) {
        vscode.window.showWarningMessage(
          "React Grab: could not determine rendered-by target."
        );
        return;
      }
      await openAtLineCol(
        rendered.frame.normalizedFile,
        rendered.frame.line,
        rendered.frame.col
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("reactGrab.openUsedIn", async () => {
      if (!lastSelection) {
        vscode.window.showWarningMessage(
          "React Grab: no selection received yet."
        );
        return;
      }
      const nFrames = normalizeFrames(lastSelection);
      const rendered = findRenderedBy(nFrames);
      if (!rendered) {
        vscode.window.showWarningMessage(
          "React Grab: could not determine rendered-by target."
        );
        return;
      }
      const usedIn = findUsedIn(nFrames, rendered);
      await openAtLineCol(usedIn.normalizedFile, usedIn.line, usedIn.col);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("reactGrab.openFrame", async () => {
      await showQuickPick();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("reactGrab.showLastSelection", () => {
      if (!lastSelection) {
        vscode.window.showWarningMessage(
          "React Grab: no selection received yet."
        );
        return;
      }
      const nFrames = normalizeFrames(lastSelection);
      const rendered = findRenderedBy(nFrames);
      const usedIn = rendered ? findUsedIn(nFrames, rendered) : null;

      const lines: string[] = [];
      lines.push(
        `DOM: ${lastSelection.domLabel ?? "(none)"} | Frames: ${nFrames.length}`
      );
      if (rendered) {
        lines.push(
          `Rendered by: ${rendered.frame.name ?? "(anon)"} @ ${rendered.frame.normalizedFile}:${rendered.frame.line}:${rendered.frame.col}`
        );
      }
      if (usedIn) {
        lines.push(
          `Used in: ${usedIn.name ?? "(anon)"} @ ${usedIn.normalizedFile}:${usedIn.line}:${usedIn.col}`
        );
      }
      vscode.window.showInformationMessage(lines.join(" | "));
    })
  );
}

/* ------------------------------------------------------------------ */
/*  Deactivation                                                       */
/* ------------------------------------------------------------------ */

export function deactivate(): void {
  if (server) {
    server.close();
    server = null;
    serverRunning = false;
  }
}
