const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const dataDir = path.join(root, 'article_materials', 'prompt_data');
const rulesDir = path.join(root, 'article_materials', 'prompt_rules');

const subjectHandling = {
  ja: '人物、服装、髪型、体型は参考画像を保持する。固定キャラ版だけ別途キャラ指定を加える。',
  en: 'the person, outfit, hairstyle, and body type from the reference image; only the fixed-character version adds separate character details'
};

const commonRules = {
  defaults: {
    subjectHandling,
    scene: { ja: '雰囲気のある背景', en: 'an atmospheric background' },
    pose: { ja: '印象的なポーズを取る', en: 'an expressive pose' },
    intent: { ja: 'キャラクターの集中力と存在感', en: "the character's focus and presence" },
    composition: { ja: '参考画像の構図、カメラ位置、画面内の配置を保つ', en: 'keep the reference image composition, camera angle, and on-canvas placement' },
    strengths: { ja: ['参考画像の見どころ'], en: ['the strongest visual qualities of the reference image'] },
    motion: { ja: '参考画像の動き、静けさ、またはブレの量を保つ', en: 'preserve the movement, stillness, or amount of blur seen in the reference image' },
    lighting: { ja: '印象的な光と影', en: 'expressive light and shadow' },
    mood: { ja: '静かで集中した空気', en: 'a quiet and focused atmosphere' },
    style: {
      ja: '高品質アニメ調、シャープな線画、印象的な瞳、自然な布のしわ、破綻のない人体、完成度の高いイラスト',
      en: 'high-quality anime style, sharp linework, detailed eyes, natural cloth folds, balanced anatomy, polished illustration finish'
    },
    details: {
      ja: ['背景の質感', '自然な奥行き', 'キャラクターの重心', '視線誘導'],
      en: ['background texture', 'natural depth', 'clear body weight balance', 'strong visual focus']
    }
  },
  negative: {
    ja: ['余分な人物', '武器が勝手に増えること', '文字', 'ロゴ', '歪んだ手', '壊れた指', '関節の破綻', '過度に筋肉質な体型', '幼すぎる比率', '強すぎるモーションブラー'],
    en: ['extra characters', 'unwanted weapons', 'text', 'logos', 'distorted hands', 'broken fingers', 'incorrect limb joints', 'overly muscular body', 'childish proportions', 'excessive motion blur']
  },
  reviewChecklist: [
    '参考画像の人物・服装・髪型・体型をプロンプトで上書きしすぎていないか',
    '汎用版に固定キャラ名や固定衣装が混ざっていないか',
    '固定キャラ版でのみ小鈴の髪型・目・衣装・体型が追加されているか',
    '構図、光、背景、動き、雰囲気に矛盾がないか',
    'その画像の見どころが strengths に入っているか',
    'ネガティブ指定が生成意図を潰していないか',
    'note記事で説明しやすい見どころが残っているか'
  ],
  categories: {
    battle_stance: '戦闘構え',
    battle_motion: '動きのある戦闘',
    training: '修練・稽古',
    meditation: '瞑想・静の修練',
    daily: '日常',
    portrait: '顔・立ち絵',
    environment: '背景重視',
    uncategorized: '未分類'
  }
};

const character = {
  nameJa: '小鈴（シャオリン）',
  nameEn: 'Xiaolin',
  ja: {
    identity: '21歳の女性中国武術家。身長165cm',
    body: 'しなやかで均整の取れた健康的な武術体型。細すぎず、筋肉質すぎず、軽やかに動ける身体つき',
    hair: '艶のある黒髪のショートボブ、前髪あり、両サイドに顔を縁取る毛束',
    eyes: '琥珀色から黄褐色の瞳',
    face: '可愛さと凛々しさの中間にある落ち着いた顔立ち',
    outfit: '白と黒を基調にした中華風武術衣装。白い中華風トップスに黒い縁取りとチャイナボタン、黒の動きやすい武術パンツまたはレギンス、軽量の白黒武術シューズ',
    personality: '真剣で集中しており、礼儀正しく芯が強いが、冷たすぎない雰囲気'
  },
  en: {
    identity: 'a 21-year-old female Chinese martial artist, 165 cm tall',
    body: 'a balanced, agile, healthy martial-arts build, neither too thin nor overly muscular',
    hair: 'glossy black short bob hair with bangs and side locks framing her face',
    eyes: 'amber to yellow-brown eyes',
    face: 'a calm face that balances cuteness with dignified sharpness',
    outfit: 'a white-and-black Chinese martial arts outfit: a white Chinese-style top with black trim and frog buttons, black fitted martial arts pants or leggings, and lightweight black-and-white martial arts shoes',
    personality: 'serious, focused, disciplined, quietly approachable, and not too cold'
  }
};

const observations = {
  xiaolin_009_1a7a89db: {
    noteOrder: 1,
    title: '夕日の道場で構える静かな間合い',
    noteSection: '構え・間合い',
    category: 'battle_stance',
    tags: ['逆光', '道場', '低い構え', '間合い'],
    caption: '夕日が差し込む道場で、低く構えて相手との距離を測る一枚。強い逆光と床の導線が、静かな圧を作っている。',
    scene: { ja: '夕日の光が差し込む古い木造道場', en: 'an old wooden dojo lit by a low sunset' },
    pose: { ja: '片膝を深く曲げた低い防御構えで、片手を前へ差し出す', en: 'a low defensive stance with one knee deeply bent and one hand extended forward' },
    intent: { ja: '戦う直前の間合い、集中、静かな威圧感', en: 'distance control, focus, and quiet pressure just before a fight' },
    composition: { ja: 'ローアングルで人物を大きく配置し、床板の線と背後の太陽で視線を中央に集める', en: 'a low-angle composition with the figure large in frame, floor lines and the backlit sun drawing the eye to the center' },
    strengths: { ja: ['強い逆光のシルエット', '床に伸びる長い影', '低い重心からくる緊張感'], en: ['strong backlit silhouette', 'long shadows across the floor', 'tension from the low center of gravity'] },
    motion: { ja: '大きな動きは抑え、髪と衣装にわずかな揺れを残す', en: 'keep the action restrained, with only subtle movement in the hair and clothing' },
    lighting: { ja: '背後からの黄金色のリムライトと、床に落ちる長い影', en: 'golden rim light from behind and long shadows falling across the floor' },
    mood: { ja: '静かで張りつめた、勝負前の映画的な緊張感', en: 'quiet, taut, cinematic tension before a confrontation' }
  },
  xiaolin_010_eab4c340: {
    noteOrder: 2,
    title: '竹林の水辺を歩く静かな導入',
    noteSection: '静の修練・風景',
    category: 'environment',
    tags: ['竹林', '水辺', '横長構図', '朝靄'],
    caption: '竹林と水辺の広がりを見せる横長の一枚。人物よりも空気感と場所の美しさを重視する導入カットに向いている。',
    scene: { ja: '竹林に囲まれた水辺の石畳の小道', en: 'a stone path beside water, surrounded by bamboo' },
    pose: { ja: '静かに立ち、歩き出す直前の落ち着いた姿勢', en: 'a calm standing pose, as if just before beginning to walk' },
    intent: { ja: '修練前の静けさ、場所の気配、人物の落ち着き', en: 'the quiet before training, the sense of place, and the character’s composure' },
    composition: { ja: '横長のパノラマ構図で、左に人物、右に水面と遠景を広く取る', en: 'a wide panoramic composition with the character on the left and water plus distant scenery opening to the right' },
    strengths: { ja: ['竹林の奥行き', '水面の柔らかい反射', '人物を小さく置いた余白'], en: ['depth in the bamboo grove', 'soft water reflections', 'negative space created by the small figure placement'] },
    motion: { ja: 'ほぼ静止。衣装や竹葉にごく弱い風の気配を入れる', en: 'mostly still, with only a faint breeze in the clothing and bamboo leaves' },
    lighting: { ja: '木漏れ日と薄い朝靄で、柔らかく明るい光', en: 'soft bright light through bamboo leaves and light morning mist' },
    mood: { ja: '穏やかで透明感のある、修練の始まりの空気', en: 'peaceful, clear, and introductory, like the beginning of training' }
  },
  xiaolin_011_27ed9fc5: {
    noteOrder: 3,
    title: '湖畔で座禅する広い夕景',
    noteSection: '静の修練・瞑想',
    category: 'meditation',
    tags: ['瞑想', '湖', '夕景', '横長構図'],
    caption: '夕暮れの湖畔で瞑想する横長構図。人物の静けさと、広い水面・山並みの余韻が主役になる。',
    scene: { ja: '夕暮れの湖畔、遠くに山と東屋が見える静かな場所', en: 'a quiet lakeside at sunset with distant mountains and a pavilion' },
    pose: { ja: '水辺に座り、脚を組んで瞑想する', en: 'seated by the water in a cross-legged meditation pose' },
    intent: { ja: '戦う前に心を整える静の修練', en: 'quiet inner training, centering the mind before combat' },
    composition: { ja: '横長の画面で人物を右寄りに置き、湖と空の余白を大きく使う', en: 'a wide frame with the figure placed to the right, using the lake and sky as spacious negative space' },
    strengths: { ja: ['広い水面の余白', '夕焼けのグラデーション', '静かな座像のシルエット'], en: ['broad negative space on the water', 'sunset color gradient', 'quiet seated silhouette'] },
    motion: { ja: '完全に静止した瞑想感を保ち、水面だけにわずかな揺らぎを入れる', en: 'keep the meditation completely still, with only slight ripples on the water' },
    lighting: { ja: '夕焼けの柔らかな逆光と、水面の反射光', en: 'soft sunset backlight and reflected light from the water' },
    mood: { ja: '静謐で余韻のある、呼吸が聞こえるような空気', en: 'serene and lingering, with a sense of quiet breath' }
  },
  xiaolin_012_3e3cddd0: {
    noteOrder: 4,
    title: '雨上がりの石畳で構える朝の稽古',
    noteSection: '構え・間合い',
    category: 'battle_stance',
    tags: ['石畳', '朝靄', '構え', '水面反射'],
    caption: '雨上がりの石畳に立ち、片手を前に出して構える一枚。湿った床の反射と朝靄が、静かな稽古の緊張感を支える。',
    scene: { ja: '雨上がりの石畳が濡れた中庭と寺院の参道', en: 'a rain-wet stone courtyard and temple path after dawn' },
    pose: { ja: '足を大きく開き、片手を前に出した安定した武術の構え', en: 'a stable martial stance with legs spread wide and one hand raised forward' },
    intent: { ja: '攻撃よりも間合いを制する冷静な構え', en: 'a calm stance focused on controlling distance rather than attacking' },
    composition: { ja: '縦構図で人物を中央に置き、石畳の遠近線と灯籠で奥行きを作る', en: 'a vertical central composition using stone path perspective lines and lanterns to create depth' },
    strengths: { ja: ['濡れた石畳の反射', '霧に包まれた奥行き', '構えの安定感'], en: ['reflections on wet stone', 'misty depth', 'stability of the stance'] },
    motion: { ja: '動き始める直前の静止。衣装の裾だけに軽い揺れを残す', en: 'a held moment just before movement, with only slight motion in the clothing hem' },
    lighting: { ja: '朝の低い光と霧で、柔らかく湿度のある光', en: 'low morning light diffused by mist, soft and humid' },
    mood: { ja: '凛として落ち着いた、稽古前の緊張感', en: 'composed, disciplined tension before training' }
  },
  xiaolin_015_b0f6ade9: {
    noteOrder: 5,
    title: '壁際で流す掌打の接近戦',
    noteSection: '動きのある戦闘',
    category: 'battle_motion',
    tags: ['室内', '掌打', 'モーションブラー', '接近戦'],
    caption: '壁際で身をひねり、掌打を流すように出すアクションカット。袖と髪の流れ、壁の近さが接近戦の圧を作る。',
    scene: { ja: '古い道場の壁際、窓から光が入る室内', en: 'inside an old dojo near a wall, with light entering through windows' },
    pose: { ja: '体をひねりながら片手を前に出し、もう片方の腕でバランスを取る', en: 'twisting the body while extending one palm forward and using the other arm for balance' },
    intent: { ja: '近距離で相手の攻撃を流し、反撃へ移る瞬間', en: 'the instant of redirecting an opponent’s attack at close range and moving into a counter' },
    composition: { ja: '斜めの壁と床の線で速度を出し、人物を右寄りに大きく置く', en: 'diagonal wall and floor lines create speed, with the character placed large and slightly to the right' },
    strengths: { ja: ['袖と髪の流れ', '壁面に沿うスピード感', '近距離の圧迫感'], en: ['flowing sleeves and hair', 'speed along the wall surface', 'close-range pressure'] },
    motion: { ja: '手先、袖、髪に中程度のモーションブラーを入れ、顔は崩さず残す', en: 'use medium motion blur on the hands, sleeves, and hair while keeping the face clear' },
    lighting: { ja: '窓からの斜光と室内の暗部で、輪郭を強く見せる', en: 'slanted window light and indoor shadows emphasizing the silhouette' },
    mood: { ja: '速いが制御された、接近戦の鋭い集中', en: 'fast but controlled, with sharp close-combat focus' }
  },
  xiaolin_016_7df317fc: {
    noteOrder: 6,
    title: '縁側で目を閉じる静かな座法',
    noteSection: '静の修練・瞑想',
    category: 'meditation',
    tags: ['縁側', '瞑想', '庭', '柔らかい光'],
    caption: '縁側に座って目を閉じる静かなカット。庭と柱のフレーミングが、内面に向かう時間を作っている。',
    scene: { ja: '庭に面した古い道場の縁側', en: 'a veranda of an old dojo facing a garden' },
    pose: { ja: '脚を組んで座り、目を閉じて手を膝に置く', en: 'sitting cross-legged with eyes closed and hands resting on the knees' },
    intent: { ja: '外の気配を聞きながら、心を静める修練', en: 'calming the mind while listening to the presence of the garden outside' },
    composition: { ja: '柱と窓枠で人物を囲み、背景の庭へ視線を抜く', en: 'frame the figure with pillars and window frames, letting the eye move into the garden behind' },
    strengths: { ja: ['閉じた目の穏やかさ', '室内外の明暗差', '庭の奥行き'], en: ['peacefulness of the closed eyes', 'contrast between interior and exterior light', 'depth in the garden'] },
    motion: { ja: '完全に静止。髪先と衣装に自然な重みを持たせる', en: 'completely still, with natural weight in the hair tips and clothing' },
    lighting: { ja: '庭から入る柔らかな自然光と、室内の落ち着いた影', en: 'soft natural garden light with calm interior shadows' },
    mood: { ja: '穏やかで内省的な、静の時間', en: 'peaceful, introspective, and meditative' }
  },
  xiaolin_017_123010d9: {
    noteOrder: 7,
    title: '中庭で座る朝靄の呼吸',
    noteSection: '静の修練・瞑想',
    category: 'meditation',
    tags: ['中庭', '朝靄', '座法', '庭園'],
    caption: '庭園の石畳に座り、朝靄の中で呼吸を整える一枚。背景の緑と石の質感が、修練場の空気を補強する。',
    scene: { ja: '朝靄が残る寺院風の中庭と石畳', en: 'a temple-like courtyard with stone paving and lingering morning mist' },
    pose: { ja: '脚を組んで座り、手を膝に置いて姿勢を整える', en: 'sitting cross-legged with hands on the knees and an upright posture' },
    intent: { ja: '稽古前に呼吸と重心を整える', en: 'preparing breath and balance before training' },
    composition: { ja: '人物を中央寄りに置き、石畳、塀、樹木で奥行きを作る', en: 'place the figure near the center, using stone paving, walls, and trees to build depth' },
    strengths: { ja: ['朝靄の柔らかさ', '石畳と庭の質感', '正座に近い安定した座り'], en: ['softness of morning mist', 'texture of stone and garden', 'stable seated posture'] },
    motion: { ja: '静止を基本にし、周囲の霧だけをわずかに漂わせる', en: 'keep the figure still, with only subtle drifting mist around her' },
    lighting: { ja: '木々越しの淡い朝光で、輪郭を柔らかく出す', en: 'pale morning light through trees, softly defining the silhouette' },
    mood: { ja: '清潔で静かな、呼吸を整える空気', en: 'clean, quiet, and breath-centered' }
  },
  xiaolin_018_bb7e49e0: {
    noteOrder: 8,
    title: '木床の道場で膝をつく礼法',
    noteSection: '静の修練・瞑想',
    category: 'training',
    tags: ['道場', '礼法', '木床', '室内光'],
    caption: '木造道場の中で膝をつき、静かに礼法や呼吸を整える場面。床の反射と柱の垂直線が、格式を感じさせる。',
    scene: { ja: '柱と木床が美しい古い道場の内側', en: 'inside an old dojo with wooden floors and strong pillars' },
    pose: { ja: '膝をついて背筋を伸ばし、手を自然に置く礼法に近い姿勢', en: 'kneeling upright in a disciplined posture with hands placed naturally' },
    intent: { ja: '武術の礼、集中、静かな覚悟', en: 'martial etiquette, focus, and quiet resolve' },
    composition: { ja: '柱の縦線と床板の反射で人物を中央に引き締める', en: 'use vertical pillar lines and floor reflections to center and stabilize the figure' },
    strengths: { ja: ['磨かれた木床の反射', '姿勢の端正さ', '室内に差し込む暖かい光'], en: ['polished wooden floor reflections', 'formal upright posture', 'warm light entering the interior'] },
    motion: { ja: '動きは入れず、姿勢の美しさを優先する', en: 'avoid action; prioritize the beauty of the still posture' },
    lighting: { ja: '横から差し込む暖色の自然光と、柱が作る影', en: 'warm side natural light with shadows cast by pillars' },
    mood: { ja: '礼儀正しく厳かな、稽古前の静けさ', en: 'formal, respectful, and solemn before training' }
  },
  xiaolin_019_df4c1d0a: {
    noteOrder: 9,
    title: '湖と山を背にした夕暮れの瞑想',
    noteSection: '静の修練・瞑想',
    category: 'meditation',
    tags: ['湖', '夕日', '瞑想', '対称構図'],
    caption: '湖畔で正面を向いて瞑想する一枚。背後の夕日と山並みが、静かな精神性を強く見せる。',
    scene: { ja: '山に囲まれた湖畔、夕日が沈む静かな岩場', en: 'a quiet rocky lakeside surrounded by mountains at sunset' },
    pose: { ja: '正面を向いて脚を組み、手を重ねて瞑想する', en: 'facing forward, seated cross-legged with hands folded in meditation' },
    intent: { ja: '心身を中心に戻す、静かな精神統一', en: 'quiet mental centering, returning body and mind to balance' },
    composition: { ja: '人物を中央に置き、湖面と山を左右に広げた安定した構図', en: 'a centered figure with lake and mountains spreading symmetrically to both sides' },
    strengths: { ja: ['夕日を背負う静かなシルエット', '湖面と山の奥行き', '真正面の安定感'], en: ['quiet silhouette against the sunset', 'depth of lake and mountains', 'stability of the front-facing pose'] },
    motion: { ja: '静止を保ち、水面と霧だけに微細な動きを入れる', en: 'keep the body still, with only minute motion in the water and mist' },
    lighting: { ja: '背後の夕日と湖面からの反射光', en: 'sunset backlight and reflection from the lake surface' },
    mood: { ja: '静謐で精神的、余白のある空気', en: 'serene, spiritual, and spacious' }
  },
  xiaolin_020_86b0a334: {
    noteOrder: 10,
    title: '竹林の白光に包まれる横顔の瞑想',
    noteSection: '静の修練・瞑想',
    category: 'meditation',
    tags: ['竹林', '横顔', '瞑想', '白い光'],
    caption: '竹林の中で横向きに座る静かな一枚。白く拡散した光が、瞑想の透明感を作っている。',
    scene: { ja: '白い光が差す竹林の石床', en: 'a bamboo grove with white diffused light falling onto a stone floor' },
    pose: { ja: '横向きに脚を組んで座り、目を閉じて手を膝に置く', en: 'sitting cross-legged in side profile with eyes closed and hands on the knees' },
    intent: { ja: '外界から意識を切り離し、静かに集中する', en: 'withdrawing from the outside world and entering quiet focus' },
    composition: { ja: '横顔を右寄りに配置し、竹林の縦線と白い余白で静けさを作る', en: 'place the side-profile figure slightly to the right, using bamboo verticals and pale negative space for stillness' },
    strengths: { ja: ['白く拡散した光', '横顔の静けさ', '竹林の縦方向のリズム'], en: ['white diffused light', 'quiet side profile', 'vertical rhythm of bamboo'] },
    motion: { ja: '静止。竹葉と薄霧だけに柔らかな揺れを入れる', en: 'stillness, with only soft movement in bamboo leaves and faint mist' },
    lighting: { ja: '逆光気味の白い拡散光で、輪郭をやわらかく溶かす', en: 'white diffused backlight softly dissolving the silhouette edges' },
    mood: { ja: '透明感があり、静かで内向的', en: 'clear, quiet, and inward-looking' }
  },
  xiaolin_021_a83ca4f6: {
    noteOrder: 11,
    title: '風をまとって旋回を表現した戦闘ポーズ',
    noteSection: '動きのある戦闘',
    category: 'battle_motion',
    tags: ['疾走', '森', 'モーションブラー', 'スピードライン'],
    caption: '森の石橋を低く駆け抜けるアクションカット。白い軌跡と衣装の流れが、速度と方向性をはっきり見せている。',
    scene: { ja: '木漏れ日の差す森の石橋と石畳の道', en: 'a forest stone bridge and stone path lit by shafts of sunlight' },
    pose: { ja: '低い姿勢で前方へ踏み込み、片腕を後ろに流しながら走る', en: 'dashing forward in a low stance, with one arm trailing behind' },
    intent: { ja: '相手の間合いへ一気に入り込む高速の踏み込み', en: 'a fast entry step cutting into the opponent’s range' },
    composition: { ja: '斜めの進行方向を強調し、人物を左下から右上へ抜ける流れで配置する', en: 'emphasize diagonal movement, placing the figure along a lower-left to upper-right flow' },
    strengths: { ja: ['白いスピードライン', '低い疾走姿勢', '木漏れ日と影のコントラスト'], en: ['white speed trails', 'low sprinting posture', 'contrast of sunlight and forest shadow'] },
    motion: { ja: '背景と袖に強めのモーションブラーを入れ、顔と胴体の芯は読み取れるようにする', en: 'use strong motion blur on the background and sleeves while keeping the face and torso readable' },
    lighting: { ja: '木漏れ日の斜光と森の暗部で、白い軌跡を浮かび上がらせる', en: 'slanting forest light and dark shadows making the white motion trails stand out' },
    mood: { ja: '鋭く速いが、重心は制御された緊迫感', en: 'sharp and fast, but with controlled balance and tension' }
  },
  xiaolin_022_78bf7425: {
    noteOrder: 12,
    title: '水鏡に映る正面瞑想',
    noteSection: '静の修練・瞑想',
    category: 'meditation',
    tags: ['水鏡', '対称構図', '瞑想', '夕暮れ'],
    caption: '湖面に姿が映る、正面性の強い瞑想カット。人物、反射、夕空の対称性が美しい。',
    scene: { ja: '夕暮れの湖面近く、浅い水に反射が映る静かな場所', en: 'a quiet place beside shallow lake water at sunset, with a clear reflection' },
    pose: { ja: '正面を向いて脚を組み、目を閉じて瞑想する', en: 'front-facing, seated cross-legged, eyes closed in meditation' },
    intent: { ja: '水面の反射で、内面の静けさと均衡を見せる', en: 'showing inner calm and balance through the water reflection' },
    composition: { ja: '人物と水面の反射を縦方向に重ね、中心軸を強く見せる', en: 'stack the figure and water reflection vertically, emphasizing a strong central axis' },
    strengths: { ja: ['水鏡の反射', '正面構図の安定感', '夕空と山のグラデーション'], en: ['mirror-like water reflection', 'stability of the front composition', 'gradient of sunset sky and mountains'] },
    motion: { ja: 'ほぼ完全な静止。水面には小さな波紋だけを入れる', en: 'near-complete stillness, with only tiny ripples on the water surface' },
    lighting: { ja: '夕日を背にした柔らかな逆光と、水面からの淡い反射', en: 'soft sunset backlight and faint reflected light from the water' },
    mood: { ja: '静かで神秘的、心が整っていく感覚', en: 'quiet, mystical, and centered' }
  },
  xiaolin_023_a414c2cc: {
    noteOrder: 13,
    title: '乾いた荒野で踏み込む掌底構え',
    noteSection: '構え・間合い',
    category: 'battle_stance',
    tags: ['荒野', '砂埃', '掌底', '逆光'],
    caption: '乾いた地面で低く構え、片手を前へ出す荒野の戦闘カット。砂埃と夕日が、硬派な緊張感を出している。',
    scene: { ja: '夕日の当たる乾いた荒野と岩場', en: 'a dry rocky wasteland under sunset light' },
    pose: { ja: '片膝を曲げた低い姿勢で、掌底を前に構える', en: 'a low stance with one knee bent and an open palm guard extended forward' },
    intent: { ja: '荒い地形でも崩れない重心と、反撃前の圧', en: 'stable balance on rough ground and pressure before counterattacking' },
    composition: { ja: '人物を中央に置き、地面の砂埃と空の広がりでスケールを出す', en: 'center the figure, using dust on the ground and broad sky for scale' },
    strengths: { ja: ['舞い上がる砂埃', '荒野の硬い質感', '逆光で浮く掌と輪郭'], en: ['rising dust', 'hard texture of the wasteland', 'backlit palm and silhouette'] },
    motion: { ja: '踏み込みで足元の砂だけを散らし、上半身は鋭く止める', en: 'scatter dust around the feet from the step while keeping the upper body sharply held' },
    lighting: { ja: '低い夕日による強い逆光と、乾いた暖色の反射', en: 'strong low sunset backlight with dry warm reflected light' },
    mood: { ja: '乾いた緊張感と、荒野での一対一の圧', en: 'dry tension and one-on-one pressure in a harsh landscape' }
  },
  xiaolin_024_7a70d879: {
    noteOrder: 14,
    title: '中庭を横切る低い突進',
    noteSection: '動きのある戦闘',
    category: 'battle_motion',
    tags: ['横長構図', '突進', '中庭', 'スピード感'],
    caption: '中庭を低く滑るように横切る横長アクション。背景の建物と斜めの体勢が、移動方向を強く示している。',
    scene: { ja: '寺院風の中庭と木造建築の前', en: 'a temple-like courtyard in front of wooden buildings' },
    pose: { ja: '低く身を沈めて横方向へ突進し、片腕を後ろに流す', en: 'lunging low sideways, with one arm trailing behind' },
    intent: { ja: '相手の視界を横に抜ける素早い移動', en: 'a quick lateral movement slipping across the opponent’s field of view' },
    composition: { ja: '横長構図で人物の移動方向を広く取り、背景の屋根線をスピードの補助に使う', en: 'a wide composition that leaves room for the movement direction, using roof lines to reinforce speed' },
    strengths: { ja: ['横方向の疾走感', '低い重心', '背景の建築線による勢い'], en: ['lateral speed', 'low center of gravity', 'momentum from architectural background lines'] },
    motion: { ja: '足元と袖に中程度のブラーを入れ、進行方向へ流れる残像を作る', en: 'use medium blur on feet and sleeves, creating afterimages along the travel direction' },
    lighting: { ja: '日中の明るい自然光と、建物の影のコントラスト', en: 'bright daylight with contrast from building shadows' },
    mood: { ja: '軽快で素早い、回避から反撃へつながる緊張感', en: 'nimble and fast, with tension leading from evasion into counterattack' }
  },
  xiaolin_036_45f4581f: {
    noteOrder: 15,
    title: '正面からの瓦割り',
    noteSection: '動きのある戦闘',
    category: 'battle_motion',
    tags: ['床破壊', '道場', '衝撃', '横長構図'],
    caption: '道場の床を砕くほどの踏み込みを横長で見せる一枚。飛び散る破片が、力の方向を視覚化している。',
    scene: { ja: '木造道場の室内、畳または床板が砕ける瞬間', en: 'inside a wooden dojo at the instant the floor cracks and breaks' },
    pose: { ja: '低く足を開き、踏み込みの力を床へ落とす', en: 'standing low with legs spread, driving force down into the floor' },
    intent: { ja: '攻撃の前後に生じる衝撃と、身体操作の強さを見せる', en: 'showing impact and the strength of body control around an attack' },
    composition: { ja: '横長構図で破片の広がりを見せ、人物を右寄りに置いて衝撃の中心にする', en: 'a wide composition showing debris spread, placing the figure to the right as the impact center' },
    strengths: { ja: ['砕ける床の破片', '衝撃の放射状の広がり', '室内道場の緊迫感'], en: ['splintering floor debris', 'radial spread of impact', 'tense indoor dojo atmosphere'] },
    motion: { ja: '破片と埃に強い動きを入れ、人物の体幹はぶれずに固定する', en: 'add strong motion to debris and dust while keeping the character’s core stable' },
    lighting: { ja: '道場内の明るい光と破片の影で、衝撃点を強調する', en: 'bright dojo light and debris shadows emphasizing the impact point' },
    mood: { ja: '静かな武術から一瞬だけ爆発する力', en: 'power exploding for a single instant out of quiet martial control' }
  },
  xiaolin_039_9c8c917e: {
    noteOrder: 16,
    title: '蹴り足が画面に迫る超接近アクション',
    noteSection: '動きのある戦闘',
    category: 'battle_motion',
    tags: ['蹴り', '超広角', '足裏', 'モーションブラー'],
    caption: '蹴り足を画面手前へ大きく出した迫力重視のカット。遠近感と白い軌跡で、衝撃の近さを見せる。',
    scene: { ja: '屋外の稽古場または中庭、砂埃が舞う戦闘空間', en: 'an outdoor training yard or courtyard with dust in the air' },
    pose: { ja: '蹴り足をカメラ前面へ大きく突き出し、上半身を奥に置く', en: 'thrusting a kicking foot toward the camera with the upper body farther back' },
    intent: { ja: '見る側に迫る蹴りの衝撃と距離感', en: 'the impact and proximity of a kick coming toward the viewer' },
    composition: { ja: '超広角の遠近感で足裏を大きく、顔と体を奥に小さく配置する', en: 'use extreme wide-angle perspective, making the sole large in the foreground and the face/body smaller behind' },
    strengths: { ja: ['足裏の強いパース', '白い衝撃線', '砂埃と背景ブラー'], en: ['strong perspective on the sole', 'white impact lines', 'dust and background blur'] },
    motion: { ja: '蹴りの周囲に強いブラーと円弧状の軌跡を入れ、顔は読み取れる程度に残す', en: 'use strong blur and arc-shaped trails around the kick while keeping the face somewhat readable' },
    lighting: { ja: '屋外の硬い光と砂埃の反射で、蹴りの輪郭を強調する', en: 'hard outdoor light and dust reflection emphasizing the kick silhouette' },
    mood: { ja: '迫力とスピードを最優先した、攻撃的な一瞬', en: 'an aggressive instant prioritizing impact and speed' }
  },
  xiaolin_040_22ed3784: {
    noteOrder: 17,
    title: '低姿勢で片脚を伸ばしたポーズ',
    noteSection: '動きのある戦闘',
    category: 'battle_motion',
    tags: ['横蹴り', '低姿勢', '夕日', '中庭'],
    caption: '夕日の中庭で、低い姿勢から横へ伸びる蹴りを放つ一枚。長い脚線と逆光が、技の伸びを強く見せる。',
    scene: { ja: '夕日が差す道場の中庭または寺院前の石畳', en: 'a dojo courtyard or temple stone path lit by sunset' },
    pose: { ja: '低く沈み込み、片脚を横へ長く伸ばして蹴る', en: 'sinking low and extending one leg sideways into a long kick' },
    intent: { ja: '低い重心から伸びる蹴りの切れ味', en: 'the sharpness of a kick extending from a low center of gravity' },
    composition: { ja: '横長に近い画面で脚のラインを大きく取り、夕日を背後に置く', en: 'use a wide-feeling frame to emphasize the leg line, placing the sunset behind' },
    strengths: { ja: ['伸びる脚のシルエット', '夕日の逆光', '低い姿勢の安定感'], en: ['extended leg silhouette', 'sunset backlight', 'stability of the low stance'] },
    motion: { ja: '蹴り足の先と衣装の裾に中程度のブラーを入れ、胴体は安定させる', en: 'use medium blur on the kicking foot and clothing hem while keeping the torso stable' },
    lighting: { ja: '背後の夕日による暖かい逆光と、石畳の反射', en: 'warm sunset backlight and reflection from the stone paving' },
    mood: { ja: '美しいが鋭い、型と実戦の中間の緊張感', en: 'beautiful but sharp, between formal technique and real combat' }
  },
  xiaolin_041_39fab055: {
    noteOrder: 18,
    title: '拳が迫る一点突破の正拳',
    noteSection: '動きのある戦闘',
    category: 'battle_motion',
    tags: ['正拳', '拳アップ', '遠近感', 'スピードライン'],
    caption: '拳をカメラ前へ突き出した一点突破のアクション。拳の巨大な遠近感と背景の流れが、直線的な威力を出している。',
    scene: { ja: '道場外の中庭、建物を背にした戦闘の瞬間', en: 'a dojo courtyard combat moment with buildings behind' },
    pose: { ja: '拳をカメラへまっすぐ突き出し、体を低く前傾させる', en: 'thrusting a fist straight toward the camera while leaning forward low' },
    intent: { ja: '一点に集中した正拳の速度と突破力', en: 'the speed and piercing force of a straight punch focused on one point' },
    composition: { ja: '拳を画面手前に大きく置き、顔と体を奥へ配置する強い遠近構図', en: 'a strong perspective composition with the fist huge in the foreground and face/body behind' },
    strengths: { ja: ['拳の迫力あるパース', '背景の流線', '視線を一点に集める構図'], en: ['powerful fist perspective', 'streaming background lines', 'composition that concentrates attention on one point'] },
    motion: { ja: '拳の周囲と背景に強い直線ブラーを入れ、目線は残す', en: 'use strong linear blur around the fist and background while preserving the eyes' },
    lighting: { ja: '屋外の明るい光と影で、拳と顔の立体感を分ける', en: 'bright outdoor light and shadows separating the volume of the fist and face' },
    mood: { ja: '攻撃的で直線的、決め技に近い緊迫感', en: 'aggressive and direct, with the tension of a finishing strike' }
  },
  xiaolin_042_e3a08c52: {
    noteOrder: 19,
    title: '道場入口に立つ静かな肖像',
    noteSection: '立ち絵・紹介',
    category: 'portrait',
    tags: ['立ち絵', '道場', '肖像', 'キャラ紹介'],
    caption: '道場の入口に立つ、キャラクター紹介向きの落ち着いた一枚。背景の掛け軸と自然光が、武術家としての芯を見せている。',
    scene: { ja: '道場の入口付近、掛け軸と中庭が見える明るい室内', en: 'near the entrance of a dojo, with a hanging scroll and courtyard visible' },
    pose: { ja: '片手を軽く握り、正面を向いて自然に立つ', en: 'standing naturally while facing forward, one hand lightly clenched' },
    intent: { ja: 'キャラクター紹介としての落ち着き、芯の強さ、親しみやすさ', en: 'a character introduction showing composure, inner strength, and approachability' },
    composition: { ja: '上半身から全身寄りの縦構図で、道場の入口と掛け軸を背景に入れる', en: 'a vertical portrait-like composition including the dojo entrance and hanging scroll in the background' },
    strengths: { ja: ['表情の見やすさ', '衣装の確認しやすさ', '道場背景によるキャラ性'], en: ['clear facial expression', 'easy-to-read outfit details', 'character identity supported by the dojo background'] },
    motion: { ja: '動きは入れず、髪と衣装の自然なまとまりを重視する', en: 'avoid action; emphasize natural hair and clothing shape' },
    lighting: { ja: '入口から入る自然光で顔と衣装を明るく見せる', en: 'natural light from the entrance illuminating the face and outfit clearly' },
    mood: { ja: '落ち着いていて礼儀正しい、紹介用の静かな存在感', en: 'calm, polite, and quietly present for character introduction' }
  }
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

fs.mkdirSync(rulesDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });
writeJson(path.join(rulesDir, 'common_rules.json'), commonRules);
writeJson(path.join(rulesDir, 'xiaolin_character.json'), character);

const preserveObservationIds = new Set([
  'xiaolin_021_a83ca4f6',
  'xiaolin_036_45f4581f',
  'xiaolin_039_9c8c917e',
  'xiaolin_040_22ed3784'
]);

for (const [id, observation] of Object.entries(observations)) {
  const file = path.join(dataDir, `${id}.json`);
  const existing = fs.existsSync(file) ? readJson(file) : { id, imageFile: `${id}.png` };
  const sourceObservation = preserveObservationIds.has(id) && fs.existsSync(file)
    ? { ...observation, ...existing }
    : observation;
  const item = {
    id,
    imageFile: existing.imageFile || `${id}.png`,
    image: `../../selected/${existing.imageFile || `${id}.png`}`,
    imageForMarkdown: `selected/${existing.imageFile || `${id}.png`}`,
    ...sourceObservation,
    status: 'ready',
    subjectHandling,
    style: commonRules.defaults.style,
    details: commonRules.defaults.details,
    negative: commonRules.negative,
    reviewChecklist: commonRules.reviewChecklist
  };
  writeJson(file, item);
}

console.log(JSON.stringify({ updated: Object.keys(observations).length }, null, 2));
