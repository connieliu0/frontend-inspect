// Runs in MAIN world (injected) — full pick flow with direct access to elements + React
import { getReactStack, resolveElementInfo } from "element-source";
import { isSourceFile, normalizeFileName } from "bippy/source";

const TOGGLE_EVENT = "react-grab-toggle";

let pickMode = false;
let lastHovered = null;

document.addEventListener(TOGGLE_EVENT, (e) => {
  pickMode = e.detail?.on ?? !pickMode;
  document.body.style.cursor = pickMode ? "crosshair" : "";
  if (!pickMode && lastHovered) {
    lastHovered.style.outline = "";
    lastHovered = null;
  }
});

document.addEventListener("mouseover", (e) => {
  if (!pickMode) return;
  if (lastHovered) lastHovered.style.outline = "";
  lastHovered = e.target;
  lastHovered.style.outline = "2px solid blue";
});

document.addEventListener("mouseout", (e) => {
  if (!pickMode) return;
  e.target.style.outline = "";
});

document.addEventListener("click", async (e) => {
  if (!pickMode) return;
  e.preventDefault();
  e.stopPropagation();

  if (lastHovered) lastHovered.style.outline = "";
  pickMode = false;
  document.body.style.cursor = "";

  try {
    const info = await resolveElementInfo(e.target);
    if (!info?.source) return;
    // Prefer the frame with the highest line number — usually the actual JSX render
    // site (e.g. <header>{weeks}</header>) rather than the variable declaration
    const rawStack = await getReactStack(e.target);
    const sourceFrames = (rawStack ?? [])
      .filter((f) => f.fileName && isSourceFile(f.fileName))
      .map((f) => ({
        filePath: normalizeFileName(f.fileName),
        lineNumber: f.lineNumber ?? null,
        columnNumber: f.columnNumber ?? null,
      }));
    const best =
      sourceFrames.length > 0
        ? sourceFrames.reduce((a, b) =>
            (b.lineNumber ?? 0) > (a.lineNumber ?? 0) ? b : a
          )
        : info.source;
    const { filePath, lineNumber, columnNumber } = best;
    const line = lineNumber ?? 1;
    const col = columnNumber ?? 1;
    const configEl = document.getElementById("react-grab-config");
    const root = (configEl?.dataset?.projectRoot || "").trim().replace(/\/$/, "");
    if (!root) {
      alert("Set your project path: right-click the React Grab icon → Options");
      return;
    }
    const fullPath = `${root}/${filePath.replace(/^\//, "")}`;
    const url = `cursor://file/${fullPath}:${line}:${col}`;
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.href = url;
  } catch (err) {
    // Silently ignore
  }
}, true);
