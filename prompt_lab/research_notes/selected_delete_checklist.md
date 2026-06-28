# selected 削除前チェックリスト

`selected` は仕分け用の一時フォルダです。**フォルダ自体は残し、中身だけ削除**します。

- [ ] `library/images` に採用画像がコピーされている
- [ ] `article_materials/prompt_data/*.json` に分類タグが入っている
- [ ] `library/index/image_library_index.json` が生成されている
- [ ] `library/index/theme_index.json` が生成されている
- [ ] `article_materials/theme_indexes/theme_index.md` が生成されている
- [ ] 投稿用記事に必要な画像は `article_materials/note_article/images` にある
- [ ] `node 04_asset_tools/prompt-builder/check_selected_can_delete.js` で問題がない

中身だけ削除するコマンド例:

```powershell
Get-ChildItem -LiteralPath selected -Force | Where-Object { $_.Name -ne 'README.md' } | Remove-Item -Recurse
```
