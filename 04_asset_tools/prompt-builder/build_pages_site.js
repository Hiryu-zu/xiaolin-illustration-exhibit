const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const docsDir = path.join(root, "docs");
const assetsDir = path.join(docsDir, "assets", "images");
const conceptAssetsDir = path.join(docsDir, "assets", "concepts");
const promptPagesDir = path.join(docsDir, "prompts");
const conceptPagesDir = path.join(docsDir, "concepts");
const sourceHtmlDir = path.join(root, "article_materials", "html");
const dataDir = path.join(root, "article_materials", "prompt_data");
const libraryImagesDir = path.join(root, "library", "images");
const conceptBatchDir = path.join(root, "prompt_lab", "batches", "martial_visual_concepts_001");
const conceptItemsPath = path.join(conceptBatchDir, "batch_items.json");
const conceptTaxonomyPath = path.join(conceptBatchDir, "concept_taxonomy.json");
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
  return String(value ?? "")
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
    fs.copyFileSync(src, path.join(assetsDir, item.libraryImageFile));
    imageMap.set(item.imageFile, `../assets/images/${item.libraryImageFile}`);
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
  const body = markdownToHtml(fs.readFileSync(noteArticlePath, "utf8"));
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>武術ポーズのプロンプト集</title>
  <link rel="stylesheet" href="site.css">
</head>
<body>
  <nav><a href="index.html">Home</a><a href="prompts/index.html">Prompt Viewer</a><a href="concepts/index.html">Concepts</a></nav>
  <main class="article">${body}</main>
</body>
</html>
`;
  fs.writeFileSync(path.join(docsDir, "article.html"), html, "utf8");
}

function loadConceptData() {
  if (!fs.existsSync(conceptItemsPath) || !fs.existsSync(conceptTaxonomyPath)) {
    return { items: [], taxonomy: null };
  }
  return {
    items: readJson(conceptItemsPath),
    taxonomy: readJson(conceptTaxonomyPath),
  };
}

function conceptAssetName(item) {
  return path.basename(item.libraryImagePath || "");
}

function conceptPageName(item) {
  return `${item.id}.html`;
}

function copyConceptAssets(items) {
  fs.mkdirSync(conceptAssetsDir, { recursive: true });
  let copied = 0;
  for (const item of items) {
    if (!item.libraryImagePath) continue;
    const src = path.join(root, item.libraryImagePath);
    const destName = conceptAssetName(item);
    if (!destName || !fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(conceptAssetsDir, destName));
    copied += 1;
  }
  return copied;
}

function conceptThemeEntries(taxonomy) {
  if (!taxonomy) return [];
  return (taxonomy.themeOrder || Object.keys(taxonomy.themes || {})).map((key) => {
    const value = taxonomy.themes?.[key];
    return {
      key,
      label: typeof value === "string" ? value : value?.label || key,
      description: typeof value === "string" ? "" : value?.description || "",
    };
  });
}

function conceptThemeMap(taxonomy) {
  return new Map(conceptThemeEntries(taxonomy).map((theme) => [theme.key, theme]));
}

function buildConceptDetailPages(items, taxonomy) {
  const themesByKey = conceptThemeMap(taxonomy);
  for (const item of items) {
    const title = item.titleJa || item.title;
    const imageName = conceptAssetName(item);
    const theme = themesByKey.get(item.primary) || { label: item.themeLabel || item.primary, description: "" };
    const focus = (item.gptFocus || []).map((value) => `<li>${escapeHtml(value)}</li>`).join("");
    const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="../site.css">
</head>
<body>
  <nav><a href="../index.html">Home</a><a href="index.html">Concepts</a><a href="../prompts/index.html">Prompt Viewer</a><a href="../article.html">Note Draft</a></nav>
  <main class="detail-page">
    <p class="breadcrumb"><a href="index.html#${escapeHtml(item.primary)}">Concepts</a> / ${escapeHtml(theme.label)}</p>
    <section class="detail-layout">
      <figure class="detail-image">
        <img src="../assets/concepts/${escapeHtml(imageName)}" alt="${escapeHtml(title)}">
      </figure>
      <article class="detail-body">
        <p class="theme-badge">${escapeHtml(theme.label)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(item.observation || "")}</p>
        <h2>注目ポイント</h2>
        <ul class="focus-list detail-focus">${focus}</ul>
        <h2>個別プロンプト</h2>
        <pre class="prompt-text"><code>${escapeHtml(item.promptJa || "")}</code></pre>
      </article>
    </section>
  </main>
</body>
</html>
`;
    fs.writeFileSync(path.join(conceptPagesDir, conceptPageName(item)), html, "utf8");
  }
}

function buildConceptsPage(items, taxonomy) {
  if (!items.length || !taxonomy) return;
  fs.mkdirSync(conceptPagesDir, { recursive: true });
  const themeEntries = conceptThemeEntries(taxonomy);
  const themesByKey = new Map(themeEntries.map((theme) => [theme.key, theme]));
  const grouped = new Map(themeEntries.map((theme) => [theme.key, []]));
  for (const item of items) {
    const key = item.primary || item.themes?.[0] || "unclassified";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }

  const nav = themeEntries.map((theme) => {
    const count = grouped.get(theme.key)?.length || 0;
    return `<a class="button" href="#${escapeHtml(theme.key)}">${escapeHtml(theme.label)} (${count})</a>`;
  }).join("\n");

  const sections = Array.from(grouped.entries())
    .filter(([, themeItems]) => themeItems.length > 0)
    .map(([key, themeItems]) => {
      const theme = themesByKey.get(key) || { label: key, description: "" };
      const cards = themeItems.map((item) => {
        const imageName = conceptAssetName(item);
        const title = item.titleJa || item.title;
        return `
          <article class="card concept-card" id="${escapeHtml(item.id)}">
            <a href="${escapeHtml(conceptPageName(item))}">
              <img src="../assets/concepts/${escapeHtml(imageName)}" alt="${escapeHtml(title)}">
              <h3>${escapeHtml(title)}</h3>
            </a>
            <p>${escapeHtml(item.observation || "")}</p>
            <a class="text-link" href="${escapeHtml(conceptPageName(item))}">プロンプトを見る</a>
          </article>`;
      }).join("\n");
      return `
        <section id="${escapeHtml(key)}" class="theme-section">
          <header>
            <h2>${escapeHtml(theme.label)}</h2>
            <p>${escapeHtml(theme.description)}</p>
          </header>
          <div class="grid">${cards}</div>
        </section>`;
    }).join("\n");

  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>コンセプト仕分け一覧</title>
  <link rel="stylesheet" href="../site.css">
</head>
<body>
  <nav><a href="../index.html">Home</a><a href="../prompts/index.html">Prompt Viewer</a><a href="index.html">Concepts</a><a href="../article.html">Note Draft</a></nav>
  <header class="hero">
    <h1>コンセプト仕分け一覧</h1>
    <p>各画像をクリックすると、個別プロンプトを確認できます。代表テーマは1枚につき1つだけに整理しています。</p>
  </header>
  <main>
    <section class="links">${nav}</section>
    ${sections}
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(conceptPagesDir, "index.html"), html, "utf8");
  buildConceptDetailPages(items, taxonomy);
}

function buildHome(items, conceptItems, taxonomy) {
  const conceptThemes = conceptThemeEntries(taxonomy)
    .map((theme) => `${theme.label}: ${conceptItems.filter((item) => item.primary === theme.key).length}`)
    .join(" / ");
  const promptCards = items.map((item) => `
    <article class="card">
      <a href="prompts/${escapeHtml(item.id)}_prompt_switcher.html">
        <img src="assets/images/${escapeHtml(item.libraryImageFile)}" alt="${escapeHtml(item.title)}">
        <h2>${escapeHtml(item.title)}</h2>
      </a>
      <p>${escapeHtml(item.caption || "")}</p>
    </article>`).join("\n");
  const conceptCards = conceptItems.map((item) => {
    const title = item.titleJa || item.title;
    return `
    <article class="card">
      <a href="concepts/${escapeHtml(conceptPageName(item))}">
        <img src="assets/concepts/${escapeHtml(conceptAssetName(item))}" alt="${escapeHtml(title)}">
        <h2>${escapeHtml(title)}</h2>
      </a>
      <p>${escapeHtml(item.themeLabel || "")}</p>
    </article>`;
  }).join("\n");
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>小鈴イラスト展 プロンプト資料</title>
  <link rel="stylesheet" href="site.css">
</head>
<body>
  <nav><a href="index.html">Home</a><a href="prompts/index.html">Prompt Viewer</a><a href="concepts/index.html">Concepts</a><a href="article.html">Note Draft</a></nav>
  <header class="hero">
    <h1>小鈴イラスト展 プロンプト資料</h1>
    <p>武術ポーズ、構図、光、モーションを整理した制作資料です。画像カードをクリックすると各プロンプトを確認できます。</p>
  </header>
  <main>
    <section class="links">
      <a class="button" href="prompts/index.html">プロンプト切り替えHTMLを見る</a>
      <a class="button" href="concepts/index.html">コンセプト仕分けを見る</a>
      <a class="button" href="article.html">note記事下書きHTMLを見る</a>
    </section>
    <section class="summary-panel">
      <h2>今回の仕分け</h2>
      <p>${escapeHtml(conceptThemes)}</p>
    </section>
    <section class="home-section">
      <h2>今回分の個別プロンプト</h2>
      <div class="grid">${conceptCards}</div>
    </section>
    <section class="home-section">
      <h2>記事用プロンプト</h2>
      <div class="grid">${promptCards}</div>
    </section>
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
nav { background: #fff; border-bottom: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 16px; padding: 12px 24px; position: sticky; top: 0; z-index: 2; }
a { color: var(--accent); }
nav a, .button, .text-link { color: var(--accent); font-weight: 700; text-decoration: none; }
.hero, main { margin: 0 auto; max-width: 1180px; padding: 24px; }
.hero h1 { font-size: 32px; margin: 0 0 8px; }
.hero p, .card p { color: var(--muted); }
.links { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.button { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; }
.grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; padding-bottom: 12px; }
.card a { color: inherit; display: block; text-decoration: none; }
.card img { aspect-ratio: 4 / 5; display: block; object-fit: cover; width: 100%; }
.card h2 { font-size: 16px; line-height: 1.35; margin: 12px 12px 6px; }
.card h3 { font-size: 15px; line-height: 1.35; margin: 12px 12px 6px; }
.card p { font-size: 13px; margin: 0 12px; }
.text-link { display: inline-block; font-size: 13px; margin: 10px 12px 0; }
.concept-card img { aspect-ratio: 1 / 1; }
.focus-list { color: var(--muted); font-size: 13px; margin: 10px 12px 0; padding-left: 18px; }
.summary-panel, .theme-section, .home-section { margin-bottom: 28px; }
.summary-panel { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 16px; }
.theme-section > header, .home-section > h2 { margin-bottom: 12px; }
.theme-section h2, .summary-panel h2, .home-section h2 { font-size: 22px; margin: 0 0 6px; }
.theme-section p, .summary-panel p { color: var(--muted); margin: 0; }
.article { max-width: 880px; }
.article h1 { font-size: 30px; line-height: 1.3; }
.article h2 { border-top: 1px solid var(--line); margin-top: 36px; padding-top: 20px; }
figure { margin: 20px 0; }
figure img { border-radius: 8px; max-width: 100%; }
figcaption { color: var(--muted); font-size: 13px; margin-top: 6px; }
pre { background: #fff; border: 1px solid var(--line); border-radius: 8px; overflow:auto; padding: 12px; white-space: pre-wrap; }
details { background:#fff; border:1px solid var(--line); border-radius:8px; margin: 14px 0; padding: 12px; }
summary { cursor: pointer; font-weight: 700; }
.breadcrumb { color: var(--muted); font-size: 13px; margin: 0 0 16px; }
.detail-layout { align-items: start; display: grid; gap: 24px; grid-template-columns: minmax(280px, 44%) 1fr; }
.detail-image { margin: 0; }
.detail-image img { background: #fff; border: 1px solid var(--line); width: 100%; }
.detail-body { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 20px; }
.detail-body h1 { font-size: 28px; line-height: 1.3; margin: 8px 0 12px; }
.detail-body h2 { font-size: 18px; margin: 22px 0 8px; }
.detail-focus { margin-left: 0; }
.theme-badge { color: var(--accent); font-size: 13px; font-weight: 700; margin: 0; }
.prompt-text { font-size: 14px; line-height: 1.8; }
@media (max-width: 760px) {
  .detail-layout { grid-template-columns: 1fr; }
}
`;
  fs.writeFileSync(path.join(docsDir, "site.css"), css, "utf8");
}

function main() {
  resetDir(docsDir);
  fs.mkdirSync(assetsDir, { recursive: true });
  const items = loadPromptItems();
  const imageMap = copyPromptAssets(items);
  copyPromptHtml(imageMap);
  const { items: conceptItems, taxonomy } = loadConceptData();
  const conceptAssets = copyConceptAssets(conceptItems);
  buildConceptsPage(conceptItems, taxonomy);
  buildArticlePage();
  buildHome(items, conceptItems, taxonomy);
  buildCss();
  fs.writeFileSync(path.join(docsDir, ".nojekyll"), "", "utf8");
  console.log(JSON.stringify({ docsDir, promptItems: items.length, assets: imageMap.size, conceptItems: conceptItems.length, conceptAssets }, null, 2));
}

main();
