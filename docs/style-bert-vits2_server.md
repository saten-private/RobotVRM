# 家庭内LANのStyle-Bert-VITS2サーバーの構築手順

## 必要な機器

- 家庭内のLAN環境
- Windows又はLinuxサーバー
  - Windowsの動作確認環境は Windows 11 Home
  - Linuxサーバーでの検証はしていないのでWindowsの手順を参考に実施してください

## 前提条件

- 登場するコマンドはVSCodeやCursorエディタをインストールしてターミナルで実行しています

## Style-Bert-VITS2サーバーを立てる

1. ターミナルで下記を実行し、プロセスに権限を与える
   ```
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   ```
1. [Style-Bert-VITS2のGitやPython使える人](https://github.com/litagin02/Style-Bert-VITS2?tab=readme-ov-file#git%E3%82%84python%E4%BD%BF%E3%81%88%E3%82%8B%E4%BA%BA)の手順を実施して環境を作成。`powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`を実行した際はパスを通すように指示されるので指示通り`$env:Path = "C:\Users\XXXX\.cargo\bin;$env:Path"`のようにパスを通して続行してください
1. 下記を実行すると自動的にブラウザが開くのでブラウザ上で音声合成ができることを確認してください
   - GPUを使用しない場合
     ```
     python server_editor.py --inbrowser --device cpu
     ```
   - GPUを使用する場合(モデルの学習などしない場合不要です)
     ```
     python server_editor.py --inbrowser
     ```
1. 下記を実行することでAPIサーバーが立つので、 http://localhost:5000/docs にアクセスしてAPIドキュメントを確認できることを確認します。CORS設定などは[Style-Bert-VITS2のAPIサーバーの詳細](https://github.com/litagin02/Style-Bert-VITS2?tab=readme-ov-file#api-server)参照
   ```
   python server_fastapi.py
   ```

## オレオレ証明書でStyle-Bert-VITS2サーバーに接続して動作確認

1. Style-Bert-VITSサーバー( http://localhost:5000 )を[オレオレ証明書でのSSLの設定仕方](./self_signed_cert_ssl.md) でリバースプロキシしてRobotVRMアプリの入っているスマホデバイスよりアクセスできるようにします。
1. RobotVRMアプリのStyle-Bert-VITS2の設定で"サーバーURL"に https://192.168.x.x (Style-Bert-VIT2サーバーのIPアドレス) を入力して試しにチャット入力を行って音声が再生されれば動作確認OKです。
