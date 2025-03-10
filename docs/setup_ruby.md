# How to set up ruby

## For macOS

1. If you have not performed [How to setup HomeBrew (macOS only)](./setup_brew.md), please do so.
1. Install rubyenv
   ```
   brew install rbenv
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
      eval "$(rbenv init -)"
      ```
   1. Exit input mode by pressing the `esc` key.
   1. Type `:wq` and press enter to save the contents and return to the original terminal.
1. Load the above file by executing the following
   - zsh
     ```
     source ~/.zshrc
     ```
   - bash
     ```
     source ~/.bashrc
     ```
1. Make sure rbenv is installed by running
   ```
   rbenv --version
   ```
1. Install ruby of [ruby version here](../.ruby-version)
   ```
   rbenv install (Above version)
   ```

## For Windows

I installed [this ruby version](../.ruby-version) with reference to
[Managing Multiple Ruby Versions with uru on Windows](https://www.neverletdown.net/2015/08/managing-multiple-ruby-versions-with-uru.html) by **Michael Keeling**. The general flow is as follows.

1. Create a `C:\Ruby` folder.
1. Install the recommended `Ruby+Devkit X.X.X-X` like `C:\Ruby\rubyX.X.X` as the latest version of ruby is fine to install Devkit.
1. **Michael Keeling**'s [Managing Multiple Ruby Versions with uru on Windows](https://www.neverletdown.net/2015/08/managing-multiple-ruby-versions-with-uru.html) to enable ruby version management.
1. Restart the terminal to reflect
