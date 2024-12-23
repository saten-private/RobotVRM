# nodeのセットアップ仕方

## macOSの場合

1. [HomeBrewのセットアップ仕方(macOSのみ)](./setup_brew.md)を実施していない人は実施してください
1. nodenvをインストール
   ```
   brew install nodenv
   ```
1. 利用しているシェルに応じて次の1行を追記します。ターミナルのコマンドを入力するところの前に`%`が表示されている場合はzshなので`~/.zshrc`、`$`が表示される場合はbashなので`~/.bashrc`に追記してください、ファイルが無い場合は作成してください。以下はVimでの例
   1. ファイルを開く、ファイルが無い場合空ファイルとして開きます。(Vimの使い方は[こちら](https://zenn.dev/masatotezuka/articles/vim_command_220225)参照)
      - zsh
        ```
        vim ~/.zshrc
        ```
      - bash
        ```
        vim ~/.bashrc
        ```
   1. 開いたVimエディタの最下部にカーソルを移動し`i`のキーを押すと入力モードになります
   1. 下記を追記
      ```
      eval "$(nodenv init -)"
      ```
   1. `esc`のキーを押して入力モードを終了
   1. `:wq`を入力してエンターを押すことで内容を保存し、元のターミナルに戻ります
1. 以下を実行して上記ファイルを読み込みます
   - zsh
     ```
     source ~/.zshrc
     ```
   - bash
     ```
     source ~/.bashrc
     ```
1. 以下を実行してnodenvがインストールされていることを確認
   ```
   nodenv --version
   ```
1. [こちらのnodeバージョン](../.node-version)のnodeをインストール
   ```
   nodenv install (上記のバージョン)
   ```

## Windowsの場合

[ahandsel](https://dev.to/ahandsel)さんの[Guide on Installing Node.js & npm {macOS & Windows}](https://dev.to/kintonedevprogram/guide-on-installing-nodejs-npm-macos-windows-16ii)の手順をもとに[こちらのnodeバージョン](../.node-version)のnodeをインストールしました。

※ nvm-windowsをインストールしたらターミナルの再起動しないとnvmコマンド使用できないので注意
