const fs = require('fs/promises');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const dataDir = path.join(root, 'article_materials', 'prompt_data');
const selectedDir = path.join(root, 'selected');
const outDir = path.join(root, 'article_materials', 'note_article');
const imagesDir = path.join(outDir, 'images');
const promptsDir = path.join(outDir, 'prompts');

const sectionOrder = [
  '導入・世界観',
  '静の修練',
  '構えと間合い',
  '動きのある戦闘',
  'キャラクター紹介'
];

const sectionMap = {
  environment: '導入・世界観',
  meditation: '静の修練',
  training: '静の修練',
  battle_stance: '構えと間合い',
  battle_motion: '動きのある戦闘',
  portrait: 'キャラクター紹介'
};

async function main() {
  await fs.mkdir(imagesDir, { recursive: true });
  await fs.mkdir(promptsDir, { recursive: true });
  const items = await loadItems();
  await copyImages(items);
  await writePromptFiles(items);
  const article = buildArticle(items);
  const articlePath = path.join(outDir, 'xiaolin_action_prompt_article.md');
  await fs.writeFile(articlePath, article, 'utf8');
  const checklistPath = path.join(outDir, 'posting_checklist.md');
  await fs.writeFile(checklistPath, buildChecklist(items), 'utf8');
  console.log(JSON.stringify({ articlePath, checklistPath, images: items.length }, null, 2));
}

async function loadItems() {
  const files = (await fs.readdir(dataDir)).filter((name) => name.endsWith('.json'));
  const items = [];
  for (const file of files) {
    const text = await fs.readFile(path.join(dataDir, file), 'utf8');
    items.push(JSON.parse(text.replace(/^\uFEFF/, '')));
  }
  return items.sort((a, b) => a.noteOrder - b.noteOrder);
}

async function copyImages(items) {
  for (const item of items) {
    const ext = path.extname(item.imageFile || '.png') || '.png';
    const targetName = `${String(item.noteOrder).padStart(2, '0')}_${slug(item.title)}${ext}`;
    item.noteImageFile = targetName;
    item.noteImagePath = `images/${targetName}`;
    await fs.copyFile(path.join(selectedDir, item.imageFile), path.join(imagesDir, targetName));
  }
}

async function writePromptFiles(items) {
  for (const item of items) {
    const promptText = buildGenericPrompt(item);
    const fixedText = buildFixedPrompt(item);
    const base = `${String(item.noteOrder).padStart(2, '0')}_${item.id}`;
    await fs.writeFile(path.join(promptsDir, `${base}_generic.txt`), promptText, 'utf8');
    await fs.writeFile(path.join(promptsDir, `${base}_xiaolin.txt`), fixedText, 'utf8');
  }
}

function buildArticle(items) {
  const bySection = new Map(sectionOrder.map((name) => [name, []]));
  for (const item of items) {
    const section = sectionMap[item.category] || '動きのある戦闘';
    bySection.get(section).push(item);
  }

  let md = '';
  md += '# AIで武術少女「小鈴」のアクションイラストを作る｜構図・動き・光を意識したプロンプト集\n\n';
  md += '今回は、武術少女「小鈴（シャオリン）」をテーマに、構え・瞑想・アクション・立ち絵のイラストを整理しました。\n\n';
  md += 'ただキャラクターを描くだけではなく、低い重心、間合い、モーションブラー、逆光、画面内の流れなど、武術らしい身体感覚が伝わるようにプロンプトを組んでいます。\n\n';
  md += 'この記事では、画像ごとに「見どころ」「プロンプトの狙い」「コピー用プロンプト」を分けています。参考画像を使う前提なので、汎用版では人物・服装・髪型・体型を固定しすぎず、構図や光、動きの制御を中心にしています。\n\n';
  md += '## 基本方針\n\n';
  md += '- 参考画像の人物・服装・髪型・体型は保持する\n';
  md += '- プロンプトでは、構図、光、動き、空気感を補強する\n';
  md += '- 固定キャラ版では、小鈴の髪型・瞳・衣装・雰囲気だけを追加する\n';
  md += '- アクションでは、顔と体幹を崩さず、ブラーは袖・髪・背景・破片などに寄せる\n\n';
  md += '## 今回の見方\n\n';
  md += '静かな瞑想系は「呼吸」「余白」「光」を、構え系は「重心」「間合い」「視線誘導」を、戦闘系は「速度」「軌跡」「衝撃」を中心に見ています。\n\n';

  for (const section of sectionOrder) {
    const sectionItems = bySection.get(section);
    if (!sectionItems.length) continue;
    md += `## ${section}\n\n`;
    md += sectionIntro(section) + '\n\n';
    for (const item of sectionItems) md += buildItemBlock(item);
  }

  md += '## 使い回す時の調整ポイント\n\n';
  md += '- アクションが激しい画像では、`keep the face and torso readable` のように顔と体幹を残す指定を入れる\n';
  md += '- 瞑想や静かな構図では、ブラーよりも余白、反射、光の柔らかさを優先する\n';
  md += '- 参考画像を使う場合、人物説明を盛りすぎると服装や髪型が上書きされやすい\n';
  md += '- 固定キャラ版にする時だけ、小鈴の設定を足すと汎用性を保ちやすい\n\n';
  md += '## まとめ\n\n';
  md += '武術イラストは、ポーズ名だけでは雰囲気が出にくいので、重心、間合い、光、画面内の流れをセットで指定すると狙いが伝わりやすくなります。\n\n';
  md += '特に小鈴のようなキャラクターでは、派手な攻撃だけでなく、静かな瞑想や礼法のカットを混ぜることで、武術家としての説得力が出しやすくなりました。\n';
  return md;
}

function buildItemBlock(item) {
  const generic = buildGenericPrompt(item);
  const fixed = buildFixedPrompt(item);
  let md = '';
  md += `### ${item.title}\n\n`;
  md += `![${item.title}](${item.noteImagePath})\n\n`;
  md += `${item.caption}\n\n`;
  md += `**見どころ**: ${item.strengths.ja.join('、')}。\n\n`;
  md += `**プロンプトの狙い**: ${item.intent.ja}。${item.composition.ja}。${item.motion.ja}。\n\n`;
  md += '<details>\n<summary>コピー用プロンプト（汎用・参考画像用）</summary>\n\n';
  md += '```text\n' + generic + '\n```\n\n';
  md += '</details>\n\n';
  md += '<details>\n<summary>コピー用プロンプト（小鈴固定キャラ版）</summary>\n\n';
  md += '```text\n' + fixed + '\n```\n\n';
  md += '</details>\n\n';
  return md;
}

function buildGenericPrompt(item) {
  return [
    'Use the reference image as the main guide for the character, outfit, hairstyle, body type, composition, and mood.',
    `Preserve ${item.subjectHandling.en}.`,
    `Create a high-quality anime-style illustration set in ${item.scene.en}. The pose/action is ${item.pose.en}, expressing ${item.intent.en}.`,
    `Composition: ${item.composition.en}. Emphasize ${item.strengths.en.join(', ')}.`,
    `Keep ${item.motion.en}, ${item.lighting.en}, and ${item.mood.en}. The scene should feel quiet, focused, and cinematic rather than chaotic.`,
    `Use ${item.details.en.join(', ')}, ${item.style.en}.`,
    `Avoid ${item.negative.en.join(', ')}.`
  ].join('\n\n');
}

function buildFixedPrompt(item) {
  const c = characterBlock();
  return `${buildGenericPrompt(item)}\n\n${c}`;
}

function characterBlock() {
  return 'The martial artist is Xiaolin, a 21-year-old female Chinese martial artist, 165 cm tall. She has a balanced, agile, healthy martial-arts build, neither too thin nor overly muscular. She has glossy black short bob hair with bangs and side locks framing her face, amber to yellow-brown eyes, and a calm face that balances cuteness with dignified sharpness. She wears a white-and-black Chinese martial arts outfit: a white Chinese-style top with black trim and frog buttons, black fitted martial arts pants or leggings, and lightweight black-and-white martial arts shoes. Her expression and presence are serious, focused, disciplined, quietly approachable, and not too cold.';
}

function sectionIntro(section) {
  const map = {
    '導入・世界観': 'まずは、場所の空気を見せるカットです。武術イラストでは、背景の湿度や奥行きがキャラクターの説得力を支えてくれます。',
    '静の修練': '動きの前にある静けさのカットです。呼吸、座法、反射、柔らかい光を使って、武術家としての内面を見せます。',
    '構えと間合い': 'ここでは、低い重心や手の位置、相手との距離感を重視します。派手な攻撃よりも、動き出す直前の圧を狙っています。',
    '動きのある戦闘': 'アクション系では、速度や衝撃を出しつつ、顔と体幹が読めるようにするのがポイントです。ブラーは背景、袖、髪、破片に寄せます。',
    'キャラクター紹介': '最後は、キャラクターを見せるための静かな一枚です。衣装や顔立ち、道場との関係が分かるようにしています。'
  };
  return map[section] || '';
}

function buildChecklist(items) {
  let md = '# note投稿前チェックリスト\n\n';
  md += '- [ ] タイトルを最終決定する\n';
  md += '- [ ] note上で画像をアップロードし、Markdown内の画像位置に合わせる\n';
  md += '- [ ] プロンプトを全文載せるか、一部だけ載せるか決める\n';
  md += '- [ ] 汎用版と小鈴固定版の両方を載せるか決める\n';
  md += '- [ ] 読者向けに長すぎる箇所を折りたたむ\n';
  md += '- [ ] 誤字、画像と説明のズレ、同じ表現の繰り返しを確認する\n\n';
  md += '## 掲載画像\n\n';
  for (const item of items) md += `- [ ] ${String(item.noteOrder).padStart(2, '0')} ${item.title} - ${item.noteImagePath}\n`;
  return md;
}

function slug(value) {
  return value
    .normalize('NFKC')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/[\s　]+/g, '_')
    .slice(0, 40);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
