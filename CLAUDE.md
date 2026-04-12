# Fuji Prototype - Claude Code 指示書

このファイルは Claude Code が従うべきルールを定義する。
ここに記載されたルールは**絶対遵守**とする。
判断に迷う場合、ルールに明記されていない場合は、**自己判断せず必ずユーザに確認すること**。

## 絶対ルール

以下のルールに例外はない。「1行だけ」「些細な変更」でも必ず従うこと。

### 新しいモックの作り方

新しいモックを作るときは、**必ず**以下の手順に従うこと:

1. `app/モック名/` ディレクトリを作成する（モック名は英数字とハイフンのみ）
2. `app/モック名/meta.json` を作成する（必須）
3. `app/モック名/layout.tsx` を作成する（必須・独立したレイアウト）
4. `app/モック名/page.tsx` を作成する（必須）
5. 必要に応じて `app/モック名/components/` にコンポーネントを配置する
6. 必要に応じて `app/モック名/data/` に JSON データを配置する

`meta.json` のフォーマット:

```json
{
  "name": "モックの表示名",
  "description": "モックの簡単な説明"
}
```

### デザイン・レイアウトの独立性（最重要）

**絶対に**守ること:

- 各モックの layout.tsx、CSS、HTML は**絶対に**他のモックと共通化してはならない
- 共通コンポーネントを作って複数モックで使い回すことは**禁止**
- 各モックのスタイリングは、そのモックの中で完結させること
- 他のモックのコンポーネントやスタイルを import することは**禁止**
- `app/globals.css` を import することは**禁止**。ルートの CSS は使わないこと
- 「似ているから共通化しよう」という判断は**絶対にしない**こと

### Tailwind CSS の使い方

各モックで Tailwind CSS を使う場合は、**必ず**モック内に専用の CSS ファイルを作成すること:

1. `app/モック名/styles.css` を作成し、`@import "tailwindcss";` と記述する
2. `app/モック名/layout.tsx` で `import "./styles.css";` する

```tsx
// app/モック名/layout.tsx の例
import "./styles.css";

export default function MockLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

- `app/globals.css` や他のモックの CSS ファイルを import することは**絶対に禁止**

### 共通化して良いもの

以下の**プログラム的なライブラリのみ**共通利用してよい:

- `lib/llm/` の LLM 呼び出し関数
- `/api/llm` エンドポイント

上記以外を共通化したい場合は、**必ずユーザに確認すること**。

### LLM の使い方

LLM を使うモックを作るときは、**必ず**以下の方法で呼び出すこと:

```ts
const res = await fetch("/api/llm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "anthropic",  // or "openai"
    model: "claude-sonnet-4-20250514",
    messages: [{ role: "user", content: "メッセージ" }],
  }),
});
const data = await res.json();
```

- provider は "anthropic" または "openai" を指定する
- model はユーザが指定しない場合、anthropic なら "claude-sonnet-4-20250514"、openai なら "gpt-4o" をデフォルトとする

### モックデータ

- モックで使用するデータは、**必ず**そのモックの `data/` ディレクトリに JSON ファイルとして配置すること
- 他のモックの `data/` を参照することは**禁止**

### UI 構築

- UI を作るときは**必ず** `frontend-design:frontend-design` スキルを使用すること
- このスキルを使わずに UI を実装することは**禁止**

## 禁止事項

以下の操作は**絶対に行ってはならない**:

- `.env` ファイルの内容を変更・閲覧・表示すること
- `lib/llm/` 配下のファイルを変更すること（バグ修正を除く）
- `app/api/llm/` 配下のファイルを変更すること（バグ修正を除く）
- `app/page.tsx`（トップページ）を変更すること
- `app/layout.tsx`（ルートレイアウト）を変更すること
- `package.json` の依存関係を勝手に追加・削除すること
- 上記のバグ修正を行う場合も、**必ず事前にユーザに確認すること**

## Git 操作

- main ブランチに直接 push する（ブランチは切らない）
- コミットメッセージは日本語でも英語でもよい
- push すると自動的に Vercel にデプロイされる

## ローカル確認

- `npm run dev` でローカルサーバーを起動する
- 実装後は**必ず**ローカルで動作確認してから push すること
- 動作確認せずに push することは**禁止**

## わからないときのルール

以下の場合は、**必ず**ユーザに確認すること。勝手に判断してはならない:

- このルールに書かれていない判断が必要な場合
- 既存のファイル構造を変更する必要がある場合
- 新しいライブラリやパッケージを追加したい場合
- ルールの解釈に迷う場合
- 「たぶんこうだろう」と推測で行動しそうになった場合
