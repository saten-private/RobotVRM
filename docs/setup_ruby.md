# rubyのセットアップ仕方

## macOSの場合

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

## Windowsの場合

[こちらのrubyバージョン](../.ruby-version)のrubyを[tks_00](https://qiita.com/tks_00)さんの[「uru」を使って簡単に Ruby の複数のバージョン切り替えを実現する方法](https://qiita.com/tks_00/items/fc3a56e2f7c6cffbe2d7)を参考にインストールさせて頂きました。大まかな流れは下記です。

1. `C:\Ruby`フォルダを作成する
1. Devkitをインストールするため最新バージョンのrubyで良いので推奨されている`Ruby+Devkit X.X.X-X`のようなのを`C:\Ruby\rubyX.X.X`にインストールする
1. [Archives](https://rubyinstaller.org/downloads/archives/)より[こちらのrubyバージョン](../.ruby-version)のrubyをダウンロードして解凍し`C:\Ruby\rubyX.X.X`に置く
1. [tks_00](https://qiita.com/tks_00)さんの[「uru」を使って簡単に Ruby の複数のバージョン切り替えを実現する方法](https://qiita.com/tks_00/items/fc3a56e2f7c6cffbe2d7)でrubyのバージョン管理をできるようにする
1. ターミナルを再起動し反映する
