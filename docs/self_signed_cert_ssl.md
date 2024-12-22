# オレオレ証明書でのSSLの設定仕方

## オレオレ証明書の作成

[オレオレ証明書の作成](./create_self_signed_cert_ssl.md)の手順で証明書を作成してください

## nginxをインストール・SSLの設定

1. nginxをインストールします
   - Windows
     - [こちら](https://nginx.org/en/download.html)からnginx/Windowsをダウンロード
     - 解凍してドライブ直下に配置(例:C:\nginx-1.26.2\)
   - macOS
     - ターミナルで以下を実行
     ```
     brew install nginx
     ```
1. nginxをテスト起動
   - Windows ターミナルで配置したnginxのフォルダをカレントフォルダにして以下を実行
   ```
   start nginx
   ```
   - macOS ターミナルで以下を実行
   ```
   nginx
   ```
1. http://localhost にアクセスしてnginxが起動しているのを確認します
1. テスト起動したnginxを停止します
   - Windows
   ```
   taskkill /f /im nginx.exe
   ```
   - macOS
   ```
   nginx -s stop
   ```
1. nginxの設定をエディタで開きます
   - Windows ※ 上記のnginxフォルダからの相対パスです
   ```
   code .\conf\nginx.conf
   ```
   - macOS ※ AppleシリコンのMacの例です。IntelシリコンのMacの場合パスが異なると思います
   ```
   code /opt/homebrew/etc/nginx/nginx.conf
   ```
1. 以下のような編集し保存します。

   ```
   events {}
   http {
       # HTTPからHTTPSへのリダイレクト
       server {
           listen 80;
           return 301 https://$host$request_uri;
       }
       server {
           listen 443 ssl; # 標準ポートを設定することが外部からの接続を許可

           # 先ほどIPアドレス指定して生成したサーバー証明書を指定する
           ssl_certificate '/path/to/localhost+2.pem';
           ssl_certificate_key '/path/to/localhost+2-key.pem';;

           location / {
               proxy_pass http://localhost:XXXXX(リバースプロキシするURL);
           }
       }
   }
   ```

1. nginxを起動します。サーバーとしてアクセスできるように確認のポップアップが表示されると思いますので許可してください
   - Windows ※ カレントフォルダがnginxのフォルダであるこt
   ```
   start nginx
   ```
   - macOS
   ```
   nginx -t # このコマンドで設定ファイルを検証できます。問題なければ以降を実行しましょう
   nginx
   ```
1. スマホデバイスで https://192.168.X.X (SSLで接続したいサーバーのIPアドレス) にアクセスしてプライバシーが保護されていない旨の表示がされることを確認します(まだオレオレ証明書を信頼状態にしていないので)

## オレオレ証明書をスマホへインストールする

[オレオレ証明書のスマホへのインストール仕方](./install_signed_cert_ssl_to_smartphone.md)を参照
