const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const dataDir = path.join(root, 'article_materials', 'prompt_data');
const selectedDir = path.join(root, 'selected');
const libraryImagesDir = path.join(root, 'library', 'images');
const libraryIndexDir = path.join(root, 'library', 'index');
const taxonomyDir = path.join(root, 'prompt_lab', 'taxonomy');

const taxonomy = {
  articleThemes: {
    action_pose: 'アクションポーズ一覧',
    still_to_motion: '静から動への武術ポーズ',
    camera_work: 'カメラワーク別',
    lighting: 'ライティング別',
    strike: '打撃別',
    kick: '蹴り別',
    meditation: '静の修練',
    stance: '構えと間合い',
    character_pose: 'キャラクター紹介'
  },
  camera: {
    front: '正面構図',
    low_angle: 'ローアングル',
    closeup: '超接近',
    strong_perspective: '強い遠近感',
    wide_panorama: '横長パノラマ',
    symmetrical: '対称構図',
    diagonal: '斜め構図',
    centered: '中央配置',
    negative_space: '余白重視',
    side_profile: '横顔'
  },
  lighting: {
    backlight: '逆光',
    rim_light: 'リムライト',
    sunset: '夕景',
    morning_mist: '朝靄',
    dappled_light: '木漏れ日',
    diffused_white: '白い拡散光',
    interior_light: '室内光',
    water_reflection: '水面反射',
    dust_reflection: '砂埃の反射',
    soft_natural: '柔らかい自然光'
  },
  technique: {
    meditation: '瞑想',
    standing_stance: '構え',
    palm_strike: '掌底',
    straight_punch: '正拳',
    tile_break: '瓦割り',
    close_combat: '接近戦',
    kick: '蹴り',
    extended_leg_pose: '片脚を伸ばしたポーズ',
    rotation: '旋回',
    dash: '突進',
    etiquette: '礼法',
    portrait: '立ち絵'
  },
  motionTags: {
    stillness: '静止',
    subtle_breeze: '微風',
    motion_blur: 'モーションブラー',
    speed_lines: 'スピードライン',
    wind_trails: '風の軌跡',
    debris: '破片',
    dust: '砂埃',
    impact: '衝撃',
    reflection: '反射',
    low_center: '低い重心'
  }
};

const classification = {
  xiaolin_009_1a7a89db: {
    articleThemes: ['still_to_motion', 'stance', 'camera_work', 'lighting'],
    camera: ['low_angle', 'centered', 'strong_perspective'],
    lightingClass: ['backlight', 'rim_light', 'sunset'],
    technique: ['standing_stance'],
    motionTags: ['stillness', 'low_center']
  },
  xiaolin_010_eab4c340: {
    articleThemes: ['still_to_motion', 'camera_work', 'lighting'],
    camera: ['wide_panorama', 'negative_space'],
    lightingClass: ['dappled_light', 'morning_mist', 'soft_natural'],
    technique: ['portrait'],
    motionTags: ['stillness', 'subtle_breeze']
  },
  xiaolin_011_27ed9fc5: {
    articleThemes: ['still_to_motion', 'meditation', 'camera_work', 'lighting'],
    camera: ['wide_panorama', 'negative_space'],
    lightingClass: ['sunset', 'water_reflection', 'backlight'],
    technique: ['meditation'],
    motionTags: ['stillness', 'reflection']
  },
  xiaolin_012_3e3cddd0: {
    articleThemes: ['still_to_motion', 'stance', 'camera_work', 'lighting'],
    camera: ['centered', 'strong_perspective'],
    lightingClass: ['morning_mist', 'soft_natural', 'water_reflection'],
    technique: ['standing_stance'],
    motionTags: ['stillness', 'low_center', 'reflection']
  },
  xiaolin_015_b0f6ade9: {
    articleThemes: ['action_pose', 'strike', 'camera_work', 'lighting'],
    camera: ['diagonal', 'closeup'],
    lightingClass: ['interior_light', 'rim_light'],
    technique: ['palm_strike', 'close_combat'],
    motionTags: ['motion_blur', 'low_center']
  },
  xiaolin_016_7df317fc: {
    articleThemes: ['meditation', 'lighting'],
    camera: ['centered', 'negative_space'],
    lightingClass: ['soft_natural', 'interior_light'],
    technique: ['meditation'],
    motionTags: ['stillness']
  },
  xiaolin_017_123010d9: {
    articleThemes: ['meditation', 'lighting'],
    camera: ['centered'],
    lightingClass: ['morning_mist', 'soft_natural'],
    technique: ['meditation'],
    motionTags: ['stillness']
  },
  xiaolin_018_bb7e49e0: {
    articleThemes: ['meditation', 'lighting'],
    camera: ['centered', 'front'],
    lightingClass: ['interior_light', 'soft_natural'],
    technique: ['etiquette'],
    motionTags: ['stillness']
  },
  xiaolin_019_df4c1d0a: {
    articleThemes: ['still_to_motion', 'meditation', 'camera_work', 'lighting'],
    camera: ['front', 'centered', 'symmetrical'],
    lightingClass: ['sunset', 'backlight', 'water_reflection'],
    technique: ['meditation'],
    motionTags: ['stillness', 'reflection']
  },
  xiaolin_020_86b0a334: {
    articleThemes: ['meditation', 'camera_work', 'lighting'],
    camera: ['side_profile', 'negative_space'],
    lightingClass: ['diffused_white', 'dappled_light'],
    technique: ['meditation'],
    motionTags: ['stillness', 'subtle_breeze']
  },
  xiaolin_021_a83ca4f6: {
    articleThemes: ['still_to_motion', 'action_pose', 'camera_work', 'lighting'],
    camera: ['diagonal', 'strong_perspective'],
    lightingClass: ['dappled_light', 'rim_light'],
    technique: ['rotation'],
    motionTags: ['wind_trails', 'motion_blur', 'speed_lines', 'low_center']
  },
  xiaolin_022_78bf7425: {
    articleThemes: ['still_to_motion', 'meditation', 'camera_work', 'lighting'],
    camera: ['front', 'centered', 'symmetrical'],
    lightingClass: ['sunset', 'water_reflection', 'backlight'],
    technique: ['meditation'],
    motionTags: ['stillness', 'reflection']
  },
  xiaolin_023_a414c2cc: {
    articleThemes: ['still_to_motion', 'stance', 'strike', 'lighting'],
    camera: ['front', 'centered', 'strong_perspective'],
    lightingClass: ['sunset', 'backlight', 'dust_reflection'],
    technique: ['palm_strike', 'standing_stance'],
    motionTags: ['dust', 'low_center', 'impact']
  },
  xiaolin_024_7a70d879: {
    articleThemes: ['action_pose', 'camera_work'],
    camera: ['wide_panorama', 'diagonal'],
    lightingClass: ['soft_natural'],
    technique: ['dash'],
    motionTags: ['motion_blur', 'speed_lines', 'low_center']
  },
  xiaolin_036_45f4581f: {
    articleThemes: ['still_to_motion', 'action_pose', 'strike', 'camera_work'],
    camera: ['front', 'centered'],
    lightingClass: ['interior_light'],
    technique: ['tile_break'],
    motionTags: ['debris', 'impact', 'low_center']
  },
  xiaolin_039_9c8c917e: {
    articleThemes: ['still_to_motion', 'action_pose', 'kick', 'camera_work'],
    camera: ['closeup', 'strong_perspective'],
    lightingClass: ['dust_reflection', 'soft_natural'],
    technique: ['kick'],
    motionTags: ['motion_blur', 'speed_lines', 'dust', 'impact']
  },
  xiaolin_040_22ed3784: {
    articleThemes: ['still_to_motion', 'action_pose', 'kick', 'lighting'],
    camera: ['wide_panorama', 'diagonal'],
    lightingClass: ['sunset', 'backlight'],
    technique: ['extended_leg_pose'],
    motionTags: ['stillness', 'low_center', 'subtle_breeze']
  },
  xiaolin_041_39fab055: {
    articleThemes: ['action_pose', 'strike', 'camera_work'],
    camera: ['closeup', 'strong_perspective'],
    lightingClass: ['soft_natural'],
    technique: ['straight_punch'],
    motionTags: ['motion_blur', 'speed_lines', 'impact']
  },
  xiaolin_042_e3a08c52: {
    articleThemes: ['still_to_motion', 'character_pose', 'camera_work', 'lighting'],
    camera: ['front', 'centered'],
    lightingClass: ['soft_natural', 'interior_light'],
    technique: ['portrait'],
    motionTags: ['stillness']
  }
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

fs.mkdirSync(libraryImagesDir, { recursive: true });
fs.mkdirSync(libraryIndexDir, { recursive: true });
fs.mkdirSync(taxonomyDir, { recursive: true });
writeJson(path.join(taxonomyDir, 'visual_prompt_taxonomy.json'), taxonomy);

const libraryItems = [];
const files = fs.readdirSync(dataDir).filter((name) => name.endsWith('.json')).sort();
for (const file of files) {
  const itemPath = path.join(dataDir, file);
  const item = readJson(itemPath);
  const classes = classification[item.id] || {};
  const libraryFile = `${String(item.noteOrder).padStart(2, '0')}_${item.id}${path.extname(item.imageFile || '.png')}`;
  const copied = copyIfExists(path.join(selectedDir, item.imageFile), path.join(libraryImagesDir, libraryFile));
  const updated = {
    ...item,
    libraryImageFile: libraryFile,
    libraryImagePath: `library/images/${libraryFile}`,
    articleThemes: classes.articleThemes || [],
    camera: classes.camera || [],
    lightingClass: classes.lightingClass || [],
    technique: classes.technique || [],
    motionTags: classes.motionTags || []
  };
  writeJson(itemPath, updated);
  libraryItems.push({
    id: updated.id,
    noteOrder: updated.noteOrder,
    title: updated.title,
    imageFile: updated.imageFile,
    libraryImageFile: libraryFile,
    copied,
    category: updated.category,
    articleThemes: updated.articleThemes,
    camera: updated.camera,
    lightingClass: updated.lightingClass,
    technique: updated.technique,
    motionTags: updated.motionTags,
    caption: updated.caption
  });
}

writeJson(path.join(libraryIndexDir, 'image_library_index.json'), libraryItems);
console.log(JSON.stringify({ updated: libraryItems.length, copied: libraryItems.filter((item) => item.copied).length }, null, 2));
