# デザイン系ニュース LINE Bot

デザイン系ニュース（英語・日本語）を毎朝自動でLINEに配信するBotです。

## 機能

- 複数のRSSフィードから最新のデザイン系ニュースを取得
- 英語記事はTextRankによる要約
- 日本語記事は先頭1文による要約
- LINE Messaging APIを使用したFlexメッセージでの配信
- GitHub Actionsによる毎朝8時（JST）の自動配信

## セットアップ

1. リポジトリをクローン
```bash
git clone [repository-url]
cd [repository-name]
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env.example`を`.env`にコピーし、必要な値を設定：
```bash
cp .env.example .env
```

4. ビルド
```bash
npm run build
```

5. ローカルでのテスト実行
```bash
npm start
```

## GitHub Actions設定

1. リポジトリのSettings > Secrets and variables > Actionsで以下のシークレットを設定：
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `LINE_USER_ID`
   - `FEEDS`
   - `LIMIT`

2. Actionsタブでワークフローを有効化

## 開発

- 開発モード（ファイル監視）: `npm run dev`
- リント: `npm run lint`
- フォーマット: `npm run format`

## ライセンス

MIT 