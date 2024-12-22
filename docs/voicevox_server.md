# 家庭内LANのVOICEVOXサーバーの構築手順

## 必要な機器

- 家庭内のLAN環境
- Windows又はmacOSのPC、或いはLinuxサーバー
  - Linuxサーバーでの検証はしていないのでWindows又はmacOSの手順を参考に実施してください
  - Windowsの動作確認環境は Windows 11 Home
  - macOSの動作確認環境は Appleシリコン macOS Sonoma

## 前提条件

- 登場するコマンドはVSCodeやCursorエディタをインストールしてターミナルで実行しています

## VOICEVOXサーバーを立てる

1. [VOICEVOXエンジンのダウンロード先](https://github.com/VOICEVOX/voicevox_engine?tab=readme-ov-file#%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89) のリンクから自分の環境にあったVOICEVOXエンジンをダウンロードしてください
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
1. http://localhost:50021 にアクセスしてVOICEVOXのサーバーが立ち上がっていることを確認できたら、ターミナルでCtrl + Cを押してVOICEVOXサーバーを終了します。
1. ブラウザとRobotVRMのサイト以外からアクセスできるのはセキュリティ上あまり良くないので、RobotVRMアプリのVOICEVOX設定の説明の記載の内容に従って以下を実行してVOICEVOXサーバーをサイトはRobotVRMのサイトからのみのアクセスを許容します
   - Windows
   ```
   .\run.exe --host localhost --allow_origin https://(RobotVRMアプリのVOICEVOXの設定に表示されているURL)
   ```
   - macOS
   ```
   ./run --host localhost --allow_origin https://(RobotVRMアプリのVOICEVOXの設定に表示されているURL)
   ```

## オレオレ証明書でVOICEVOXサーバーに接続して動作確認

1. VOICEVOXサーバー( http://localhost:50021 )を[オレオレ証明書でのSSLの設定仕方](./self_signed_cert_ssl.md) でリバースプロキシしてRobotVRMアプリの入っているスマホデバイスよりアクセスできるようにします。
1. RobotVRMアプリのVOICEVOXの設定で"VOICEVOXサーバーURL"に https://192.168.x.x (VOICEVOXサーバーのIPアドレス) を入力して"ボイスを視聴する"ボタンを押して音声が出れば動作確認完了です。
