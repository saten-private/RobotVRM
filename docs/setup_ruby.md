# rubyのセットアップ仕方(macOSのみ)

1. [HomeBrewのセットアップ仕方(macOSのみ)](./setup_brew.md)を実施していない人は実施してください
1. rubyenvをインストール
   ```
   brew install rbenv
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
      eval "$(rbenv init -)"
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
1. 以下を実行してrbenvがインストールされていることを確認
   ```
   rbenv --version
   ```
1. [こちらのrubyバージョン](../.ruby-version)のrubyをインストール
   ```
   rbenv install (上記のバージョン)
   ```
