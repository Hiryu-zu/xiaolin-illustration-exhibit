const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

let input = Buffer.alloc(0);

process.stdin.on("data", (chunk) => {
  input = Buffer.concat([input, chunk]);
  readMessages().catch((error) => writeMessage({ ok: false, error: error.message || String(error) }));
});

async function readMessages() {
  while (input.length >= 4) {
    const length = input.readUInt32LE(0);
    if (input.length < 4 + length) return;
    const body = input.slice(4, 4 + length).toString("utf8");
    input = input.slice(4 + length);
    const message = JSON.parse(body);
    const response = await handleMessage(message);
    writeMessage({ ok: true, ...response });
  }
}

async function handleMessage(message) {
  if (message.type !== "download") {
    throw new Error(`Unsupported message type: ${message.type}`);
  }
  if (!message.folder || typeof message.folder !== "string") {
    throw new Error("A save folder is required.");
  }
  if (!Array.isArray(message.images) || message.images.length === 0) {
    throw new Error("No images were provided.");
  }

  const folder = path.resolve(message.folder);
  await fsp.mkdir(folder, { recursive: true });

  const prefix = sanitizeName(message.prefix || "chatgpt_image");
  const saved = [];
  const failed = [];
  const skipped = new Set();

  let index = 1;
  for (const image of message.images) {
    if (!image?.url || !image?.fileId) continue;
    if (skipped.has(image.fileId)) continue;
    skipped.add(image.fileId);

    try {
      const response = await fetch(image.url, {
        headers: {
          Cookie: message.cookieHeader || "",
          "User-Agent": "Mozilla/5.0 ChatGPTImageDownloader/0.1"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const contentType = response.headers.get("content-type") || "";
      const extension = extensionFromContentType(contentType);
      const buffer = Buffer.from(await response.arrayBuffer());
      const suffix = image.fileId.slice(-8);
      const fileName = `${prefix}_${String(index).padStart(3, "0")}_${suffix}${extension}`;
      const filePath = uniquePath(path.join(folder, fileName));
      await fsp.writeFile(filePath, buffer);
      saved.push({
        index,
        fileId: image.fileId,
        fileName: path.basename(filePath),
        path: filePath.replace(/\\/g, "/"),
        contentType,
        width: image.width || null,
        height: image.height || null,
        alt: image.alt || ""
      });
      index += 1;
    } catch (error) {
      failed.push({
        fileId: image.fileId,
        url: image.url,
        error: error.message || String(error)
      });
    }
  }

  const manifestPath = path.join(folder, "chatgpt_images_manifest.json");
  await fsp.writeFile(
    manifestPath,
    JSON.stringify(
      {
        source: message.sourceUrl || "",
        savedAt: new Date().toISOString(),
        savedCount: saved.length,
        failedCount: failed.length,
        saved,
        failed
      },
      null,
      2
    ),
    "utf8"
  );

  return {
    folder,
    manifestPath: manifestPath.replace(/\\/g, "/"),
    savedCount: saved.length,
    skippedCount: message.images.length - skipped.size,
    failedCount: failed.length
  };
}

function writeMessage(message) {
  const body = Buffer.from(JSON.stringify(message), "utf8");
  const header = Buffer.alloc(4);
  header.writeUInt32LE(body.length, 0);
  process.stdout.write(Buffer.concat([header, body]));
}

function extensionFromContentType(contentType) {
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  return ".img";
}

function sanitizeName(value) {
  return String(value).replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").slice(0, 80) || "chatgpt_image";
}

function uniquePath(filePath) {
  if (!fs.existsSync(filePath)) return filePath;
  const parsed = path.parse(filePath);
  for (let i = 2; i < 10000; i += 1) {
    const candidate = path.join(parsed.dir, `${parsed.name}_${i}${parsed.ext}`);
    if (!fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Could not choose a unique file name for ${filePath}`);
}
