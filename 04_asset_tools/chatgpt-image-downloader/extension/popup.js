const chatUrlInput = document.getElementById("chatUrl");
const folderInput = document.getElementById("folder");
const prefixInput = document.getElementById("prefix");
const includeUploadsInput = document.getElementById("includeUploads");
const startButton = document.getElementById("start");
const statusBox = document.getElementById("status");

chrome.storage.local.get(["chatUrl", "folder", "prefix", "includeUploads"], (values) => {
  if (values.chatUrl) chatUrlInput.value = values.chatUrl;
  if (values.folder) folderInput.value = values.folder;
  if (values.prefix) prefixInput.value = values.prefix;
  includeUploadsInput.checked = Boolean(values.includeUploads);
});

function setStatus(text) {
  statusBox.textContent = text;
}

startButton.addEventListener("click", async () => {
  const chatUrl = chatUrlInput.value.trim();
  const folder = folderInput.value.trim();
  const prefix = prefixInput.value.trim() || "chatgpt_image";
  const includeUploads = includeUploadsInput.checked;

  if (!chatUrl || !folder) {
    setStatus("Chat URL and save folder are required.");
    return;
  }

  startButton.disabled = true;
  setStatus("Opening chat and scanning images...");
  chrome.storage.local.set({ chatUrl, folder, prefix, includeUploads });

  chrome.runtime.sendMessage(
    { type: "startDownload", chatUrl, folder, prefix, includeUploads },
    (response) => {
      startButton.disabled = false;
      if (chrome.runtime.lastError) {
        setStatus(`Error: ${chrome.runtime.lastError.message}`);
        return;
      }
      if (!response?.ok) {
        setStatus(`Error: ${response?.error || "Unknown error"}`);
        return;
      }
      const result = response.result;
      setStatus(
        [
          `Saved: ${result.savedCount}`,
          `Skipped: ${result.skippedCount}`,
          `Failed: ${result.failedCount}`,
          `Folder: ${result.folder}`,
          `Manifest: ${result.manifestPath}`
        ].join("\n")
      );
    }
  );
});
