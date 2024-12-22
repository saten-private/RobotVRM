# 家庭内LANのAivisSpeechサーバーの構築手順

## 必要な機器

- 家庭内のLAN環境
- Windows又はmacOSのPC、或いはLinuxサーバー
  - Linuxサーバーでの検証はしていないのでWindows又はmacOSの手順を参考に実施してください
  - Windowsの動作確認環境は Windows 11 Home
  - macOSの動作確認環境は Appleシリコン macOS Sonoma

## 前提条件

- 登場するコマンドはVSCodeやCursorエディタをインストールしてターミナルで実行しています

## AivisSpeechサーバーを立てる

1. [AivisSpeechエンジンのダウンロード先](https://github.com/Aivis-Project/AivisSpeech-Engine/releases) のリンクから自分の環境にあったAivisSpeechエンジンをダウンロードしてください
1. ダウンロードしたファイルを解凍します。
   - 7zipで圧縮されているので7zipで解凍できる環境がない人は、7zipの解凍するためのツールをダウンロードして解凍しましょう
     - 例) Windows [7zip](https://7-zip.org/download.html)
     - 例) macOS [@ntkgcj](https://qiita.com/ntkgcj)さんの[7z ファイルを解凍する 【mac】](https://qiita.com/ntkgcj/items/afe4863c40680d72a755)を参考にさせて頂きました🙇
1. 解凍したフォルダを任意の場所に配置します
1. ターミナルで解凍したフォルダをカレントフォルダにして以下を動作確認のために実行します
   - Windows
   ```
   .\run.exe --host localhost
   ```
   - macOS
   ```
   ./run --host localhost
   ```
1. http://localhost:10101 にアクセスしてAivisSpeechのサーバーが立ち上がっていることを確認できたら、ターミナルでCtrl + Cを押してAivisSpeechサーバーを終了します。
1. ブラウザとRobotVRMのサイト以外からアクセスできるのはセキュリティ上あまり良くないので、RobotVRMアプリのAivisSpeech設定の説明の記載の内容に従って以下を実行してAivisSpeechサーバーをサイトはRobotVRMのサイトからのみのアクセスを許容します
   - Windows
   ```
   .\run.exe --host localhost --allow_origin https://(RobotVRMアプリのAivisSpeechの設定に表示されているURL)
   ```
   - macOS
   ```
   ./run --host localhost --allow_origin https://(RobotVRMアプリのAivisSpeechの設定に表示されているURL)
   ```

## オレオレ証明書でAivisSpeechサーバーに接続して動作確認

1. AivisSpeechサーバー( http://localhost:10101 )を[オレオレ証明書でのSSLの設定仕方](./self_signed_cert_ssl.md) でリバースプロキシしてRobotVRMアプリの入っているスマホデバイスよりアクセスできるようにします。
1. RobotVRMアプリのAivisSpeechの設定で"AivisSpeechサーバーURL"に https://192.168.x.x (AivisSpeechサーバーのIPアドレス) を入力して"ボイスを視聴する"ボタンを押して音声が出れば動作確認完了です。
