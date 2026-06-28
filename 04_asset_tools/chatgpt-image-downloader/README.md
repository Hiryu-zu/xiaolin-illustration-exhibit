# ChatGPT Image Batch Downloader

Chromeでログイン済みのChatGPTチャットから生成画像URLを集め、指定したローカルフォルダへまとめて保存するツールです。

## 初回セットアップ

1. Chromeで `chrome://extensions` を開く。
2. 右上の `デベロッパー モード` をオンにする。
3. `パッケージ化されていない拡張機能を読み込む` を押す。
4. このフォルダを選ぶ。

```text
C:\Projects\01_AI画像・動画\小鈴（シャオリン）のイラスト展\04_asset_tools\chatgpt-image-downloader\extension
```

5. 読み込まれた拡張機能の `ID` をコピーする。
6. PowerShellまたはコマンドプロンプトで次を実行する。`<EXTENSION_ID>` はコピーしたIDに置き換える。

```powershell
cd "C:\Projects\01_AI画像・動画\小鈴（シャオリン）のイラスト展\04_asset_tools\chatgpt-image-downloader"
.\install-native-host.cmd "<EXTENSION_ID>"
```

PowerShellの実行ポリシーで `.ps1` が止まる環境でも、上の `.cmd` から実行すればこのインストール処理だけ一時的に許可して登録できます。

## 使い方

1. ChromeでChatGPTにログインしておく。
2. 拡張機能アイコンから `ChatGPT Image Batch Downloader` を開く。
3. `Chat URL` にチャットURLを入れる。
4. `Save folder` に保存先フォルダを入れる。

```text
C:\Projects\01_AI画像・動画\小鈴（シャオリン）のイラスト展\inbox
```

5. `Download images` を押す。

保存先には画像ファイルと `chatgpt_images_manifest.json` が作られます。

`Include uploaded/reference files` は通常オフで使います。オンにすると、チャットに添付した参照画像やアップロード画像も一緒に保存します。

## 注意

- Chrome拡張単体では任意のPCフォルダに直接書き込めないため、Native Messagingの小さなローカル保存ホストを使っています。
- ChatGPTの画面構造が変わると、画像検出ロジックの調整が必要になる場合があります。
- 対象チャットにアクセスできるChromeアカウントでログインしている必要があります。
