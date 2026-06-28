const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const articleDir = path.join(root, "article_materials");
const dataDir = path.join(articleDir, "prompt_data");
const rulesDir = path.join(articleDir, "prompt_rules");
const htmlDir = path.join(articleDir, "html");
const mdDir = path.join(articleDir, "prompts");
const selectedDir = path.join(root, "selected");

async function main() {
  const arg = process.argv[2] || "xiaolin_009_1a7a89db.json";
  await ensureDirs();

  if (arg === "--init-selected") {
    const created = await initSelectedData();
    console.log(JSON.stringify({ created }, null, 2));
    return;
  }

  const rules = await loadRules();
  if (arg === "--all") {
    const items = await loadAllItems(rules);
    const outputs = [];
    for (const item of items) outputs.push(await writeItem(item));
    const indexPath = await writeIndex(items);
    console.log(JSON.stringify({ count: outputs.length, indexPath, outputs }, null, 2));
    return;
  }

  const item = await loadItem(arg, rules);
  const output = await writeItem(item);
  const indexPath = await writeIndex(await loadAllItems(rules));
  console.log(JSON.stringify({ ...output, indexPath }, null, 2));
}

async function ensureDirs() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(rulesDir, { recursive: true });
  await fs.mkdir(htmlDir, { recursive: true });
  await fs.mkdir(mdDir, { recursive: true });
}

async function readJson(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text.replace(/^\uFEFF/, ""));
}

async function loadRules() {
  const common = await readJson(path.join(rulesDir, "common_rules.json"));
  const character = await readJson(path.join(rulesDir, "xiaolin_character.json"));
  return { common, character };
}

async function loadItem(fileOrId, rules) {
  const fileName = fileOrId.endsWith(".json") ? fileOrId : `${fileOrId}.json`;
  const dataPath = path.isAbsolute(fileName) ? fileName : path.join(dataDir, fileName);
  return normalizeItem(await readJson(dataPath), rules);
}

async function loadAllItems(rules) {
  const files = (await fs.readdir(dataDir)).filter((name) => name.endsWith(".json")).sort();
  const items = [];
  for (const file of files) items.push(await loadItem(file, rules));
  return items.sort((a, b) => (a.noteOrder ?? 9999) - (b.noteOrder ?? 9999) || a.id.localeCompare(b.id));
}

function normalizeItem(item, rules) {
  const id = item.id || path.basename(item.image || "item", path.extname(item.image || ""));
  const imageFile = item.imageFile || `${id}.png`;
  return {
    category: "uncategorized",
    tags: [],
    noteOrder: 9999,
    noteSection: "未分類",
    status: "draft",
    subjectHandling: rules.common.defaults.subjectHandling,
    scene: rules.common.defaults.scene,
    pose: rules.common.defaults.pose,
    intent: rules.common.defaults.intent,
    composition: rules.common.defaults.composition,
    strengths: rules.common.defaults.strengths,
    motion: rules.common.defaults.motion,
    lighting: rules.common.defaults.lighting,
    mood: rules.common.defaults.mood,
    style: rules.common.defaults.style,
    details: rules.common.defaults.details,
    negative: rules.common.negative,
    reviewChecklist: rules.common.reviewChecklist,
    ...item,
    id,
    imageFile,
    image: item.image || `../../selected/${imageFile}`,
    imageForMarkdown: item.imageForMarkdown || `selected/${imageFile}`,
    fixedCharacter: item.fixedCharacter || rules.character
  };
}

async function writeItem(item) {
  const htmlPath = path.join(htmlDir, `${item.id}_prompt_switcher.html`);
  const mdPath = path.join(mdDir, `${item.id}_prompt.md`);
  await fs.writeFile(htmlPath, buildHtml(item), "utf8");
  await fs.writeFile(mdPath, buildMarkdown(item), "utf8");
  return { id: item.id, htmlPath, mdPath };
}

async function initSelectedData() {
  const files = (await fs.readdir(selectedDir)).filter((name) => /\.(png|jpe?g|webp)$/i.test(name)).sort();
  const existing = new Set((await fs.readdir(dataDir).catch(() => [])).filter((name) => name.endsWith(".json")));
  const created = [];
  let order = 1;
  for (const file of files) {
    const id = path.basename(file, path.extname(file));
    const dataFile = `${id}.json`;
    if (existing.has(dataFile)) {
      order += 1;
      continue;
    }
    const item = buildDefaultItem(id, file, order);
    await fs.writeFile(path.join(dataDir, dataFile), JSON.stringify(item, null, 2), "utf8");
    created.push(dataFile);
    order += 1;
  }
  return created;
}

function buildDefaultItem(id, imageFile, order) {
  return {
    id,
    title: `小鈴 選定イラスト ${String(order).padStart(2, "0")}`,
    imageFile,
    caption: "selectedフォルダから取り込んだ採用候補画像。構造データは後で画像を見ながら調整する。",
    category: "uncategorized",
    tags: ["要レビュー"],
    noteOrder: order,
    noteSection: "未分類",
    status: "draft",
    subjectHandling: {
      ja: "\u4EBA\u7269\u3001\u670D\u88C5\u3001\u9AEA\u578B\u3001\u4F53\u578B\u306F\u53C2\u8003\u753B\u50CF\u3092\u4FDD\u6301\u3059\u308B\u3002\u56FA\u5B9A\u30AD\u30E3\u30E9\u7248\u3060\u3051\u5225\u9014\u30AD\u30E3\u30E9\u6307\u5B9A\u3092\u52A0\u3048\u308B\u3002",
      en: "preserve the person, outfit, hairstyle, and body type from the reference image; only the fixed-character version adds separate character details"
    },
    scene: { ja: "\u753B\u50CF\u3092\u898B\u3066\u8A2D\u5B9A\u3059\u308B", en: "to be defined from the selected image" },
    pose: { ja: "\u753B\u50CF\u3092\u898B\u3066\u8A2D\u5B9A\u3059\u308B", en: "to be defined from the selected image" },
    intent: { ja: "\u753B\u50CF\u3092\u898B\u3066\u8A2D\u5B9A\u3059\u308B", en: "to be defined from the selected image" },
    composition: { ja: "\u753B\u50CF\u3092\u898B\u3066\u8A2D\u5B9A\u3059\u308B", en: "to be defined from the selected image" },
    strengths: {
      ja: ["\u753B\u50CF\u3092\u898B\u3066\u8A2D\u5B9A\u3059\u308B"],
      en: ["to be defined from the selected image"]
    },
    motion: { ja: "\u753B\u50CF\u3092\u898B\u3066\u8A2D\u5B9A\u3059\u308B", en: "to be defined from the selected image" },
    lighting: { ja: "\u753B\u50CF\u3092\u898B\u3066\u8A2D\u5B9A\u3059\u308B", en: "to be defined from the selected image" },
    mood: { ja: "\u753B\u50CF\u3092\u898B\u3066\u8A2D\u5B9A\u3059\u308B", en: "to be defined from the selected image" }
  };
}

function buildEnglishPrompt(item, fixed) {
  const parts = [
    "Use the reference image as the main guide for the character, outfit, hairstyle, body type, composition, and mood.",
    `Preserve ${item.subjectHandling.en}.`,
    `Create a high-quality anime-style illustration set in ${item.scene.en}. The pose/action is ${item.pose.en}, expressing ${item.intent.en}.`,
    `Composition: ${item.composition.en}. Emphasize ${joinListEn(item.strengths.en)}.`,
    `Keep ${item.motion.en}, ${item.lighting.en}, and ${item.mood.en}. The scene should feel quiet, focused, and cinematic rather than chaotic.`,
    `Use ${joinListEn(item.details.en)}, ${item.style.en}.`
  ];
  if (fixed) parts.push(buildEnglishCharacterBlock(item));
  parts.push(`Avoid ${joinListEn(item.negative.en)}.`);
  return parts.join("\n\n");
}

function buildJapanesePrompt(item, fixed) {
  const parts = [
    "\u53C2\u8003\u753B\u50CF\u3092\u3001\u4EBA\u7269\u30FB\u670D\u88C5\u30FB\u9AEA\u578B\u30FB\u4F53\u578B\u30FB\u69CB\u56F3\u30FB\u96F0\u56F2\u6C17\u306E\u4E3B\u306A\u30AC\u30A4\u30C9\u3068\u3057\u3066\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    `${item.subjectHandling.ja}`,
    `${item.scene.ja}\u3092\u821E\u53F0\u306B\u3001${item.pose.ja}\u5834\u9762\u3092\u3001\u30A2\u30CB\u30E1\u8ABF\u306E\u9AD8\u54C1\u8CEA\u30A4\u30E9\u30B9\u30C8\u3068\u3057\u3066\u63CF\u3044\u3066\u304F\u3060\u3055\u3044\u3002${item.intent.ja}\u304C\u4F1D\u308F\u308B\u3088\u3046\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
    `${item.composition.ja}\u3002\u898B\u3069\u3053\u308D\u3068\u3057\u3066\u3001${joinListJa(item.strengths.ja)}\u3092\u5F37\u8ABF\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
    `${item.motion.ja}\u3001${item.lighting.ja}\u3001${item.mood.ja}\u3092\u4FDD\u3063\u3066\u304F\u3060\u3055\u3044\u3002\u5834\u9762\u306F\u6DF7\u6C8C\u3068\u3057\u305F\u6226\u95D8\u3067\u306F\u306A\u304F\u3001\u96C6\u4E2D\u3057\u305F\u3001\u6620\u753B\u7684\u3067\u9759\u304B\u306A\u4E00\u77AC\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`,
    `${joinListJa(item.details.ja)}\u3001${item.style.ja}\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`
  ];
  if (fixed) parts.push(buildJapaneseCharacterBlock(item));
  parts.push(`${joinListJa(item.negative.ja)}\u306F\u907F\u3051\u3066\u304F\u3060\u3055\u3044\u3002`);
  return parts.join("\n\n");
}

function buildEnglishCharacterBlock(item) {
  const c = item.fixedCharacter.en;
  return `The martial artist is ${item.fixedCharacter.nameEn}, ${c.identity}. She has ${c.body}. She has ${c.hair}, ${c.eyes}, and ${c.face}.\n\nShe wears ${c.outfit}. Her expression and presence are ${c.personality}.`;
}

function buildJapaneseCharacterBlock(item) {
  const c = item.fixedCharacter.ja;
  return `武術家は${item.fixedCharacter.nameJa}です。${c.identity}。${c.body}です。${c.hair}。${c.eyes}で、${c.face}です。\n\n衣装は${c.outfit}です。表情と雰囲気は、${c.personality}にしてください。`;
}

function buildHtml(item) {
  const compact = {
    item,
    prompts: {
      englishGeneric: buildEnglishPrompt(item, false),
      englishFixed: buildEnglishPrompt(item, true),
      japaneseGeneric: buildJapanesePrompt(item, false),
      japaneseFixed: buildJapanesePrompt(item, true)
    }
  };

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(item.title)} - プロンプト切り替え</title>
    <style>${pageCss()}</style>
  </head>
  <body>
    <main>
      <section class="preview">
        <p><a href="index.html">一覧へ戻る</a></p>
        <h1>${escapeHtml(item.title)}</h1>
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
        <p class="caption">${escapeHtml(item.caption)}</p>
        <dl class="meta">
          <dt>カテゴリ</dt><dd>${escapeHtml(item.category)}</dd>
          <dt>タグ</dt><dd>${escapeHtml(item.tags.join(", "))}</dd>
          <dt>状態</dt><dd>${escapeHtml(item.status)}</dd>
        </dl>
        <details>
          <summary>構造データを表示</summary>
          <pre id="sourceData"></pre>
        </details>
      </section>

      <section class="editor">
        <div class="controls">
          <label><input id="useFixedCharacter" type="checkbox"> ${escapeHtml(item.fixedCharacter.nameJa)}固定キャラ指定を入れる</label>
        </div>
        <section class="prompt-card">
          <div class="prompt-head"><h2>English Prompt</h2><button id="copyEnglish" type="button">英語版をコピー</button></div>
          <textarea id="englishPrompt" spellcheck="false"></textarea>
        </section>
        <section class="prompt-card">
          <div class="prompt-head"><h2>日本語プロンプト</h2><button id="copyJapanese" type="button">日本語版をコピー</button></div>
          <textarea id="japanesePrompt" spellcheck="false"></textarea>
        </section>
      </section>
    </main>
    <script>
      const data = ${JSON.stringify(compact, null, 2)};
      const checkbox = document.getElementById("useFixedCharacter");
      const englishTextarea = document.getElementById("englishPrompt");
      const japaneseTextarea = document.getElementById("japanesePrompt");
      const sourceData = document.getElementById("sourceData");
      const copyEnglish = document.getElementById("copyEnglish");
      const copyJapanese = document.getElementById("copyJapanese");
      function renderPrompts() {
        englishTextarea.value = checkbox.checked ? data.prompts.englishFixed : data.prompts.englishGeneric;
        japaneseTextarea.value = checkbox.checked ? data.prompts.japaneseFixed : data.prompts.japaneseGeneric;
        sourceData.textContent = JSON.stringify(data.item, null, 2);
      }
      async function copyFrom(textarea, button, label) {
        await navigator.clipboard.writeText(textarea.value);
        button.textContent = "コピー済み";
        setTimeout(() => { button.textContent = label; }, 1200);
      }
      checkbox.addEventListener("change", renderPrompts);
      copyEnglish.addEventListener("click", () => copyFrom(englishTextarea, copyEnglish, "英語版をコピー"));
      copyJapanese.addEventListener("click", () => copyFrom(japaneseTextarea, copyJapanese, "日本語版をコピー"));
      renderPrompts();
    </script>
  </body>
</html>
`;
}

function buildMarkdown(item) {
  return `# ${item.title}

対象画像: \`${item.imageForMarkdown}\`

## note用キャプション案

${item.caption}

## 構造データ

\`\`\`json
${JSON.stringify(item, null, 2)}
\`\`\`

## 汎用プロンプト 英語版

\`\`\`text
${buildEnglishPrompt(item, false)}
\`\`\`

## 汎用プロンプト 日本語版

\`\`\`text
${buildJapanesePrompt(item, false)}
\`\`\`

## ${item.fixedCharacter.nameJa}固定キャラ版 英語

\`\`\`text
${buildEnglishPrompt(item, true)}
\`\`\`

## ${item.fixedCharacter.nameJa}固定キャラ版 日本語

\`\`\`text
${buildJapanesePrompt(item, true)}
\`\`\`

## AIレビュー観点

${item.reviewChecklist.map((line) => `- ${line}`).join("\n")}
`;
}

async function writeIndex(items) {
  const cards = items.map((item) => `
        <article class="card" data-category="${escapeHtml(item.category)}" data-tags="${escapeHtml(item.tags.join(" "))}" data-status="${escapeHtml(item.status)}">
          <a href="${escapeHtml(item.id)}_prompt_switcher.html"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"></a>
          <div class="card-body">
            <h2><a href="${escapeHtml(item.id)}_prompt_switcher.html">${escapeHtml(item.title)}</a></h2>
            <p>${escapeHtml(item.caption)}</p>
            <p class="meta-line">${escapeHtml(item.category)} / ${escapeHtml(item.status)} / ${escapeHtml(item.tags.join(", "))}</p>
          </div>
        </article>`).join("\n");

  const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>小鈴 selected プロンプト一覧</title>
    <style>${indexCss()}</style>
  </head>
  <body>
    <main>
      <header>
        <h1>小鈴 selected プロンプト一覧</h1>
        <p>selected画像を、構造データ・英語/日本語プロンプト・固定キャラ版へ展開した一覧です。</p>
        <input id="search" type="search" placeholder="タイトル、タグ、カテゴリで検索">
      </header>
      <section id="grid" class="grid">${cards}
      </section>
    </main>
    <script>
      const search = document.getElementById("search");
      const cards = Array.from(document.querySelectorAll(".card"));
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        for (const card of cards) card.hidden = q && !card.innerText.toLowerCase().includes(q);
      });
    </script>
  </body>
</html>
`;
  const indexPath = path.join(htmlDir, "index.html");
  await fs.writeFile(indexPath, html, "utf8");
  return indexPath;
}

function pageCss() {
  return `:root { color-scheme: light; --bg: #f7f4ee; --panel: #ffffff; --ink: #1f252d; --muted: #667085; --line: #d9d2c7; --accent: #1f6f78; --accent-strong: #18555c; } * { box-sizing: border-box; } body { background: var(--bg); color: var(--ink); font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; margin: 0; } main { display: grid; gap: 20px; grid-template-columns: minmax(280px, 390px) minmax(420px, 1fr); margin: 0 auto; max-width: 1280px; padding: 24px; } .preview, .editor, .prompt-card, details { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 16px; } .editor { display: grid; gap: 14px; } h1 { font-size: 22px; line-height: 1.3; margin: 0 0 10px; } h2 { font-size: 16px; margin: 0; } img { border-radius: 6px; display: block; height: auto; width: 100%; } a { color: var(--accent); } .caption, .hint, .meta-line { color: var(--muted); font-size: 13px; margin: 10px 0 0; } .meta { display: grid; gap: 4px 10px; grid-template-columns: max-content 1fr; font-size: 13px; } .meta dt { color: var(--muted); } .controls, .prompt-head { align-items: center; display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; } .controls { justify-content: flex-start; } label { align-items: center; display: inline-flex; gap: 8px; } input[type="checkbox"] { height: 18px; width: 18px; } button { background: var(--accent); border: 0; border-radius: 6px; color: white; cursor: pointer; font: inherit; font-weight: 700; padding: 8px 12px; } button:hover { background: var(--accent-strong); } textarea { border: 1px solid var(--line); border-radius: 6px; color: var(--ink); font: 13px/1.55 ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; margin-top: 10px; min-height: 300px; padding: 12px; resize: vertical; width: 100%; } code, pre { font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; } pre { background: #f7f7f7; border-radius: 6px; overflow: auto; padding: 10px; white-space: pre-wrap; } @media (max-width: 900px) { main { grid-template-columns: 1fr; padding: 14px; } }`;
}

function indexCss() {
  return `:root { --bg: #f7f4ee; --panel: #fff; --ink: #1f252d; --muted: #667085; --line: #d9d2c7; --accent: #1f6f78; } * { box-sizing: border-box; } body { background: var(--bg); color: var(--ink); font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; } main { margin: 0 auto; max-width: 1240px; padding: 24px; } header { margin-bottom: 18px; } h1 { font-size: 26px; margin: 0 0 8px; } p { line-height: 1.55; } input { border: 1px solid var(--line); border-radius: 6px; font: inherit; padding: 10px; width: min(520px, 100%); } .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); } .card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; } .card img { aspect-ratio: 4 / 5; display: block; object-fit: cover; width: 100%; } .card-body { padding: 12px; } h2 { font-size: 15px; line-height: 1.35; margin: 0 0 6px; } a { color: var(--accent); text-decoration: none; } a:hover { text-decoration: underline; } .card p { color: var(--muted); font-size: 13px; margin: 0; } .meta-line { margin-top: 8px !important; }`;
}

function joinListJa(values) {
  return values.join("、");
}

function joinListEn(values) {
  return values.join(", ");
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


