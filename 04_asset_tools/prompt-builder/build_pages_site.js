const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const docsDir = path.join(root, "docs");
const assetsDir = path.join(docsDir, "assets", "images");
const promptPagesDir = path.join(docsDir, "prompts");
const sourceHtmlDir = path.join(root, "article_materials", "html");
const dataDir = path.join(root, "article_materials", "prompt_data");
const libraryImagesDir = path.join(root, "library", "images");
const noteArticlePath = path.join(root, "article_materials", "note_article", "martial_arts_pose_prompt_article.md");
const noteImagesDir = path.join(root, "article_materials", "note_article", "images");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadPromptItems() {
  return fs.readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => readJson(path.join(dataDir, file)))
    .sort((a, b) => (a.noteOrder ?? 9999) - (b.noteOrder ?? 9999));
}

function copyPromptAssets(items) {
  const imageMap = new Map();
  for (const item of items) {
    if (!item.imageFile || !item.libraryImageFile) continue;
    const src = path.join(libraryImagesDir, item.libraryImageFile);
    if (!fs.existsSync(src)) continue;
    const destName = item.libraryImageFile;
    fs.copyFileSync(src, path.join(assetsDir, destName));
    imageMap.set(item.imageFile, `../assets/images/${destName}`);
  }
  return imageMap;
}

function copyPromptHtml(imageMap) {
  fs.mkdirSync(promptPagesDir, { recursive: true });
  const htmlFiles = fs.readdirSync(sourceHtmlDir).filter((file) => file.endsWith(".html"));
  for (const file of htmlFiles) {
    let html = fs.readFileSync(path.join(sourceHtmlDir, file), "utf8");
    for (const [sourceFile, pagesPath] of imageMap.entries()) {
      html = html.split(`../../selected/${sourceFile}`).join(pagesPath);
      html = html.split(`selected/${sourceFile}`).join(pagesPath);
    }
    fs.writeFileSync(path.join(promptPagesDir, file), html, "utf8");
  }
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inCode = false;
  let inList = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (!inCode) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        html.push("<pre><code>");
        inCode = true;
      } else {
        html.push("</code></pre>");
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      html.push(escapeHtml(line));
      continue;
    }
    const image = line.match(/^!\[(.*)]\((.*)\)$/);
    if (image) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      const alt = image[1];
      const src = image[2].replace(/^images\//, "assets/note-images/");
      html.push(`<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"><figcaption>${escapeHtml(alt)}</figcaption></figure>`);
      continue;
    }
    if (/^###\s+/.test(line)) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`);
    } else if (/^##\s+/.test(line)) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`);
    } else if (/^#\s+/.test(line)) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h1>${escapeHtml(line.replace(/^#\s+/, ""))}</h1>`);
    } else if (/^- /.test(line)) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${escapeHtml(line.replace(/^- /, ""))}</li>`);
    } else if (/^<details>|^<\/details>|^<summary>/.test(line)) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(line);
    } else if (line.trim()) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<p>${escapeHtml(line).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`);
    }
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

function buildArticlePage() {
  if (!fs.existsSync(noteArticlePath)) return;
  const noteAssets = path.join(docsDir, "assets", "note-images");
  fs.mkdirSync(noteAssets, { recursive: true });
  for (const file of fs.readdirSync(noteImagesDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name))) {
    fs.copyFileSync(path.join(noteImagesDir, file), path.join(noteAssets, file));
  }
  const markdown = fs.readFileSync(noteArticlePath, "utf8");
  const body = markdownToHtml(markdown);
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>武術ポーズのプロンプト集</title>
  <link rel="stylesheet" href="site.css">
</head>
<body>
  <nav><a href="index.html">Home</a><a href="prompts/index.html">Prompt Viewer</a></nav>
  <main class="article">${body}</main>
</body>
</html>
`;
  fs.writeFileSync(path.join(docsDir, "article.html"), html, "utf8");
}

function buildHome(items) {
  const cards = items.map((item) => `
    <article class="card">
      <a href="prompts/${escapeHtml(item.id)}_prompt_switcher.html">
        <img src="assets/images/${escapeHtml(item.libraryImageFile)}" alt="${escapeHtml(item.title)}">
      </a>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.caption || "")}</p>
    </article>`).join("\n");
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>小鈴イラスト展 プロンプト資料</title>
  <link rel="stylesheet" href="site.css">
</head>
<body>
  <nav><a href="index.html">Home</a><a href="prompts/index.html">Prompt Viewer</a><a href="article.html">Note Draft</a></nav>
  <header class="hero">
    <h1>小鈴イラスト展 プロンプト資料</h1>
    <p>武術ポーズ、構図、光、モーションを整理したローカル制作資料のPages版です。</p>
  </header>
  <main>
    <section class="links">
      <a class="button" href="prompts/index.html">プロンプト切り替えHTMLを見る</a>
      <a class="button" href="article.html">note記事下書きHTMLを見る</a>
    </section>
    <section class="grid">${cards}</section>
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(docsDir, "index.html"), html, "utf8");
}

function buildCss() {
  const css = `:root { --bg:#f7f4ee; --panel:#fff; --ink:#1f252d; --muted:#667085; --line:#d9d2c7; --accent:#1f6f78; }
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--ink); font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; line-height: 1.65; }
nav { background: #fff; border-bottom: 1px solid var(--line); display: flex; gap: 16px; padding: 12px 24px; position: sticky; top: 0; z-index: 2; }
a { color: var(--accent); }
nav a, .button { color: var(--accent); font-weight: 700; text-decoration: none; }
.hero, main { margin: 0 auto; max-width: 1180px; padding: 24px; }
.hero h1 { font-size: 32px; margin: 0 0 8px; }
.hero p, .card p { color: var(--muted); }
.links { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.button { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; }
.grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; padding-bottom: 12px; }
.card img { aspect-ratio: 4 / 5; display: block; object-fit: cover; width: 100%; }
.card h2 { font-size: 16px; line-height: 1.35; margin: 12px 12px 6px; }
.card p { font-size: 13px; margin: 0 12px; }
.article { max-width: 880px; }
.article h1 { font-size: 30px; line-height: 1.3; }
.article h2 { border-top: 1px solid var(--line); margin-top: 36px; padding-top: 20px; }
figure { margin: 20px 0; }
figure img { border-radius: 8px; max-width: 100%; }
figcaption { color: var(--muted); font-size: 13px; margin-top: 6px; }
pre { background: #fff; border: 1px solid var(--line); border-radius: 8px; overflow:auto; padding: 12px; white-space: pre-wrap; }
details { background:#fff; border:1px solid var(--line); border-radius:8px; margin: 14px 0; padding: 12px; }
summary { cursor: pointer; font-weight: 700; }
`;
  fs.writeFileSync(path.join(docsDir, "site.css"), css, "utf8");
}

function main() {
  resetDir(docsDir);
  fs.mkdirSync(assetsDir, { recursive: true });
  const items = loadPromptItems();
  const imageMap = copyPromptAssets(items);
  copyPromptHtml(imageMap);
  buildArticlePage();
  buildHome(items);
  buildCss();
  fs.writeFileSync(path.join(docsDir, ".nojekyll"), "", "utf8");
  console.log(JSON.stringify({ docsDir, promptItems: items.length, assets: imageMap.size }, null, 2));
}

main();
