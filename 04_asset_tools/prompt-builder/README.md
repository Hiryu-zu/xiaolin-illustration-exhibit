# Prompt Builder

`selected` の画像を、記事用のプロンプトHTML/Markdownに変換するためのローカルツールです。

## フォルダ構成

```text
selected/                              # 使いたい画像を置く場所
article_materials/prompt_data/          # 画像ごとの短い構造化データ
article_materials/prompt_rules/         # 共通ルール、固定キャラ設定
article_materials/html/                 # 記事作成時に見るHTML
article_materials/prompts/              # コピー・保管用Markdown
```

## 使い方

`selected` に新しい画像を追加したら、まず下書きJSONを作ります。

```powershell
node "04_asset_tools/prompt-builder/build_prompt_page.js" --init-selected
```

全画像分のHTML/Markdownを再生成します。

```powershell
node "04_asset_tools/prompt-builder/build_prompt_page.js" --all
```

1枚だけ再生成する場合は、JSON名またはIDを指定します。

```powershell
node "04_asset_tools/prompt-builder/build_prompt_page.js" xiaolin_009_1a7a89db
```

## 編集する場所

まず編集するのは `article_materials/prompt_data/*.json` です。
長い英語・日本語プロンプトを直接持たず、短い部品として保存します。
HTML側で「汎用」「固定キャラ」「英語」「日本語」を切り替えます。

## 目的

- トークンを減らす
- 画像ごとの意図、構図、注意点を見失わない
- note記事用に、画像とプロンプトを並べて確認しやすくする
- 固定キャラ版と汎用版を同じデータから作れるようにする
