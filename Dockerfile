# ベースイメージとしてNode.js 20を使用
FROM node:22.8.0

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 依存関係をインストール
## Canvasの環境構築。これを実施しないと以下エラーが発生する
## .../canvas@2.11.2/node_modules/canvas install: Failed
## Command failed with exit code 1.
RUN apt-get update && apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev  -y
RUN npm install -g pnpm@10.6.1
RUN pnpm install --frozen-lockfile

# アプリケーションのソースコードをコピー
COPY . .

# 3000番ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["pnpm", "start-store"]
