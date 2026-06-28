const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const dataDir = path.join(root, 'article_materials', 'prompt_data');
const taxonomyPath = path.join(root, 'prompt_lab', 'taxonomy', 'visual_prompt_taxonomy.json');
const outDir = path.join(root, 'article_materials', 'theme_indexes');
const libraryIndexDir = path.join(root, 'library', 'index');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function readItems() {
  return fs.readdirSync(dataDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJson(path.join(dataDir, file)))
    .sort((a, b) => a.noteOrder - b.noteOrder);
}

function groupBy(items, field) {
  const grouped = new Map();
  for (const item of items) {
    for (const key of item[field] || []) {
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    }
  }
  return grouped;
}

function labelFor(taxonomy, field, key) {
  const fieldMap = taxonomy[field] || {};
  return fieldMap[key] || key;
}

function buildIndexMarkdown(items, taxonomy) {
  const sections = [
    { field: 'articleThemes', title: '記事テーマ別' },
    { field: 'camera', title: 'カメラワーク別' },
    { field: 'lightingClass', title: 'ライティング別', taxonomyField: 'lighting' },
    { field: 'technique', title: '技・ポーズ別' },
    { field: 'motionTags', title: '動き・演出別' }
  ];

  let md = '# テーマ別プロンプト素材インデックス\n\n';
  md += '記事テーマを決めるための索引です。1枚の画像は複数テーマに所属します。\n\n';
  md += '## 使い方\n\n';
  md += '- 記事テーマを先に決める\n';
  md += '- 該当画像を3〜12枚程度選ぶ\n';
  md += '- `strengths / composition / motion / lighting` を記事本文に変換する\n';
  md += '- `selected` は一時置き場なので、library登録後は削除してよい\n\n';

  for (const section of sections) {
    const grouped = groupBy(items, section.field);
    md += `## ${section.title}\n\n`;
    for (const key of [...grouped.keys()].sort()) {
      const label = labelFor(taxonomy, section.taxonomyField || section.field, key);
      const groupItems = grouped.get(key);
      md += `### ${label} (${key}) - ${groupItems.length}枚\n\n`;
      md += '| No | タイトル | 見どころ | 技 | カメラ | 光 |\n';
      md += '|---:|---|---|---|---|---|\n';
      for (const item of groupItems) {
        md += `| ${item.noteOrder} | ${item.title} | ${(item.strengths?.ja || []).join(' / ')} | ${(item.technique || []).join(', ')} | ${(item.camera || []).join(', ')} | ${(item.lightingClass || []).join(', ')} |\n`;
      }
      md += '\n';
    }
  }

  md += '## 記事タイトル案\n\n';
  md += '- AIで作る武術ポーズのプロンプト集｜静から動へ\n';
  md += '- AIイラストで使えるアクションポーズ構図集\n';
  md += '- 蹴り・拳・瓦割りを見せる武術アクションプロンプト\n';
  md += '- 逆光・木漏れ日・水面反射で作る武術イラストの空気感\n';
  md += '- 超接近・ローアングル・対称構図で見せる武術ポーズ\n';
  return md;
}

function buildArticleIdeaFiles(items, taxonomy) {
  const articleThemes = groupBy(items, 'articleThemes');
  for (const [theme, themeItems] of articleThemes.entries()) {
    const label = labelFor(taxonomy, 'articleThemes', theme);
    let md = `# 記事ネタ: ${label}\n\n`;
    md += `テーマID: \`${theme}\`\n\n`;
    md += '## 掲載候補\n\n';
    for (const item of themeItems) {
      md += `### ${item.title}\n\n`;
      md += `- ID: ${item.id}\n`;
      md += `- 画像: ${item.libraryImagePath || item.imageForMarkdown}\n`;
      md += `- 見どころ: ${(item.strengths?.ja || []).join(' / ')}\n`;
      md += `- 構図: ${item.composition?.ja || ''}\n`;
      md += `- 動き: ${item.motion?.ja || ''}\n`;
      md += `- 光: ${item.lighting?.ja || ''}\n\n`;
    }
    fs.writeFileSync(path.join(outDir, `article_idea_${theme}.md`), md, 'utf8');
  }
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(libraryIndexDir, { recursive: true });
  const items = readItems();
  const taxonomy = readJson(taxonomyPath);
  const summary = items.map((item) => ({
    id: item.id,
    noteOrder: item.noteOrder,
    title: item.title,
    libraryImagePath: item.libraryImagePath,
    articleThemes: item.articleThemes || [],
    camera: item.camera || [],
    lightingClass: item.lightingClass || [],
    technique: item.technique || [],
    motionTags: item.motionTags || []
  }));
  writeJson(path.join(libraryIndexDir, 'theme_index.json'), summary);
  fs.writeFileSync(path.join(outDir, 'theme_index.md'), buildIndexMarkdown(items, taxonomy), 'utf8');
  buildArticleIdeaFiles(items, taxonomy);
  console.log(JSON.stringify({ items: items.length, outDir }, null, 2));
}

main();
