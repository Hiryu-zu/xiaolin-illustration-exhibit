# selected フォルダの使い方

`selected` は、今後も新しく作成した画像を一時的に入れるための仕分けフォルダです。

## 運用ルール

- フォルダ自体は残す
- 記事化・library登録が終わったら、中身だけ削除する
- 採用画像の永続保管場所は `library/images`
- 記事ごとの投稿用画像は `article_materials/note_article/images`

## 中身だけ削除する例

```powershell
Get-ChildItem -LiteralPath selected -Force | Remove-Item -Recurse
```

削除前に必ず確認:

```powershell
node "04_asset_tools/prompt-builder/check_selected_can_delete.js"
```
