# オレオレ証明書の作成

1. mkcertのインストール
   - Windows
   ```
   winget install mkcert
   ```
   - macOS
   ```
   brew install mkcert
   ```
1. ローカルCA（認証局）のインストール
   ```
   mkcert -install
   ```
1. IPアドレスを指定したサーバー証明書を作成し、任意の場所に配置してください
   ```
   mkcert localhost 127.0.0.1 192.168.X.X(SSLで接続したいサーバーのIPアドレス)
   ```
