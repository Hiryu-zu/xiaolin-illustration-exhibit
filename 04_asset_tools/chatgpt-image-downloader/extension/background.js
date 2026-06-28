const HOST_NAME = "com.local.chatgpt_image_downloader";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "startDownload") return false;

  runDownload(message)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) => sendResponse({ ok: false, error: error.message || String(error) }));

  return true;
});

async function runDownload({ chatUrl, folder, prefix }) {
  const tab = await openOrFocusChat(chatUrl);
  const images = await scanImages(tab.id, Boolean(message.includeUploads));
  if (!images.length) {
    throw new Error("No generated ChatGPT images were found. Open the chat manually and try again if it is still loading.");
  }

  const cookieHeader = await buildCookieHeader("https://chatgpt.com/");
  if (!cookieHeader) {
    throw new Error("No chatgpt.com cookies were available. Sign in to ChatGPT in Chrome first.");
  }

  return await sendNativeMessage({
    type: "download",
    sourceUrl: chatUrl,
    folder,
    prefix,
    cookieHeader,
    images
  });
}

async function openOrFocusChat(chatUrl) {
  const existing = await chrome.tabs.query({ url: "https://chatgpt.com/*" });
  const exact = existing.find((tab) => tab.url === chatUrl);
  const tab = exact || await chrome.tabs.create({ url: chatUrl, active: true });
  if (exact) await chrome.tabs.update(tab.id, { active: true });
  await waitForTabComplete(tab.id);
  await delay(2500);
  return await chrome.tabs.get(tab.id);
}

function waitForTabComplete(tabId) {
  return new Promise((resolve) => {
    const timeout = setTimeout(done, 30000);
    function done() {
      clearTimeout(timeout);
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }
    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === "complete") done();
    }
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.get(tabId, (tab) => {
      if (tab?.status === "complete") done();
    });
  });
}

async function scanImages(tabId, includeUploads) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: scanChatGptPage,
    args: [includeUploads]
  });
  return result || [];
}

async function buildCookieHeader(url) {
  const cookies = await chrome.cookies.getAll({ url });
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

function sendNativeMessage(payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendNativeMessage(HOST_NAME, payload, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response?.ok) {
        reject(new Error(response?.error || "Native host failed."));
        return;
      }
      resolve(response);
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scanChatGptPage(includeUploads) {
  const byId = new Map();

  function fileIdFromUrl(url) {
    try {
      return new URL(url).searchParams.get("id");
    } catch {
      return null;
    }
  }

  function rememberVisibleImages() {
    for (const img of Array.from(document.images)) {
      const src = img.currentSrc || img.src || "";
      if (!src.includes("/backend-api/estuary/content")) continue;

      const fileId = fileIdFromUrl(src);
      if (!fileId) continue;

      const alt = img.alt || "";
      const width = img.naturalWidth || img.width || 0;
      const height = img.naturalHeight || img.height || 0;
      const area = width * height;
      const generated = /生成|画像が生成|generated image/i.test(alt) || width >= 256 || height >= 256;
      const fileNameLikeAlt = /\.(jpe?g|png|webp)$/i.test(alt) || /^[0-9a-f-]{20,}\.(jpe?g|png|webp)$/i.test(alt);
      if (!generated) continue;
      if (!includeUploads && fileNameLikeAlt) continue;

      const existing = byId.get(fileId);
      if (!existing || area > existing.area) {
        byId.set(fileId, { fileId, url: src, alt, width, height, area });
      }
    }
  }

  function getBestScroller() {
    const nodes = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      ...Array.from(document.querySelectorAll("main, [role='main'], div"))
    ].filter(Boolean);
    let best = document.scrollingElement || document.documentElement;
    let bestScrollable = 0;
    for (const node of nodes) {
      const style = getComputedStyle(node);
      const canScroll = /(auto|scroll|overlay)/.test(`${style.overflowY} ${style.overflow}`);
      const scrollable = Math.max(0, node.scrollHeight - node.clientHeight);
      if ((canScroll || scrollable > 0) && scrollable > bestScrollable) {
        best = node;
        bestScrollable = scrollable;
      }
    }
    return best;
  }

  async function pause(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  let scroller = getBestScroller();
  scroller.scrollTop = 0;
  window.scrollTo(0, 0);
  await pause(1000);

  let unchangedSteps = 0;
  let previousTop = -1;
  let previousCount = 0;

  for (let i = 0; i < 80; i += 1) {
    scroller = getBestScroller();
    rememberVisibleImages();

    const beforeTop = scroller.scrollTop || window.scrollY || 0;
    const delta = Math.max(700, Math.round((scroller.clientHeight || window.innerHeight || 900) * 0.85));
    scroller.scrollTop = beforeTop + delta;
    window.scrollBy(0, delta);
    await pause(900);
    rememberVisibleImages();

    const afterTop = scroller.scrollTop || window.scrollY || 0;
    const count = byId.size;
    if (Math.abs(afterTop - previousTop) < 20 && count === previousCount) {
      unchangedSteps += 1;
    } else {
      unchangedSteps = 0;
    }
    previousTop = afterTop;
    previousCount = count;

    const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const nearBottom = afterTop + (scroller.clientHeight || window.innerHeight || 0) >= max - 40;
    if (i > 12 && unchangedSteps >= 6 && nearBottom) break;
  }

  for (let i = 0; i < 12; i += 1) {
    scroller = getBestScroller();
    const delta = -Math.max(700, Math.round((scroller.clientHeight || window.innerHeight || 900) * 0.85));
    scroller.scrollTop = (scroller.scrollTop || 0) + delta;
    window.scrollBy(0, delta);
    await pause(350);
    rememberVisibleImages();
  }

  return Array.from(byId.values()).map(({ area, ...image }) => image);
}
