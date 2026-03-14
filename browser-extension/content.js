// Runs in ISOLATED world — injects MAIN script and forwards toggle from extension
const TOGGLE_EVENT = "react-grab-toggle";

function injectConfig(root) {
  let el = document.getElementById("react-grab-config");
  if (!el) {
    el = document.createElement("div");
    el.id = "react-grab-config";
    el.style.display = "none";
    (document.head || document.documentElement).appendChild(el);
  }
  el.dataset.projectRoot = root || "";
}

function injectMain() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("dist/content-main.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

chrome.storage.local.get("projectRoot").then(({ projectRoot }) => {
  injectConfig(projectRoot);
  injectMain();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "projectRoot" in changes) {
    injectConfig(changes.projectRoot.newValue);
  }
});

let pickMode = false;
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "TOGGLE_PICK_MODE") {
    pickMode = !pickMode;
    document.dispatchEvent(new CustomEvent(TOGGLE_EVENT, { detail: { on: pickMode }, bubbles: true }));
  }
});
