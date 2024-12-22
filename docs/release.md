# リリース仕方(整備中、現状最低限の記載)

## サーバー本番環境

1. 本番環境のサーバーを準備する
1. nginxを設定する
1. RobotVRMのソースコードを準備する
1. `.env.local`の以下の値を設定する
   - `NEXT_PUBLIC_ROBOTVRM_DOCS_URL`にアプリがGitHub上のドキュメントを参照するために、CloneしたリポジトリのGitHubのブランチのURLを入力します。このURLをルートとしてドキュメントを参照します
     - リポジトリが非公開の場合はドキュメントとして参照している部分のみ公開しているリポジトリを別途用意するか、同様の参照しているパスに対してドキュメントを作成すれば良いと思います
   - (推奨) `NEXT_PUBLIC_ROBOTVRM_EULA_URL`にEULAを記載したWebページのURLを設定可能です。設定するとEULAの同意を要求するチェックボックスがアプリ初回起動時に表示されます
1. 以下のように`docker-compose.yml`を同じコンピューター内で被らないように`app_name`を変更し、ポート番号も変更する
   ```diff
    services:
   -  app_name: # 同じコンピューターで複数のコンテナを管理する際はapp_nameを変更して異なる識別子を設定してください
   +  first: # 同じコンピューターで複数のコンテナを管理する際はapp_nameを変更して異なる識別子を設定してください
        build: .
        ports:
   -      - '3000:3000' # (ポート番号）:(コンテナ内のポート番号)なので(コンピューター内で起動するポート番号):3000を指定してもらば大丈夫です
   +      - '53501:3000' # (ポート番号）:(コンテナ内のポート番号)なので(コンピューター内で起動するポート番号):3000を指定してもらば大丈夫です
        env_file:
          - .env
          - .env.local
   ```
1. Dockerをビルドします
   ```
   docker-compose build
   ```
1. Dockerを立ち上げます
   ```
   docker-compose up -d
   ```
   - 止める場合は以下を実行します
     ```
     docker-compose down
     ```
1. nginxのリバースプロキシで先ほどの指定したポート番号で立ち上がっているRobotVRMサーバーのlocalhostを設定します

## スマホアプリのリリースビルド

1. ローカルでRobotVRMの開発環境の`.env.local`の以下の値を設定する
   - `ROBOTVRM_PRODUCTION_SERVER_URL`にスマホアプリがアクセスする本番環境のサーバーのURLを設定します
   - (iOS)`ROBOTVRM_IOS_DEVELOPMENT_TEAM`で指定するTeamはApp Storeに公開する場合Apple Developer Programで契約したTeamである必要があります
1. 以下を実行し本番環境を反映します
   ```
   pnpm sync-production
   ```
1. 後はAndroid StudioやXcodeで通常と同じようにリリースのビルドをして、リリース作業をすれば良いです
   - AndroidもGoogle Play Storeに公開する際はGoogle Play Developerアカウントで契約する必要があります

## EULA設定時の動作確認

`NEXT_PUBLIC_ROBOTVRM_EULA_URL`を設定している場合は、本番環境のアプリをテストする際にアプリ初回起動時にポップアップにEULAのチェックボックスが表示され同意しないと先に進めないことを確認してください。

- EULAの挙動は開発環境でも`NEXT_PUBLIC_ROBOTVRM_EULA_URL`を設定すれば確認できます
