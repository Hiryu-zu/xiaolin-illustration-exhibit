import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / 'article_materials' / 'prompt_data'
SELECTED_DIR = ROOT / 'selected'
OUT_DIR = ROOT / 'article_materials' / 'note_article'
IMAGES_DIR = OUT_DIR / 'images'
PROMPTS_DIR = OUT_DIR / 'prompts'

J = lambda s: s.encode('ascii').decode('unicode_escape')

LABEL_HIGHLIGHTS = J('\\u898b\\u3069\\u3053\\u308d')
LABEL_PROMPT_AIM = J('\\u30d7\\u30ed\\u30f3\\u30d7\\u30c8\\u306e\\u72d9\\u3044')
SUMMARY_GENERIC = J('\\u30b3\\u30d4\\u30fc\\u7528\\u30d7\\u30ed\\u30f3\\u30d7\\u30c8\\uff08\\u53c2\\u8003\\u753b\\u50cf\\u7528\\uff09')
JP_COMMA = J('\\u3001')
JP_PERIOD = J('\\u3002')


PUBLISH_IDS = [
    'xiaolin_010_eab4c340',
    'xiaolin_011_27ed9fc5',
    'xiaolin_019_df4c1d0a',
    'xiaolin_022_78bf7425',
    'xiaolin_009_1a7a89db',
    'xiaolin_012_3e3cddd0',
    'xiaolin_023_a414c2cc',
    'xiaolin_021_a83ca4f6',
    'xiaolin_036_45f4581f',
    'xiaolin_039_9c8c917e',
    'xiaolin_040_22ed3784',
    'xiaolin_042_e3a08c52',
]

SECTION_ORDER = [
    J('\\u5c0e\\u5165\\u30fb\\u4e16\\u754c\\u89b3'),
    J('\\u9759\\u306e\\u4fee\\u7df4'),
    J('\\u69cb\\u3048\\u3068\\u9593\\u5408\\u3044'),
    J('\\u52d5\\u304d\\u306e\\u3042\\u308b\\u6226\\u95d8'),
    J('\\u30ad\\u30e3\\u30e9\\u30af\\u30bf\\u30fc\\u7d39\\u4ecb'),
]

SECTION_MAP = {
    'environment': SECTION_ORDER[0],
    'meditation': SECTION_ORDER[1],
    'training': SECTION_ORDER[1],
    'battle_stance': SECTION_ORDER[2],
    'battle_motion': SECTION_ORDER[3],
    'portrait': SECTION_ORDER[4],
}

INTRO = {
    SECTION_ORDER[0]: J('\\u307e\\u305a\\u306f\\u3001\\u5834\\u6240\\u306e\\u7a7a\\u6c17\\u3092\\u898b\\u305b\\u308b\\u30ab\\u30c3\\u30c8\\u3067\\u3059\\u3002\\u6b66\\u8853\\u30a4\\u30e9\\u30b9\\u30c8\\u3067\\u306f\\u3001\\u80cc\\u666f\\u306e\\u6e7f\\u5ea6\\u3084\\u5965\\u884c\\u304d\\u304c\\u30ad\\u30e3\\u30e9\\u30af\\u30bf\\u30fc\\u306e\\u8aac\\u5f97\\u529b\\u3092\\u652f\\u3048\\u3066\\u304f\\u308c\\u307e\\u3059\\u3002'),
    SECTION_ORDER[1]: J('\\u52d5\\u304d\\u306e\\u524d\\u306b\\u3042\\u308b\\u9759\\u3051\\u3055\\u306e\\u30ab\\u30c3\\u30c8\\u3067\\u3059\\u3002\\u547c\\u5438\\u3001\\u5ea7\\u6cd5\\u3001\\u53cd\\u5c04\\u3001\\u67d4\\u3089\\u304b\\u3044\\u5149\\u3092\\u4f7f\\u3063\\u3066\\u3001\\u6b66\\u8853\\u5bb6\\u3068\\u3057\\u3066\\u306e\\u5185\\u9762\\u3092\\u898b\\u305b\\u307e\\u3059\\u3002'),
    SECTION_ORDER[2]: J('\\u3053\\u3053\\u3067\\u306f\\u3001\\u4f4e\\u3044\\u91cd\\u5fc3\\u3084\\u624b\\u306e\\u4f4d\\u7f6e\\u3001\\u76f8\\u624b\\u3068\\u306e\\u8ddd\\u96e2\\u611f\\u3092\\u91cd\\u8996\\u3057\\u307e\\u3059\\u3002\\u6d3e\\u624b\\u306a\\u653b\\u6483\\u3088\\u308a\\u3082\\u3001\\u52d5\\u304d\\u51fa\\u3059\\u76f4\\u524d\\u306e\\u5727\\u3092\\u72d9\\u3063\\u3066\\u3044\\u307e\\u3059\\u3002'),
    SECTION_ORDER[3]: J('\\u30a2\\u30af\\u30b7\\u30e7\\u30f3\\u7cfb\\u3067\\u306f\\u3001\\u901f\\u5ea6\\u3084\\u885d\\u6483\\u3092\\u51fa\\u3057\\u3064\\u3064\\u3001\\u9854\\u3068\\u4f53\\u5e79\\u304c\\u8aad\\u3081\\u308b\\u3088\\u3046\\u306b\\u3059\\u308b\\u306e\\u304c\\u30dd\\u30a4\\u30f3\\u30c8\\u3067\\u3059\\u3002\\u30d6\\u30e9\\u30fc\\u306f\\u80cc\\u666f\\u3001\\u8896\\u3001\\u9aea\\u3001\\u7834\\u7247\\u306b\\u5bc4\\u305b\\u307e\\u3059\\u3002'),
    SECTION_ORDER[4]: J('\\u6700\\u5f8c\\u306f\\u3001\\u30ad\\u30e3\\u30e9\\u30af\\u30bf\\u30fc\\u3092\\u898b\\u305b\\u308b\\u305f\\u3081\\u306e\\u9759\\u304b\\u306a\\u4e00\\u679a\\u3067\\u3059\\u3002\\u8863\\u88c5\\u3084\\u9854\\u7acb\\u3061\\u3001\\u9053\\u5834\\u3068\\u306e\\u95a2\\u4fc2\\u304c\\u5206\\u304b\\u308b\\u3088\\u3046\\u306b\\u3057\\u3066\\u3044\\u307e\\u3059\\u3002'),
}

CHARACTER_BLOCK = 'The martial artist is Xiaolin, a 21-year-old female Chinese martial artist, 165 cm tall. She has a balanced, agile, healthy martial-arts build, neither too thin nor overly muscular. She has glossy black short bob hair with bangs and side locks framing her face, amber to yellow-brown eyes, and a calm face that balances cuteness with dignified sharpness. She wears a white-and-black Chinese martial arts outfit: a white Chinese-style top with black trim and frog buttons, black fitted martial arts pants or leggings, and lightweight black-and-white martial arts shoes. Her expression and presence are serious, focused, disciplined, quietly approachable, and not too cold.'


def load_items():
    items = []
    for file in DATA_DIR.glob('*.json'):
        items.append(json.loads(file.read_text(encoding='utf-8-sig')))
    return sorted(items, key=lambda item: item['noteOrder'])


def slug(value):
    value = re.sub(r'[\\/:*?"<>|]', '', value)
    value = re.sub(r'[\s\u3000]+', '_', value)
    return value[:40]


def clean_dir(directory):
    directory.mkdir(parents=True, exist_ok=True)
    for child in directory.iterdir():
        if child.is_file():
            child.unlink()


def copy_images(items):
    clean_dir(IMAGES_DIR)
    for index, item in enumerate(items, start=1):
        item['publishOrder'] = index
        src = SELECTED_DIR / item['imageFile']
        target = f"{index:02d}_{slug(item['title'])}{src.suffix}"
        item['noteImageFile'] = target
        item['noteImagePath'] = f"images/{target}"
        shutil.copy2(src, IMAGES_DIR / target)


def generic_prompt(item):
    return '\n\n'.join([
        'Use the reference image as the main guide for the character, outfit, hairstyle, body type, composition, and mood.',
        f"Preserve {item['subjectHandling']['en']}.",
        f"Create a high-quality anime-style illustration set in {item['scene']['en']}. The pose/action is {item['pose']['en']}, expressing {item['intent']['en']}.",
        f"Composition: {item['composition']['en']}. Emphasize {', '.join(item['strengths']['en'])}.",
        f"Keep {item['motion']['en']}, {item['lighting']['en']}, and {item['mood']['en']}. The scene should feel quiet, focused, and cinematic rather than chaotic.",
        f"Use {', '.join(item['details']['en'])}, {item['style']['en']}.",
        f"Avoid {', '.join(item['negative']['en'])}."
    ])


def fixed_prompt(item):
    return generic_prompt(item) + '\n\n' + CHARACTER_BLOCK


def write_prompt_files(items):
    clean_dir(PROMPTS_DIR)
    for index, item in enumerate(items, start=1):
        base = f"{index:02d}_{item['id']}"
        (PROMPTS_DIR / f'{base}_generic.txt').write_text(generic_prompt(item), encoding='utf-8')


def item_block(item):
    return ''.join([
        f"### {item['title']}\n\n",
        f"![{item['title']}]({item['noteImagePath']})\n\n",
        f"{item['caption']}\n\n",
        f"**{LABEL_HIGHLIGHTS}**: {JP_COMMA.join(item['strengths']['ja'])}{JP_PERIOD}\n\n",
        f"**{LABEL_PROMPT_AIM}**: {item['intent']['ja']}{JP_PERIOD}{item['composition']['ja']}{JP_PERIOD}{item['motion']['ja']}{JP_PERIOD}\n\n",
        '<details>\n',
        f"<summary>{SUMMARY_GENERIC}</summary>\n\n",
        '```text\n', generic_prompt(item), '\n```\n\n',
        '</details>\n\n',
    ])


def build_article(items):
    by_section = {section: [] for section in SECTION_ORDER}
    for item in items:
        by_section[SECTION_MAP.get(item['category'], SECTION_ORDER[3])].append(item)

    lines = []
    lines.append(J('# AI\\u3067\\u4f5c\\u308b\\u6b66\\u8853\\u30dd\\u30fc\\u30ba\\u306e\\u30d7\\u30ed\\u30f3\\u30d7\\u30c8\\u96c6\\uff5c\\u9759\\u304b\\u3089\\u52d5\\u3078\\u3001\\u69cb\\u56f3\\u3068\\u30e2\\u30fc\\u30b7\\u30e7\\u30f3\\u3092\\u7d44\\u307f\\u7acb\\u3066\\u308b'))
    lines.append('')
    lines.append(J('\\u4eca\\u56de\\u306f\\u3001\\u53c2\\u8003\\u753b\\u50cf\\u3092\\u6d3b\\u304b\\u3057\\u306a\\u304c\\u3089\\u3001\\u69d8\\u3005\\u306a\\u6b66\\u8853\\u30dd\\u30fc\\u30ba\\u3092\\u4f5c\\u308b\\u305f\\u3081\\u306e\\u30d7\\u30ed\\u30f3\\u30d7\\u30c8\\u3092\\u6574\\u7406\\u3057\\u307e\\u3057\\u305f\\u3002\\u9759\\u304b\\u306a\\u7791\\u60f3\\u304b\\u3089\\u3001\\u69cb\\u3048\\u3001\\u885d\\u6483\\u306e\\u3042\\u308b\\u30a2\\u30af\\u30b7\\u30e7\\u30f3\\u307e\\u3067\\u3001\\u9759\\u304b\\u3089\\u52d5\\u3078\\u306e\\u6d41\\u308c\\u3067\\u898b\\u305b\\u3066\\u3044\\u304d\\u307e\\u3059\\u3002'))
    lines.append('')
    lines.append(J('\\u305f\\u3060\\u30ad\\u30e3\\u30e9\\u30af\\u30bf\\u30fc\\u3092\\u63cf\\u304f\\u3060\\u3051\\u3067\\u306f\\u306a\\u304f\\u3001\\u4f4e\\u3044\\u91cd\\u5fc3\\u3001\\u9593\\u5408\\u3044\\u3001\\u30e2\\u30fc\\u30b7\\u30e7\\u30f3\\u30d6\\u30e9\\u30fc\\u3001\\u9006\\u5149\\u3001\\u753b\\u9762\\u5185\\u306e\\u6d41\\u308c\\u306a\\u3069\\u3001\\u6b66\\u8853\\u3089\\u3057\\u3044\\u8eab\\u4f53\\u611f\\u899a\\u304c\\u4f1d\\u308f\\u308b\\u3088\\u3046\\u306b\\u30d7\\u30ed\\u30f3\\u30d7\\u30c8\\u3092\\u7d44\\u3093\\u3067\\u3044\\u307e\\u3059\\u3002'))
    lines.append('')
    lines.append(J('\\u3053\\u306e\\u8a18\\u4e8b\\u306e\\u30d7\\u30ed\\u30f3\\u30d7\\u30c8\\u306f\\u3001\\u30bc\\u30ed\\u304b\\u3089\\u30ad\\u30e3\\u30e9\\u30af\\u30bf\\u30fc\\u3092\\u6307\\u5b9a\\u3059\\u308b\\u306e\\u3067\\u306f\\u306a\\u304f\\u3001\\u53c2\\u8003\\u753b\\u50cf\\u3092\\u6e21\\u3057\\u3066\\u3001\\u305d\\u306e\\u4eba\\u7269\\u30fb\\u670d\\u88c5\\u30fb\\u9aea\\u578b\\u30fb\\u4f53\\u578b\\u3092\\u4fdd\\u6301\\u3059\\u308b\\u4f5c\\u308a\\u3067\\u3059\\u3002\\u30d7\\u30ed\\u30f3\\u30d7\\u30c8\\u5074\\u3067\\u306f\\u3001\\u6b66\\u8853\\u3089\\u3057\\u3044\\u91cd\\u5fc3\\u3001\\u69cb\\u56f3\\u3001\\u5149\\u3001\\u30e2\\u30fc\\u30b7\\u30e7\\u30f3\\u306e\\u898b\\u305b\\u65b9\\u3092\\u88dc\\u5f37\\u3059\\u308b\\u3053\\u3068\\u3092\\u72d9\\u3044\\u306b\\u3057\\u3066\\u3044\\u307e\\u3059\\u3002'))
    lines.append('')
    lines.append(J('## \\u57fa\\u672c\\u65b9\\u91dd'))
    lines.append('')
    for bullet in [
        J('\\u53c2\\u8003\\u753b\\u50cf\\u306e\\u4eba\\u7269\\u30fb\\u670d\\u88c5\\u30fb\\u9aea\\u578b\\u30fb\\u4f53\\u578b\\u306f\\u4fdd\\u6301\\u3059\\u308b'),
        J('\\u30d7\\u30ed\\u30f3\\u30d7\\u30c8\\u3067\\u306f\\u3001\\u69cb\\u56f3\\u3001\\u5149\\u3001\\u52d5\\u304d\\u3001\\u7a7a\\u6c17\\u611f\\u3092\\u88dc\\u5f37\\u3059\\u308b'),
        J('\\u30a2\\u30af\\u30b7\\u30e7\\u30f3\\u3067\\u306f\\u3001\\u9854\\u3068\\u4f53\\u5e79\\u3092\\u5d29\\u3055\\u305a\\u3001\\u30d6\\u30e9\\u30fc\\u306f\\u8896\\u30fb\\u9aea\\u30fb\\u80cc\\u666f\\u30fb\\u7834\\u7247\\u306a\\u3069\\u306b\\u5bc4\\u305b\\u308b'),
    ]:
        lines.append(f'- {bullet}')
    lines.append('')
    lines.append(J('## \\u4eca\\u56de\\u306e\\u898b\\u65b9'))
    lines.append('')
    lines.append(J('\\u9759\\u304b\\u306a\\u7791\\u60f3\\u7cfb\\u306f\\u300c\\u547c\\u5438\\u300d\\u300c\\u4f59\\u767d\\u300d\\u300c\\u5149\\u300d\\u3092\\u3001\\u69cb\\u3048\\u7cfb\\u306f\\u300c\\u91cd\\u5fc3\\u300d\\u300c\\u9593\\u5408\\u3044\\u300d\\u300c\\u8996\\u7dda\\u8a98\\u5c0e\\u300d\\u3092\\u3001\\u6226\\u95d8\\u7cfb\\u306f\\u300c\\u901f\\u5ea6\\u300d\\u300c\\u8ecc\\u8de1\\u300d\\u300c\\u885d\\u6483\\u300d\\u3092\\u4e2d\\u5fc3\\u306b\\u898b\\u3066\\u3044\\u307e\\u3059\\u3002'))
    lines.append('')
    md = '\n'.join(lines) + '\n\n'
    for section in SECTION_ORDER:
        section_items = by_section[section]
        if not section_items:
            continue
        md += f'## {section}\n\n{INTRO[section]}\n\n'
        for item in section_items:
            md += item_block(item)
    md += J('## \\u4f7f\\u3044\\u56de\\u3059\\u6642\\u306e\\u8abf\\u6574\\u30dd\\u30a4\\u30f3\\u30c8') + '\n\n'
    md += J('- \\u30a2\\u30af\\u30b7\\u30e7\\u30f3\\u304c\\u6fc0\\u3057\\u3044\\u753b\\u50cf\\u3067\\u306f\\u3001`keep the face and torso readable` \\u306e\\u3088\\u3046\\u306b\\u9854\\u3068\\u4f53\\u5e79\\u3092\\u6b8b\\u3059\\u6307\\u5b9a\\u3092\\u5165\\u308c\\u308b') + '\n'
    md += J('- \\u7791\\u60f3\\u3084\\u9759\\u304b\\u306a\\u69cb\\u56f3\\u3067\\u306f\\u3001\\u30d6\\u30e9\\u30fc\\u3088\\u308a\\u3082\\u4f59\\u767d\\u3001\\u53cd\\u5c04\\u3001\\u5149\\u306e\\u67d4\\u3089\\u304b\\u3055\\u3092\\u512a\\u5148\\u3059\\u308b') + '\n'
    md += J('- \\u53c2\\u8003\\u753b\\u50cf\\u3092\\u4f7f\\u3046\\u5834\\u5408\\u3001\\u4eba\\u7269\\u8aac\\u660e\\u3092\\u76db\\u308a\\u3059\\u304e\\u308b\\u3068\\u670d\\u88c5\\u3084\\u9aea\\u578b\\u304c\\u4e0a\\u66f8\\u304d\\u3055\\u308c\\u3084\\u3059\\u3044') + '\n'
    md += '\n'
    md += J('## \\u307e\\u3068\\u3081') + '\n\n'
    md += J('\\u6b66\\u8853\\u30a4\\u30e9\\u30b9\\u30c8\\u306f\\u3001\\u30dd\\u30fc\\u30ba\\u540d\\u3060\\u3051\\u3067\\u306f\\u96f0\\u56f2\\u6c17\\u304c\\u51fa\\u306b\\u304f\\u3044\\u306e\\u3067\\u3001\\u91cd\\u5fc3\\u3001\\u9593\\u5408\\u3044\\u3001\\u5149\\u3001\\u753b\\u9762\\u5185\\u306e\\u6d41\\u308c\\u3092\\u30bb\\u30c3\\u30c8\\u3067\\u6307\\u5b9a\\u3059\\u308b\\u3068\\u72d9\\u3044\\u304c\\u4f1d\\u308f\\u308a\\u3084\\u3059\\u304f\\u306a\\u308a\\u307e\\u3059\\u3002') + '\n\n'
    md += J('\\u7279\\u306b\\u5c0f\\u9234\\u306e\\u3088\\u3046\\u306a\\u30ad\\u30e3\\u30e9\\u30af\\u30bf\\u30fc\\u3067\\u306f\\u3001\\u6d3e\\u624b\\u306a\\u653b\\u6483\\u3060\\u3051\\u3067\\u306a\\u304f\\u3001\\u9759\\u304b\\u306a\\u7791\\u60f3\\u3084\\u793c\\u6cd5\\u306e\\u30ab\\u30c3\\u30c8\\u3092\\u6df7\\u305c\\u308b\\u3053\\u3068\\u3067\\u3001\\u6b66\\u8853\\u5bb6\\u3068\\u3057\\u3066\\u306e\\u8aac\\u5f97\\u529b\\u304c\\u51fa\\u3057\\u3084\\u3059\\u304f\\u306a\\u308a\\u307e\\u3057\\u305f\\u3002') + '\n'
    return md


def build_checklist(items):
    md = J('# note\\u6295\\u7a3f\\u524d\\u30c1\\u30a7\\u30c3\\u30af\\u30ea\\u30b9\\u30c8') + '\n\n'
    for item in [
        J('\\u30bf\\u30a4\\u30c8\\u30eb\\u3092\\u6700\\u7d42\\u6c7a\\u5b9a\\u3059\\u308b'),
        J('note\\u4e0a\\u3067\\u753b\\u50cf\\u3092\\u30a2\\u30c3\\u30d7\\u30ed\\u30fc\\u30c9\\u3057\\u3001Markdown\\u5185\\u306e\\u753b\\u50cf\\u4f4d\\u7f6e\\u306b\\u5408\\u308f\\u305b\\u308b'),
        J('\\u30d7\\u30ed\\u30f3\\u30d7\\u30c8\\u3092\\u5168\\u6587\\u8f09\\u305b\\u308b\\u304b\\u3001\\u4e00\\u90e8\\u3060\\u3051\\u8f09\\u305b\\u308b\\u304b\\u6c7a\\u3081\\u308b'),
        J('\\u8aad\\u8005\\u5411\\u3051\\u306b\\u9577\\u3059\\u304e\\u308b\\u7b87\\u6240\\u3092\\u6298\\u308a\\u305f\\u305f\\u3080'),
        J('\\u8aa4\\u5b57\\u3001\\u753b\\u50cf\\u3068\\u8aac\\u660e\\u306e\\u30ba\\u30ec\\u3001\\u540c\\u3058\\u8868\\u73fe\\u306e\\u7e70\\u308a\\u8fd4\\u3057\\u3092\\u78ba\\u8a8d\\u3059\\u308b'),
    ]:
        md += f'- [ ] {item}\n'
    md += '\n## ' + J('\\u63b2\\u8f09\\u753b\\u50cf') + '\n\n'
    for item in items:
        md += f"- [ ] {item.get('publishOrder', item['noteOrder']):02d} {item['title']} - {item['noteImagePath']}\n"
    return md


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    all_items = load_items()
    by_id = {item['id']: item for item in all_items}
    items = [by_id[item_id] for item_id in PUBLISH_IDS]
    copy_images(items)
    write_prompt_files(items)
    (OUT_DIR / 'martial_arts_pose_prompt_article.md').write_text(build_article(items), encoding='utf-8')
    (OUT_DIR / 'posting_checklist.md').write_text(build_checklist(items), encoding='utf-8')
    print(json.dumps({'articlePath': str(OUT_DIR / 'martial_arts_pose_prompt_article.md'), 'images': len(items), 'sourceItems': len(all_items)}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
