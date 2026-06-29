const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const batchPath = path.join(root, "prompt_lab", "batches", "martial_visual_concepts_001", "batch_items.json");
const taxonomyPath = path.join(root, "prompt_lab", "batches", "martial_visual_concepts_001", "concept_taxonomy.json");

const themeLabels = {
  summary_sheet: "まとめイラスト",
  manga_composition: "漫画構図",
  style_study: "画風イラスト",
  eye_study: "眼のイラスト",
  shadow_study: "影のイラスト",
  screen_break: "画面破壊のイラスト",
  breathing_study: "呼吸のイラスト",
};

const themeDescriptions = {
  summary_sheet: "複数ポーズや表情を一枚で比較するための参照画像。",
  manga_composition: "コマ割り、カットイン、視線誘導、連続動作を検討するための構図画像。",
  style_study: "線、色、背景密度、レンダリングの方向性を比較するための画像。",
  eye_study: "視線、目元の圧、ハイライト、顔の切り取り方を検討する画像。",
  shadow_study: "顔影、壁影、逆光、心理的な重さを検討する画像。",
  screen_break: "拳や蹴りが画面に迫る、画面破壊・超接近演出の参照画像。",
  breathing_study: "静かな呼吸、気配、風、流れをプロンプト化するための画像。",
};

const metadata = {
  xiaolin_001_156c0c08: {
    titleJa: "全身ポーズまとめシート",
    promptJa: "参考画像のキャラクター性、服装、髪型、体格を保ちながら、白背景の上に複数の武術ポーズを整理したポーズ資料を作る。立ち姿、構え、手技、低い姿勢、顔のアップを混在させ、各ポーズのシルエットが読み取りやすいように余白を残す。完成画というより、次の生成に使える参照シートとして、動きの差と姿勢の違いが一目で分かる構成にする。",
  },
  xiaolin_002_6e10a10e: {
    titleJa: "複合スタンス資料",
    promptJa: "参考画像の人物を維持し、全身立ち姿、横向きの構え、掌底、接近した手元を一枚にまとめた武術スタンス資料を作る。各カットは比較しやすい余白で配置し、服装や体格の一貫性を保つ。キャラクター紹介とアクション設計の中間になるよう、静止ポーズと攻撃動作の両方を見せる。",
  },
  xiaolin_003_a5eab930: {
    titleJa: "光と影のポーズシート",
    promptJa: "参考画像の人物を使い、道場の光、顔や体に落ちる影、円形フレーム、床の反射を比較できるポーズシートを作る。複数の構えを並べながら、同じキャラクターでも光の当たり方で緊張感が変わることを見せる。影は強すぎず、目元と姿勢の読みやすさを優先する。",
  },
  xiaolin_004_dec78598: {
    titleJa: "統合アクションボード",
    promptJa: "参考画像の人物を維持し、正面の構え、掌底、回転する動き、シルエット、静かな立ち姿を一枚に整理したアクションボードを作る。風の軌跡や流線で動線を示し、個々のカットがばらばらにならないよう視線の流れを作る。プロンプト検討用に、静と動の差が分かる構成にする。",
  },
  xiaolin_005_5b089ca4: {
    titleJa: "掌底と旋回の比較シート",
    promptJa: "参考画像の人物を使い、掌底、旋回動作、立ち姿、座り姿を比較する武術アクション資料を作る。掌の大きさ、腕の伸び、回転の弧、衣服の揺れを分かりやすくし、静かな姿勢と勢いのある動作を同じ画面で対比させる。背景は控えめにしてポーズの設計を優先する。",
  },
  xiaolin_006_5b61a5e0: {
    titleJa: "選抜アクションポーズ集",
    promptJa: "参考画像のキャラクターを保ちながら、使いやすい武術ポーズだけを選抜したポーズ集を作る。全身の構え、上半身の表情、攻撃直前の姿勢を整理し、アクションのシルエットが重ならないように配置する。次に記事化や個別プロンプト化しやすいよう、各ポーズの強みが見える資料にする。",
  },
  xiaolin_007_c641b8f2: {
    titleJa: "横長漫画アクション構図",
    promptJa: "参考画像の人物を維持し、横長の漫画ページ風に、掌の接近、拳、目のカットイン、細い横コマを組み合わせた武術アクション構図を作る。読者の視線が左から右へ流れるようにコマを配置し、手元の迫力と目元の緊張感を交互に見せる。効果線は多すぎず、動きの順番が分かるようにする。",
  },
  xiaolin_009_1e58c68a: {
    titleJa: "道場の連続漫画パネル",
    promptJa: "参考画像の人物を使い、道場内での連続動作を漫画パネルとして構成する。細い横コマ、掌底、目のカットイン、低い構えを組み合わせ、攻撃前後の間合いと緊張を表現する。背景の畳や柱は控えめに使い、コマごとの動きが読み取りやすい構図にする。",
  },
  xiaolin_014_a400315e: {
    titleJa: "竹林修行の漫画パネル",
    promptJa: "参考画像の人物を維持し、竹林での修行シーンを漫画パネルで構成する。座った呼吸、構え、掌底、目元のアップを分けて配置し、竹の縦線で静けさと緊張を作る。動きだけでなく、呼吸を整えてから技に入る流れが伝わるようにする。",
  },
  xiaolin_015_2a472ba4: {
    titleJa: "竹林スタイル比較",
    promptJa: "参考画像の人物を使い、同じ竹林の構えを複数の描写密度で比較する。線の細かさ、色の濃さ、背景の描き込み、キャラクターの輪郭の強さを変え、どの画風が武術ポーズに合うかを見比べられる構成にする。ポーズは近い形に保ち、画風差が主役になるようにする。",
  },
  xiaolin_016_34893ba8: {
    titleJa: "影と風の画風比較",
    promptJa: "参考画像の人物を維持し、煙のような風の軌跡、暗い影、明るい光を比較する画風資料を作る。動きのあるカットと静かなカットを並べ、影の強さや風の量で印象がどう変わるかを見せる。画面全体は重くしすぎず、人物の表情と体のラインが読めるようにする。",
  },
  xiaolin_020_554f1a66: {
    primary: "eye_study",
    titleJa: "竹林ポートレートの目元強調",
    promptJa: "参考画像の人物、髪型、服装を保ちながら、竹林の柔らかい光の中で目元を強調したバストアップを作る。顔全体は落ち着いた表情にし、瞳の色、ハイライト、視線の強さが主役になるようにする。背景の竹はぼかしすぎず、自然光が目元に集まる構図にする。",
  },
  xiaolin_021_ca4807ab: {
    titleJa: "正面視線の基準ポートレート",
    promptJa: "参考画像の人物を維持し、正面からの顔アップで、まっすぐな視線と抑えた表情を描く。瞳の色、光の入り方、まぶたの形、前髪との重なりを丁寧に見せる。派手な演出は控え、目の印象だけで集中力と静かな強さが伝わるポートレートにする。",
  },
  xiaolin_022_fc8e9a7d: {
    titleJa: "影を帯びた鋭い眼差し",
    promptJa: "参考画像の人物を使い、顔に落ちる影と鋭い目元を中心にしたポートレートを作る。目の周囲の影、眉の角度、瞳のハイライトを調整し、真剣さと少し冷たい緊張感を出す。暗くしすぎて表情が潰れないよう、瞳だけは明確に読める光を残す。",
  },
  xiaolin_023_e884e748: {
    titleJa: "超接近の眼アップ",
    promptJa: "参考画像の人物を維持し、目、前髪、鼻筋の一部だけを大胆に切り取った超接近ポートレートを作る。瞳のディテール、反射光、まつ毛、前髪の影を主役にし、顔の全体像はあえて見せない。画面いっぱいの目元で、次の動作に入る直前の集中を表現する。",
  },
  xiaolin_024_2f635a52: {
    titleJa: "強い顔影のポートレート",
    promptJa: "参考画像の人物を使い、顔の大部分に影を落とし、目元だけに感情の圧を残すポートレートを作る。暗い影、わずかな瞳の光、静かな口元で、内側にこもった緊張を表現する。黒く潰れないよう、輪郭と髪の流れは最低限読み取れるようにする。",
  },
  xiaolin_029_51c0c6a2: {
    titleJa: "壁に伸びる巨大な影",
    promptJa: "参考画像の人物を維持し、道場で低く構えた姿と背後の巨大な壁影を描く。実際の体よりも大きく伸びる影で、心理的な圧力と技の気配を表現する。床、壁、光源の位置を明確にし、人物の小ささと影の大きさの対比が分かる構図にする。",
  },
  xiaolin_033_f59121cd: {
    titleJa: "拳の画面破壊",
    promptJa: "参考画像の人物を使い、拳が画面手前に迫り、透明な画面にひびが入るような超接近アクションを作る。拳は大きく、顔は奥に配置し、パースで距離感を強調する。割れ目、速度線、衝撃の白い抜きを使いながら、拳と表情の両方が読める構図にする。",
  },
  xiaolin_034_b928488a: {
    titleJa: "蹴り足の画面破壊",
    promptJa: "参考画像の人物を維持し、蹴り足の足裏が画面に迫ってひびを入れる超接近アクションを作る。足裏を最前面に大きく置き、顔と上半身は奥に見せる。極端なパース、割れたガラス状の線、速度線を使い、蹴りの勢いとキャラクターの表情が同時に伝わるようにする。",
  },
  xiaolin_038_cb2308ed: {
    primary: "breathing_study",
    titleJa: "竹林の静かな呼吸",
    promptJa: "参考画像の人物、髪型、服装を保ちながら、竹林の中で静かに呼吸を整えるバストアップを作る。激しい動きではなく、肩の力が抜けた姿勢、柔らかい自然光、わずかに揺れる髪や布で、内側の気配を表現する。目立つ攻撃演出は入れず、静から動へ移る直前の落ち着きを主役にする。",
  },
};

const items = JSON.parse(fs.readFileSync(batchPath, "utf8").replace(/^\uFEFF/, ""));
for (const item of items) {
  const data = metadata[item.id] || {};
  const primary = data.primary || item.primary || item.themes?.[0] || "summary_sheet";
  item.primary = primary;
  item.themes = [primary];
  item.themeLabel = themeLabels[primary] || primary;
  item.titleJa = data.titleJa || item.titleJa || item.title;
  item.promptJa = data.promptJa || item.promptJa || "";
}
fs.writeFileSync(batchPath, JSON.stringify(items, null, 2) + "\n", "utf8");

const order = ["summary_sheet", "manga_composition", "style_study", "eye_study", "shadow_study", "screen_break", "breathing_study"];
const taxonomy = {
  batchId: "martial_visual_concepts_001",
  purpose: "今後GPTにプロンプト化を依頼するため、武術イラストの表現テーマを単一テーマで体系化する。",
  classificationRule: "1枚の画像につき代表テーマは1つだけにする。複数テーマに見える場合でも、GPTへ依頼するときに最も使いたい観点をprimaryとして選ぶ。",
  themeOrder: order,
  themes: Object.fromEntries(order.map((key) => [key, { label: themeLabels[key], description: themeDescriptions[key] }])),
  gptPromptDesignLayers: [
    "reference_handling: preserve person, outfit, hairstyle, and body type from the reference image",
    "visual_theme: use exactly one primary theme from this taxonomy",
    "composition: panel layout, cut-ins, foreground, midground, background, negative space",
    "motion_or_stillness: impact, speed lines, wind trails, breathing, stillness",
    "lighting_shadow: backlight, dappled light, face shadow, giant wall shadow, white diffused light",
    "prompt_goal: research notes, prompt draft, generation prompt, comparison sheet",
  ],
};
fs.writeFileSync(taxonomyPath, JSON.stringify(taxonomy, null, 2) + "\n", "utf8");

const counts = items.reduce((acc, item) => {
  acc[item.themeLabel] = (acc[item.themeLabel] || 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({ updated: items.length, counts }, null, 2));
