document.getElementById("save").onclick = async () => {
  const path = document.getElementById("projectRoot").value.trim();
  await chrome.storage.local.set({ projectRoot: path });
  document.getElementById("status").textContent = path ? "Saved." : "Cleared.";
};

chrome.storage.local.get("projectRoot").then(({ projectRoot }) => {
  document.getElementById("projectRoot").value = projectRoot || "";
});
