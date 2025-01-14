# How to set up node

## For macOS

1. If you have not performed [How to setup HomeBrew (macOS only)](./setup_brew.md), please do so.
1. Install nodenv
   ```
   brew install nodenv
   ```
1. Add the following line according to the shell you are using. If you see `%` in front of the terminal where you enter the command, please add it to `~/.zshrc` for zsh, or `~/.bashrc` for bash if you see `$`, or create the file if it does not exist. Here is an example in Vim
   1. Open file, or open as a blank file if there is no file. (See [Getting started with Vim: The basics](https://opensource.com/article/19/3/getting-started-vim) for how to use Vim.)
      - zsh
        ```
        vim ~/.zshrc
        ```
      - bash
        ```
        vim ~/.bashrc
        ```
   1. Move the cursor to the bottom of the opened Vim editor and press the `i` key to enter the input mode
   1. Add the following
      ```
      eval "$(nodenv init -)"
      ```
   1. Exit input mode by pressing the `esc` key.
   1. Type `:wq` and press enter to save the contents and return to the original terminal
1. Load the above file by executing the following
   - zsh
     ```
     source ~/.zshrc
     ```
   - bash
     ```
     source ~/.bashrc
     ```
1. Verify that nodenv is installed by running the following
   ```
   nodenv --version
   ```
1. Install the node of [this node version](../.node-version)
   ```
   nodenv install (Above version)
   ```

## For Windows

I installed [this node version](../.node-version) based on [ahandsel](https://dev.to/ahandsel)'s [Guide on Installing Node.js & npm {macOS & Windows}](https://dev.to/kintonedevprogram/guide-on-installing-nodejs-npm-macos-windows-16ii).

* Note that after installing nvm-windows, the nvm command cannot be used without restarting the terminal.
