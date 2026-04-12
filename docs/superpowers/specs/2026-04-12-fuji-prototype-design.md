# Fuji Prototype 設計書

## 概要

非エンジニアの利用ユーザが Claude Desktop（Claude Code 機能）を使い、チャットで指示するだけで AI サービスのモック/プロトタイプを作成・デプロイできる環境を構築する。

## 目的

- 利用ユーザがターミナルを一切触らずにプロトタイプを構築できる
- vegapunk と連携するサービスのモック（実際の連携はしない）
- LLM との通信はプロトタイプに組み込める
- push するだけで Vercel に自動デプロイされる

## 技術スタック

- **フレームワーク:** Next.js (App Router, TypeScript)
- **スタイリング:** Tailwind CSS（各モックで自由に使用）
- **LLM:** Anthropic API + OpenAI API（共通ライブラリ）
- **デプロイ:** Vercel（GitHub 連携による自動デプロイ）
- **データ:** 静的 JSON（各モックごとに管理）
- **AI アシスタント:** Claude Desktop (Claude Code)

## ディレクトリ構造

```
fuji-prototype/
  app/
    layout.tsx              # ルートレイアウト（最低限の html/body のみ）
    page.tsx                # トップページ（モック一覧を自動生成）
    api/
      llm/
        route.ts            # LLM API Route（サーバーサイドで APIキーを隠す）
    chat-bot/               # モック例
      meta.json             # { name, description }
      layout.tsx            # 完全独立レイアウト
      page.tsx
      components/           # このモック専用コンポーネント
      data/                 # このモック専用 JSON データ
    dashboard/              # 別のモック例
      meta.json
      layout.tsx
      page.tsx
      components/
      data/
  lib/
    llm/
      client.ts             # 共通 LLM 呼び出し関数
      types.ts              # 型定義
  .env                      # APIキー（セットアップ担当が設定）
  CLAUDE.md                 # Claude Code 向け指示書
  README.md                 # セットアップ担当向け手順書
```

## URL 設計

- `/` — トップページ（モック一覧）
- `/chat-bot` — チャットボットモック
- `/dashboard` — ダッシュボードモック
- `/xxx` — 新モック（`app/xxx/` を作れば自動的にルーティングされる）

## コンポーネント設計

### トップページ（`app/page.tsx`）

- `app/` 直下のディレクトリを走査し、`meta.json` を持つものをモックとして検出
- カードグリッド形式でリンク一覧を表示
- モック追加時にコード変更不要（自動反映）
- デザインはシンプルなカードレイアウト（固定）

### meta.json

各モックの `meta.json` は以下のフォーマット:

```json
{
  "name": "チャットボット",
  "description": "カスタマーサポート向けAIチャット"
}
```

- `name`: モックの表示名
- `description`: 簡単な説明文

### 共通 LLM ライブラリ（`lib/llm/`）

- Anthropic API と OpenAI API の両方に対応
- `provider` パラメータで切り替え
- ストリーミング対応

### LLM API Route（`app/api/llm/route.ts`）

- `POST /api/llm` で LLM を呼び出す
- サーバーサイドで実行し、APIキーをクライアントに露出しない
- リクエストボディ:

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "messages": [{ "role": "user", "content": "こんにちは" }]
}
```

### 各モックの独立性ルール

- **layout.tsx**: 各モックが独自に持つ。ルートレイアウトは html/body のみ
- **CSS/スタイリング**: 各モックで完全に独立。共通 CSS なし
- **HTML 構造**: 各モックで自由に設計
- **コンポーネント**: 各モックの `components/` に閉じる
- **データ**: 各モックの `data/` に JSON として配置
- **共通化して良いもの**: `lib/llm/` の LLM 呼び出しライブラリのみ

## 環境変数（`.env`）

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

- セットアップ担当が設定済みで利用ユーザに渡す
- Vercel の環境変数にも同じ値を設定

## Git 運用

- main ブランチに直接 push
- ブランチ運用なし（プロトタイプのため）
- push すると Vercel が自動デプロイ

## CLAUDE.md の方針

Claude Code 向けの技術指示書（利用ユーザは読まない）。
**ルールの厳格さ:** CLAUDE.md に記載されたルールは絶対遵守とする。判断に迷う場合、ルールに明記されていない場合は、自己判断せず必ず利用ユーザに確認すること。

### 記載するルール

- 新モックの作り方（`app/モック名/` に `meta.json`, `layout.tsx`, `page.tsx` を作る）
- レイアウト・CSS・HTML は各モックで独立。絶対に共通化しない
- LLM を使うときは `/api/llm` を呼ぶ
- モックデータは各モックの `data/` に JSON で配置
- `.env` は触らない
- main に直接 push
- `npm run dev` でローカル確認
- UI を作るときは `frontend-design:frontend-design` スキルを使用

### CLAUDE.md のトーン

- 全ルールに「必ず」「絶対に」等の強制語を付与
- 禁止事項を明示的に列挙（やっていいことだけでなく、やってはいけないことも書く）
- 「わからない場合はユーザに確認する」を繰り返し強調
- 勝手な判断・推測での行動を明示的に禁止

## セットアップ

### セットアップ担当が行うこと（初回のみ）

1. Next.js プロジェクトを作成・初期実装
2. 共通 LLM ライブラリを実装
3. トップページ（モック一覧自動生成）を実装
4. CLAUDE.md を配置
5. GitHub リポジトリを作成・push
6. Vercel でプロジェクトを作成、GitHub 連携
7. Vercel に環境変数を設定
8. 利用ユーザのマシンにセットアップ（README.md 参照）

### 利用ユーザのマシンセットアップ

1. Claude Desktop アプリをインストール（Claude Pro/Max/Team 契約が必要）
2. Claude Code 機能が使えることを確認（Code タブ）
3. superpowers プラグインをインストール
4. frontend-design プラグインをインストール
5. GitHub CLI (`gh`) をインストール・認証
6. Node.js をインストール
7. リポジトリを clone
8. `.env` を配置

### 利用ユーザがやること（日常）

- Claude Desktop を開いてプロジェクトを選択
- 「こういうモック作って」と指示する
- 以上
