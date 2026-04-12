# Punk Records Playground - デザインスペック

## 概要

Punk Records（AI Orchestration as a Service）の API プレイグラウンドモック。
一般ユーザー（開発者/顧客）向けに、PromptRule 変換の前後比較とレスポンスヘッダー情報を体感できるインタラクティブな UI を提供する。

- モック名: `punk-records-playground`
- LLM 呼び出し: なし（全てモックデータ）
- APIキー: 不要

## 画面レイアウト

シングルペイン型の2カラム構成。

### ページヘッダー

- タイトル: 「Punk Records Playground」
- サブタイトル: サービスの一行説明（例: "AI Orchestration as a Service - Experience PromptRule transformations"）

### 左カラム: リクエスト入力

上から順に以下の入力要素を配置する:

1. **プロバイダー選択** - セグメントボタン（Anthropic / OpenAI / Google）
2. **モデル選択** - ドロップダウン。プロバイダーに応じて候補が変わる:
   - Anthropic: `claude-sonnet-4-20250514`, `claude-haiku-4-5-20251001`
   - OpenAI: `gpt-4o`, `gpt-4o-mini`
   - Google: `gemini-2.0-flash`, `gemini-2.5-pro`
3. **TaskType 選択** - ドロップダウン（structured_output / summarization / translation / code_generation / qa / creative_writing）
4. **プリセット選択** - ドロップダウン。TaskType に応じたサンプルシナリオ一覧 +「カスタム」オプション
5. **プロンプト入力欄** - テキストエリア。プリセット選択時は自動入力される。編集可能
6. **「Send Request」ボタン** - アクセントカラー（コーラル/オレンジ）

### 右カラム: レスポンス表示

リクエスト送信前は空の状態（プレースホルダーテキスト表示）。

送信後:

1. **レスポンスヘッダーセクション** - 5つのヘッダーをカード形式で横並び表示:
   - `X-PunkRecords-Model-Used` - 実際に使用されたモデル
   - `X-PunkRecords-Model-Requested` - リクエストされたモデル
   - `X-PunkRecords-Quality-Score` - 品質スコア（0-1）
   - `X-PunkRecords-Quality-Delta` - 品質改善推定値（float | null）
   - `X-PunkRecords-Trace-ID` - トレースID

2. **タブ切り替え** - 2タブ構成:
   - **Response タブ**: LLM レスポンス本文をコードブロック風に表示
   - **Prompt Transform タブ**: 変換前（Original Prompt）と変換後（Transformed Prompt）を上下に並べて表示。適用された PromptRule ID も表示

## データ構造

### scenarios.json

`app/punk-records-playground/data/scenarios.json` に格納。

```json
[
  {
    "id": "anthropic-structured-1",
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "taskType": "structured_output",
    "label": "商品情報の構造化抽出",
    "originalPrompt": "以下の商品レビューから商品名、評価、長所、短所を抽出してください。\n\nレビュー: このワイヤレスイヤホンは音質が素晴らしく...",
    "transformedPrompt": "<instructions>\n<task>以下の商品レビューから情報を構造化して抽出してください。</task>\n<output_format>\nJSON形式で以下のフィールドを含めてください:\n- product_name: string\n- rating: number (1-5)\n- pros: string[]\n- cons: string[]\n</output_format>\n<context>\nレビュー: このワイヤレスイヤホンは音質が素晴らしく...\n</context>\n</instructions>",
    "promptRuleApplied": "rule_xml_structured_v1",
    "response": "{\n  \"product_name\": \"ワイヤレスイヤホン XZ-500\",\n  \"rating\": 4,\n  \"pros\": [\"音質が素晴らしい\", \"装着感が良い\"],\n  \"cons\": [\"バッテリー持続時間がやや短い\"]\n}",
    "headers": {
      "X-PunkRecords-Model-Used": "claude-sonnet-4-20250514",
      "X-PunkRecords-Model-Requested": "claude-sonnet-4-20250514",
      "X-PunkRecords-Quality-Score": 0.92,
      "X-PunkRecords-Quality-Delta": 0.15,
      "X-PunkRecords-Trace-ID": "tr_a1b2c3d4e5f6"
    }
  }
]
```

プリセットシナリオは各プロバイダー × 代表的な TaskType で 6〜8 件用意する。

### カスタム入力時の挙動

カスタムプロンプト入力時は、選択中の provider / model / taskType に基づいて汎用のレスポンスとヘッダーを返す。変換後プロンプトは、taskType に応じた汎用的なラッピング（XMLタグ構造化等）を適用したものを表示する。

## インタラクションフロー

1. プロバイダー選択 → モデル候補が絞り込まれる（最初のモデルが自動選択）
2. TaskType 選択 → 対応するプリセット一覧が更新される
3. プリセット選択 or 「カスタム」選択 → プロンプト欄に反映（カスタム時は空欄）
4. 「Send Request」クリック → 0.5〜1秒の擬似ローディング表示
5. ローディング完了 → 右カラムにヘッダーカード + レスポンスタブが表示される
6. タブ切り替えで Response / Prompt Transform を閲覧可能

## ビジュアルデザイン

### 配色
- **ベース**: ダークテーマ（背景: `#0F1117` 付近、カード背景: `#1A1D27` 付近）
- **アクセント**: オレンジ/コーラル系（`#E85D3A`）— Punk Records のブランドカラー
- **ポジティブ指標**: 緑系（Quality-Score, Quality-Delta の数値表示）
- **テキスト**: 白/ライトグレー

### タイポグラフィ
- UI ラベル: システムフォント（sans-serif）
- コード/レスポンス表示: モノスペースフォント

### コンポーネント
- **ヘッダーカード**: 暗い背景 + 白文字、数値は大きめ表示。Quality-Score/Delta は緑色
- **Prompt Transform**: 変換前 = グレー背景、変換後 = 薄いオレンジ背景で視覚的に区別
- **Send Request ボタン**: アクセントカラー、ホバー時に明度変化
- **ローディング**: スピナーまたはプログレスバーで擬似処理感を演出
- **セグメントボタン**: 選択中はアクセントカラー背景

## ファイル構成

```
app/punk-records-playground/
├── meta.json
├── layout.tsx
├── page.tsx
├── styles.css
├── components/
│   ├── Playground.tsx          # メインのクライアントコンポーネント
│   ├── RequestPanel.tsx        # 左カラム（リクエスト入力）
│   ├── ResponsePanel.tsx       # 右カラム（レスポンス表示）
│   ├── HeaderCards.tsx         # レスポンスヘッダーカード群
│   └── PromptTransformView.tsx # 変換前後の比較表示
└── data/
    └── scenarios.json          # プリセットシナリオデータ
```

## スコープ外

- 実際の LLM 呼び出し
- ユーザー認証/APIキー管理
- ログストアへの永続化
- 集計バッチ/レポート画面
- レスポンシブ対応（デスクトップ幅を前提）
