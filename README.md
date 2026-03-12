# AIAR-T (8thwall.org AR Project)

2026年2月以降のオープンソース版 8th Wall を使用した AR プロジェクト。

## 構成
- **AR Engine**: 8thwall.org (Open Source)
- **Hosting**: Vercel
- **Version Control**: GitHub
- **Dynamic API**: Cloudflare Workers

## デプロイ手順
1. GitHub リポジトリを作成し、このディレクトリを push。
2. Vercel でリポジトリをインポート。
3. Build Command: `npm run build`
4. Output Directory: `dist` (または `.` で静的ホスティング)

## 開発
- `npm install`
- `npm start` (ローカルサーバー起動)
