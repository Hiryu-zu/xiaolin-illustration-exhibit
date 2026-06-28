# GIFツール

連続して見える戦闘カットを確認するための簡易GIF作成ツール。
滑らかなアニメ化ではなく、ポーズが一連の流れとして読めるかを確認する用途。

## 使い方

```powershell
python "C:\モデルイラスト生成ワークフロー\04_gif_tools\make_preview_gif.py" `
  --frames `
  "C:\モデルイラスト生成ワークフロー\03_named_images\牙焔\牙焔_実戦基礎動作_01左前手直突き.png" `
  "C:\モデルイラスト生成ワークフロー\03_named_images\牙焔\牙焔_実戦基礎動作_02右後手直突き.png" `
  "C:\モデルイラスト生成ワークフロー\03_named_images\牙焔\牙焔_実戦基礎動作_03左踏み込み掌底.png" `
  --out "C:\モデルイラスト生成ワークフロー\03_named_images\牙焔\牙焔_確認用.gif"
```

## オプション

- `--duration`
  - 1コマの表示時間。ミリ秒。初期値は `220`。
- `--width`
  - 出力横幅。初期値は `960`。
- `--height`
  - 出力縦幅。初期値は `540`。
- `--loop`
  - 0なら無限ループ。

## 見るポイント

- 体の向きが急に飛びすぎていないか。
- 足の接地や重心が破綻していないか。
- 連続技として見るより、ノベルゲームの連番カットとして気持ちよくつながるか。
- 採用カットと修正候補を分けられるか。

## 小鈴 基礎動作三方向GIF

小鈴の第一成果物では、正面・左側面・右側面ごとに、以下の5フレームで確認する。

```text
01構え -> 02途中 -> 03到達 -> 02途中 -> 01構え
```

引き戻し動作は別生成しない。
`02途中` と `01構え` を再利用し、逆再生のように戻す。

例:

```powershell
python "C:\モデルイラスト生成ワークフロー\04_gif_tools\make_preview_gif.py" `
  --frames `
  "C:\モデルイラスト生成ワークフロー\03_named_images\小鈴\03_basic_motion_three_views\01_前手直突き\正面_01構え.png" `
  "C:\モデルイラスト生成ワークフロー\03_named_images\小鈴\03_basic_motion_three_views\01_前手直突き\正面_02途中.png" `
  "C:\モデルイラスト生成ワークフロー\03_named_images\小鈴\03_basic_motion_three_views\01_前手直突き\正面_03到達.png" `
  "C:\モデルイラスト生成ワークフロー\03_named_images\小鈴\03_basic_motion_three_views\01_前手直突き\正面_02途中.png" `
  "C:\モデルイラスト生成ワークフロー\03_named_images\小鈴\03_basic_motion_three_views\01_前手直突き\正面_01構え.png" `
  --out "C:\モデルイラスト生成ワークフロー\03_named_images\小鈴\04_gif_check\小鈴_01前手直突き_正面_確認.gif" `
  --duration 180
```

## 4列×2段アクションシートから作る

`04_asset_tools/extract_action_sheet_frames.py` で、使用するパネル番号だけをPNGへ切り出せる。

```powershell
python "C:\モデルイラスト生成ワークフロー\04_asset_tools\extract_action_sheet_frames.py" `
  --input "C:\モデルイラスト生成ワークフロー\03_named_images\小鈴\08_generated_scenes\01_歩行\小鈴_C01基本移動8種_キャラクター化_01.png" `
  --out-dir "C:\モデルイラスト生成ワークフロー\tmp\c01_frames" `
  --panels "2,3,4,8" `
  --erase-number
```

出力される `frame_02.png`、`frame_03.png`、`frame_04.png`、`frame_08.png` を `make_preview_gif.py` の `--frames` へ順番に渡す。
