# プロンプト記事化ワークフロー

## フォルダの役割

- `inbox`: ダウンロード直後の未整理画像
- `selected`: 一時的な仕分け場所。記事化・library登録が終わったら削除してよい
- `library/images`: 継続利用する採用画像の保管場所
- `library/index`: 画像ごとの分類データ、テーマ別インデックス
- `prompt_lab/ideas`: ネタ帳。まだプロンプト化しないアイデア
- `prompt_lab/prompt_drafts`: 記事や生成に使うプロンプト案
- `prompt_lab/research_notes`: note記事、表現、武術/構図/光の調査メモ
- `article_materials`: 記事ごとの出力物

## 基本フロー

1. `inbox` に画像を入れる
2. 使いたいものだけ `selected` に置く
3. 画像を見て `article_materials/prompt_data/*.json` を整備する
4. `library/images` に登録する
5. `articleThemes / camera / lighting / technique / motionTags` で分類する
6. テーマ別一覧を生成する
7. 記事ごとに必要な画像だけ抽出する
8. 記事化後、`selected` は削除してよい

## 注意

`selected` は永続保管場所ではない。記事や分類が完了したら、画像は `library/images` と `article_materials/note_article/images` を正とする。

## 主要コマンド

分類タグを付け直し、`selected` から `library/images` へコピーする:

```powershell
node "04_asset_tools/prompt-builder/classify_prompt_library.js"
```

テーマ別一覧を再生成する:

```powershell
node "04_asset_tools/prompt-builder/build_theme_indexes.js"
```

`selected` を削除してよい状態か確認する:

```powershell
node "04_asset_tools/prompt-builder/check_selected_can_delete.js"
```

note記事を再生成する:

```powershell
python "04_asset_tools/prompt-builder/build_note_article.py"
```
