# Punk Records Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **IMPORTANT:** UI 構築時は必ず `frontend-design:frontend-design` スキルを使用すること。

**Goal:** Punk Records の API プレイグラウンドモックを作成し、PromptRule 変換の前後比較とレスポンスヘッダー情報を体感できるインタラクティブな UI を提供する。

**Architecture:** Next.js App Router でモック専用ディレクトリ `app/punk-records-playground/` を作成。全データはモック（`data/scenarios.json`）で、LLM 呼び出しなし。ダークテーマの2カラムレイアウトで左にリクエスト入力、右にレスポンス表示。

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-12-punk-records-playground-design.md`

---

## File Structure

```
app/punk-records-playground/
├── meta.json                    # モック登録メタデータ
├── layout.tsx                   # 独立レイアウト（styles.css import）
├── styles.css                   # @import "tailwindcss"
├── page.tsx                     # サーバーコンポーネント（Playground を配置）
├── components/
│   ├── Playground.tsx           # メイン client コンポーネント（状態管理・2カラム）
│   ├── RequestPanel.tsx         # 左カラム（プロバイダー/モデル/TaskType/プリセット/プロンプト入力）
│   ├── ResponsePanel.tsx        # 右カラム（ヘッダーカード + タブ）
│   ├── HeaderCards.tsx          # 5つのレスポンスヘッダーをカード表示
│   └── PromptTransformView.tsx  # 変換前後プロンプトの比較表示
└── data/
    └── scenarios.json           # プリセットシナリオ 8 件
```

---

### Task 1: モック基盤ファイル作成（meta.json, layout.tsx, styles.css, page.tsx）

**Files:**
- Create: `app/punk-records-playground/meta.json`
- Create: `app/punk-records-playground/styles.css`
- Create: `app/punk-records-playground/layout.tsx`
- Create: `app/punk-records-playground/page.tsx`

- [ ] **Step 1: meta.json を作成**

```json
{
  "name": "Punk Records Playground",
  "description": "AI Orchestration as a Service — PromptRule 変換を体験できる API プレイグラウンド"
}
```

- [ ] **Step 2: styles.css を作成**

```css
@import "tailwindcss";
```

- [ ] **Step 3: layout.tsx を作成**

```tsx
import "./styles.css";

export default function PunkRecordsPlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#0F1117] text-gray-100">{children}</div>;
}
```

- [ ] **Step 4: page.tsx を作成（仮の中身）**

```tsx
export default function PunkRecordsPlaygroundPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Punk Records Playground</h1>
      <p className="text-gray-400 mt-1">準備中...</p>
    </main>
  );
}
```

- [ ] **Step 5: ローカルで表示確認**

Run: `npm run dev`
ブラウザで `http://localhost:3000/punk-records-playground` にアクセスし、ダーク背景にタイトルが表示されることを確認。

- [ ] **Step 6: コミット**

```bash
git add app/punk-records-playground/
git commit -m "feat: punk-records-playground モック基盤ファイルを作成"
```

---

### Task 2: モックデータ（scenarios.json）作成

**Files:**
- Create: `app/punk-records-playground/data/scenarios.json`

- [ ] **Step 1: scenarios.json を作成**

8件のプリセットシナリオを含む JSON。各プロバイダー（Anthropic, OpenAI, Google）× 代表的 TaskType のペア。

```json
[
  {
    "id": "anthropic-structured-1",
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "taskType": "structured_output",
    "label": "商品情報の構造化抽出",
    "originalPrompt": "以下の商品レビューから商品名、評価、長所、短所を抽出してください。\n\nレビュー: このワイヤレスイヤホンは音質が素晴らしく、ノイズキャンセリングも優秀です。ただし、バッテリーが5時間しか持たないのが残念。価格は15,000円で、コスパは良いと思います。総合評価は4点です。",
    "transformedPrompt": "<instructions>\n<task>以下の商品レビューから情報を構造化して抽出してください。</task>\n<output_format>\nJSON形式で以下のフィールドを含めてください:\n- product_name: string\n- rating: number (1-5)\n- pros: string[]\n- cons: string[]\n- price: string\n</output_format>\n<context>\nレビュー: このワイヤレスイヤホンは音質が素晴らしく、ノイズキャンセリングも優秀です。ただし、バッテリーが5時間しか持たないのが残念。価格は15,000円で、コスパは良いと思います。総合評価は4点です。\n</context>\n</instructions>",
    "promptRuleApplied": "rule_xml_structured_v1",
    "response": "{\n  \"product_name\": \"ワイヤレスイヤホン\",\n  \"rating\": 4,\n  \"pros\": [\"音質が素晴らしい\", \"ノイズキャンセリングが優秀\", \"コスパが良い\"],\n  \"cons\": [\"バッテリーが5時間しか持たない\"],\n  \"price\": \"15,000円\"\n}",
    "headers": {
      "X-PunkRecords-Model-Used": "claude-sonnet-4-20250514",
      "X-PunkRecords-Model-Requested": "claude-sonnet-4-20250514",
      "X-PunkRecords-Quality-Score": 0.92,
      "X-PunkRecords-Quality-Delta": 0.15,
      "X-PunkRecords-Trace-ID": "tr_a1b2c3d4e5f6"
    }
  },
  {
    "id": "anthropic-summarization-1",
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "taskType": "summarization",
    "label": "技術記事の要約",
    "originalPrompt": "以下の技術記事を3行で要約してください。\n\n記事: マイクロサービスアーキテクチャは、アプリケーションを小さな独立したサービスに分割するアプローチです。各サービスは独自のデータベースを持ち、APIを通じて通信します。この設計により、チームは独立してデプロイでき、技術スタックも自由に選択できます。一方で、分散システム特有の複雑さ（ネットワーク遅延、データ整合性、監視）が課題となります。",
    "transformedPrompt": "<instructions>\n<task>以下の技術記事を要約してください。</task>\n<constraints>\n- 3行以内で簡潔にまとめる\n- 主要なポイントを網羅する\n- 技術用語はそのまま使用する\n</constraints>\n<input>\n記事: マイクロサービスアーキテクチャは、アプリケーションを小さな独立したサービスに分割するアプローチです。各サービスは独自のデータベースを持ち、APIを通じて通信します。この設計により、チームは独立してデプロイでき、技術スタックも自由に選択できます。一方で、分散システム特有の複雑さ（ネットワーク遅延、データ整合性、監視）が課題となります。\n</input>\n</instructions>",
    "promptRuleApplied": "rule_xml_summarization_v1",
    "response": "マイクロサービスアーキテクチャは、アプリケーションを独立した小さなサービスに分割し、API通信で連携する設計手法です。\n各チームが独立してデプロイ・技術選択できる柔軟性がメリットです。\n一方、ネットワーク遅延やデータ整合性など分散システム特有の課題への対処が必要となります。",
    "headers": {
      "X-PunkRecords-Model-Used": "claude-sonnet-4-20250514",
      "X-PunkRecords-Model-Requested": "claude-sonnet-4-20250514",
      "X-PunkRecords-Quality-Score": 0.88,
      "X-PunkRecords-Quality-Delta": 0.12,
      "X-PunkRecords-Trace-ID": "tr_b2c3d4e5f6g7"
    }
  },
  {
    "id": "anthropic-translation-1",
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "taskType": "translation",
    "label": "技術文書の日英翻訳",
    "originalPrompt": "以下の日本語を英語に翻訳してください。\n\nこのAPIは、リクエストボディにJSON形式でパラメータを指定します。レスポンスにはステータスコードとともに処理結果が返されます。認証にはBearerトークンを使用してください。",
    "transformedPrompt": "<instructions>\n<task>以下の日本語テキストを英語に翻訳してください。</task>\n<guidelines>\n- 技術用語（API, JSON, Bearer token等）は英語のまま維持\n- 自然で読みやすい英語にする\n- 原文の意味を正確に保つ\n</guidelines>\n<source_text lang=\"ja\">\nこのAPIは、リクエストボディにJSON形式でパラメータを指定します。レスポンスにはステータスコードとともに処理結果が返されます。認証にはBearerトークンを使用してください。\n</source_text>\n</instructions>",
    "promptRuleApplied": "rule_xml_translation_v1",
    "response": "This API accepts parameters in JSON format in the request body. The response returns the processing result along with a status code. Please use a Bearer token for authentication.",
    "headers": {
      "X-PunkRecords-Model-Used": "claude-sonnet-4-20250514",
      "X-PunkRecords-Model-Requested": "claude-sonnet-4-20250514",
      "X-PunkRecords-Quality-Score": 0.90,
      "X-PunkRecords-Quality-Delta": 0.08,
      "X-PunkRecords-Trace-ID": "tr_c3d4e5f6g7h8"
    }
  },
  {
    "id": "openai-structured-1",
    "provider": "openai",
    "model": "gpt-4o",
    "taskType": "structured_output",
    "label": "会議メモの構造化",
    "originalPrompt": "以下の会議メモから、議題、決定事項、アクションアイテムを抽出してください。\n\nメモ: 本日のプロジェクト定例会議では、リリース日を5月15日に決定しました。田中さんがテスト計画を来週月曜までに作成し、鈴木さんがインフラ構成図を更新します。パフォーマンス問題については次回持ち越しとなりました。",
    "transformedPrompt": "You are a structured data extraction assistant.\n\nExtract the following fields from the meeting notes below and respond in JSON format:\n- agenda: string (main topic)\n- decisions: string[] (decisions made)\n- action_items: { assignee: string, task: string, deadline: string }[]\n- deferred: string[] (items postponed)\n\nRespond ONLY with valid JSON. Do not include any explanation.\n\nMeeting Notes:\n本日のプロジェクト定例会議では、リリース日を5月15日に決定しました。田中さんがテスト計画を来週月曜までに作成し、鈴木さんがインフラ構成図を更新します。パフォーマンス問題については次回持ち越しとなりました。",
    "promptRuleApplied": "rule_json_mode_structured_v1",
    "response": "{\n  \"agenda\": \"プロジェクト定例会議\",\n  \"decisions\": [\"リリース日を5月15日に決定\"],\n  \"action_items\": [\n    { \"assignee\": \"田中\", \"task\": \"テスト計画を作成\", \"deadline\": \"来週月曜\" },\n    { \"assignee\": \"鈴木\", \"task\": \"インフラ構成図を更新\", \"deadline\": \"未定\" }\n  ],\n  \"deferred\": [\"パフォーマンス問題\"]\n}",
    "headers": {
      "X-PunkRecords-Model-Used": "gpt-4o",
      "X-PunkRecords-Model-Requested": "gpt-4o",
      "X-PunkRecords-Quality-Score": 0.89,
      "X-PunkRecords-Quality-Delta": 0.18,
      "X-PunkRecords-Trace-ID": "tr_d4e5f6g7h8i9"
    }
  },
  {
    "id": "openai-code-generation-1",
    "provider": "openai",
    "model": "gpt-4o",
    "taskType": "code_generation",
    "label": "TypeScript ユーティリティ関数",
    "originalPrompt": "TypeScriptで、配列をチャンクに分割するユーティリティ関数を書いてください。",
    "transformedPrompt": "You are a senior TypeScript developer. Write production-quality code.\n\nTask: Write a utility function that splits an array into chunks.\n\nRequirements:\n- Function signature: chunk<T>(array: T[], size: number): T[][]\n- Handle edge cases: empty array, size <= 0, size > array.length\n- Include JSDoc comments\n- Use TypeScript generics\n\nRespond with ONLY the code. Do not include usage examples or explanations.",
    "promptRuleApplied": "rule_code_gen_v1",
    "response": "/**\n * Splits an array into chunks of the specified size.\n * @param array - The array to split\n * @param size - The size of each chunk\n * @returns An array of chunks\n */\nexport function chunk<T>(array: T[], size: number): T[][] {\n  if (size <= 0) return [];\n  if (array.length === 0) return [];\n\n  const result: T[][] = [];\n  for (let i = 0; i < array.length; i += size) {\n    result.push(array.slice(i, i + size));\n  }\n  return result;\n}",
    "headers": {
      "X-PunkRecords-Model-Used": "gpt-4o",
      "X-PunkRecords-Model-Requested": "gpt-4o",
      "X-PunkRecords-Quality-Score": 0.91,
      "X-PunkRecords-Quality-Delta": 0.22,
      "X-PunkRecords-Trace-ID": "tr_e5f6g7h8i9j0"
    }
  },
  {
    "id": "openai-qa-1",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "taskType": "qa",
    "label": "社内FAQ回答",
    "originalPrompt": "有給休暇の申請方法を教えてください。",
    "transformedPrompt": "You are a helpful HR assistant for a Japanese company. Answer questions based on company policies.\n\nSystem context: You answer employee questions about company policies, benefits, and procedures. Be concise, accurate, and helpful. If you don't know the answer, say so clearly.\n\nQuestion: 有給休暇の申請方法を教えてください。",
    "promptRuleApplied": "rule_qa_system_msg_v1",
    "response": "有給休暇の申請方法は以下の通りです：\n\n1. 社内ポータルの「勤怠管理」にログイン\n2. 「休暇申請」メニューを選択\n3. 希望日と理由を入力して送信\n4. 上長の承認後、申請完了\n\n※ 3日前までに申請してください。急な場合は直接上長にご連絡ください。",
    "headers": {
      "X-PunkRecords-Model-Used": "gpt-4o-mini",
      "X-PunkRecords-Model-Requested": "gpt-4o-mini",
      "X-PunkRecords-Quality-Score": 0.85,
      "X-PunkRecords-Quality-Delta": 0.10,
      "X-PunkRecords-Trace-ID": "tr_f6g7h8i9j0k1"
    }
  },
  {
    "id": "google-creative-1",
    "provider": "google",
    "model": "gemini-2.0-flash",
    "taskType": "creative_writing",
    "label": "製品キャッチコピー生成",
    "originalPrompt": "AIを活用した翻訳サービスのキャッチコピーを5つ考えてください。",
    "transformedPrompt": "あなたはプロのコピーライターです。\n\n以下の条件でキャッチコピーを生成してください：\n\n対象サービス: AIを活用した翻訳サービス\n生成数: 5つ\n条件:\n- 各コピーは20文字以内\n- ターゲット: ビジネスユーザー\n- トーン: プロフェッショナルかつ親しみやすい\n- 差別化ポイント: AI活用による高精度・高速を訴求\n\n番号付きリストで出力してください。",
    "promptRuleApplied": "rule_creative_grounding_v1",
    "response": "1. 言葉の壁を、AIが溶かす。\n2. 翻訳の常識を、書き換えよう。\n3. AI翻訳で、世界が近くなる。\n4. 精度と速度、その両方を。\n5. 伝えたい想い、そのままの精度で。",
    "headers": {
      "X-PunkRecords-Model-Used": "gemini-2.0-flash",
      "X-PunkRecords-Model-Requested": "gemini-2.0-flash",
      "X-PunkRecords-Quality-Score": 0.87,
      "X-PunkRecords-Quality-Delta": 0.14,
      "X-PunkRecords-Trace-ID": "tr_g7h8i9j0k1l2"
    }
  },
  {
    "id": "google-summarization-1",
    "provider": "google",
    "model": "gemini-2.5-pro",
    "taskType": "summarization",
    "label": "契約書の要点抽出",
    "originalPrompt": "以下の契約条項の要点を箇条書きでまとめてください。\n\n第5条（秘密保持）: 甲および乙は、本契約に関連して知り得た相手方の技術上または営業上の情報を、相手方の事前の書面による承諾なしに第三者に開示してはならない。ただし、法令により開示が義務付けられる場合はこの限りではない。本条の義務は契約終了後3年間存続する。",
    "transformedPrompt": "あなたは法務アシスタントです。\n\n以下の契約条項を分析し、要点を箇条書きでまとめてください。\n\n出力要件:\n- 箇条書き形式（各項目は1文で簡潔に）\n- 重要な数値・期間は必ず含める\n- 例外条件がある場合は明記する\n- 法律用語はわかりやすく言い換える\n\n対象条項:\n第5条（秘密保持）: 甲および乙は、本契約に関連して知り得た相手方の技術上または営業上の情報を、相手方の事前の書面による承諾なしに第三者に開示してはならない。ただし、法令により開示が義務付けられる場合はこの限りではない。本条の義務は契約終了後3年間存続する。",
    "promptRuleApplied": "rule_summarization_grounding_v1",
    "response": "• 双方は契約を通じて知った相手の技術・営業情報を第三者に開示してはならない\n• 開示には相手方の事前の書面による承諾が必要\n• 例外: 法令で開示が義務付けられる場合は開示可能\n• 秘密保持義務は契約終了後も3年間継続する",
    "headers": {
      "X-PunkRecords-Model-Used": "gemini-2.5-pro",
      "X-PunkRecords-Model-Requested": "gemini-2.5-pro",
      "X-PunkRecords-Quality-Score": 0.93,
      "X-PunkRecords-Quality-Delta": 0.11,
      "X-PunkRecords-Trace-ID": "tr_h8i9j0k1l2m3"
    }
  }
]
```

- [ ] **Step 2: コミット**

```bash
git add app/punk-records-playground/data/
git commit -m "feat: punk-records-playground シナリオデータを追加"
```

---

### Task 3: Playground メインコンポーネント + RequestPanel

**Files:**
- Create: `app/punk-records-playground/components/Playground.tsx`
- Create: `app/punk-records-playground/components/RequestPanel.tsx`
- Modify: `app/punk-records-playground/page.tsx`

**IMPORTANT:** このタスクでは `frontend-design:frontend-design` スキルを使用して UI を構築すること。

- [ ] **Step 1: Playground.tsx を作成**

メインのクライアントコンポーネント。状態管理と2カラムレイアウトを担当。

```tsx
"use client";

import { useState } from "react";
import RequestPanel from "./RequestPanel";
import ResponsePanel from "./ResponsePanel";
import scenarios from "../data/scenarios.json";

export type Scenario = (typeof scenarios)[number];

export type RequestState = {
  provider: "anthropic" | "openai" | "google";
  model: string;
  taskType: string;
  preset: string; // scenario id or "custom"
  prompt: string;
};

export type ResponseState = {
  response: string;
  headers: Scenario["headers"];
  originalPrompt: string;
  transformedPrompt: string;
  promptRuleApplied: string;
} | null;

const MODEL_OPTIONS: Record<string, string[]> = {
  anthropic: ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"],
  openai: ["gpt-4o", "gpt-4o-mini"],
  google: ["gemini-2.0-flash", "gemini-2.5-pro"],
};

const TASK_TYPES = [
  "structured_output",
  "summarization",
  "translation",
  "code_generation",
  "qa",
  "creative_writing",
] as const;

export default function Playground() {
  const [request, setRequest] = useState<RequestState>({
    provider: "anthropic",
    model: MODEL_OPTIONS.anthropic[0],
    taskType: "structured_output",
    preset: scenarios[0].id,
    prompt: scenarios[0].originalPrompt,
  });
  const [response, setResponse] = useState<ResponseState>(null);
  const [loading, setLoading] = useState(false);

  const filteredScenarios = scenarios.filter(
    (s) => s.provider === request.provider && s.taskType === request.taskType
  );

  const handleSend = async () => {
    setLoading(true);
    // 擬似ローディング
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (request.preset !== "custom") {
      const scenario = scenarios.find((s) => s.id === request.preset);
      if (scenario) {
        setResponse({
          response: scenario.response,
          headers: scenario.headers,
          originalPrompt: scenario.originalPrompt,
          transformedPrompt: scenario.transformedPrompt,
          promptRuleApplied: scenario.promptRuleApplied,
        });
      }
    } else {
      // カスタム入力時は汎用レスポンスを返す
      setResponse({
        response:
          "This is a simulated response for your custom prompt. In production, Punk Records would apply the appropriate PromptRule transformation and route to the selected model.",
        headers: {
          "X-PunkRecords-Model-Used": request.model,
          "X-PunkRecords-Model-Requested": request.model,
          "X-PunkRecords-Quality-Score": 0.85,
          "X-PunkRecords-Quality-Delta": null as unknown as number,
          "X-PunkRecords-Trace-ID": `tr_custom_${Date.now().toString(36)}`,
        },
        originalPrompt: request.prompt,
        transformedPrompt: `<instructions>\n<task>${request.prompt}</task>\n<output_format>Respond clearly and concisely.</output_format>\n</instructions>`,
        promptRuleApplied: `rule_${request.taskType}_generic_v1`,
      });
    }
    setLoading(false);
  };

  const handleProviderChange = (provider: "anthropic" | "openai" | "google") => {
    const newModel = MODEL_OPTIONS[provider][0];
    const newScenarios = scenarios.filter(
      (s) => s.provider === provider && s.taskType === request.taskType
    );
    const newPreset = newScenarios.length > 0 ? newScenarios[0].id : "custom";
    const newPrompt =
      newPreset !== "custom"
        ? newScenarios[0].originalPrompt
        : "";
    setRequest({
      ...request,
      provider,
      model: newModel,
      preset: newPreset,
      prompt: newPrompt,
    });
    setResponse(null);
  };

  const handleTaskTypeChange = (taskType: string) => {
    const newScenarios = scenarios.filter(
      (s) => s.provider === request.provider && s.taskType === taskType
    );
    const newPreset = newScenarios.length > 0 ? newScenarios[0].id : "custom";
    const newPrompt =
      newPreset !== "custom"
        ? newScenarios[0].originalPrompt
        : "";
    setRequest({
      ...request,
      taskType,
      preset: newPreset,
      prompt: newPrompt,
    });
    setResponse(null);
  };

  const handlePresetChange = (preset: string) => {
    if (preset === "custom") {
      setRequest({ ...request, preset, prompt: "" });
    } else {
      const scenario = scenarios.find((s) => s.id === preset);
      if (scenario) {
        setRequest({ ...request, preset, prompt: scenario.originalPrompt });
      }
    }
    setResponse(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Punk Records <span className="text-[#E85D3A]">Playground</span>
        </h1>
        <p className="text-gray-400 mt-1">
          AI Orchestration as a Service — Experience PromptRule transformations
        </p>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RequestPanel
          request={request}
          modelOptions={MODEL_OPTIONS[request.provider]}
          taskTypes={[...TASK_TYPES]}
          filteredScenarios={filteredScenarios}
          loading={loading}
          onProviderChange={handleProviderChange}
          onModelChange={(model) => setRequest({ ...request, model })}
          onTaskTypeChange={handleTaskTypeChange}
          onPresetChange={handlePresetChange}
          onPromptChange={(prompt) => setRequest({ ...request, prompt })}
          onSend={handleSend}
        />
        <ResponsePanel response={response} loading={loading} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: RequestPanel.tsx を作成**

```tsx
"use client";

import type { RequestState, Scenario } from "./Playground";

type Props = {
  request: RequestState;
  modelOptions: string[];
  taskTypes: string[];
  filteredScenarios: Scenario[];
  loading: boolean;
  onProviderChange: (provider: "anthropic" | "openai" | "google") => void;
  onModelChange: (model: string) => void;
  onTaskTypeChange: (taskType: string) => void;
  onPresetChange: (preset: string) => void;
  onPromptChange: (prompt: string) => void;
  onSend: () => void;
};

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
};

const TASK_TYPE_LABELS: Record<string, string> = {
  structured_output: "Structured Output",
  summarization: "Summarization",
  translation: "Translation",
  code_generation: "Code Generation",
  qa: "Q&A",
  creative_writing: "Creative Writing",
};

export default function RequestPanel({
  request,
  modelOptions,
  taskTypes,
  filteredScenarios,
  loading,
  onProviderChange,
  onModelChange,
  onTaskTypeChange,
  onPresetChange,
  onPromptChange,
  onSend,
}: Props) {
  return (
    <div className="bg-[#1A1D27] rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-200">Request</h2>

      {/* Provider Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Provider</label>
        <div className="flex gap-1 bg-[#0F1117] rounded-lg p-1">
          {(["anthropic", "openai", "google"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onProviderChange(p)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                request.provider === p
                  ? "bg-[#E85D3A] text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {PROVIDER_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Model</label>
        <select
          value={request.model}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full bg-[#0F1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#E85D3A]"
        >
          {modelOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* TaskType Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Task Type</label>
        <select
          value={request.taskType}
          onChange={(e) => onTaskTypeChange(e.target.value)}
          className="w-full bg-[#0F1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#E85D3A]"
        >
          {taskTypes.map((t) => (
            <option key={t} value={t}>
              {TASK_TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
      </div>

      {/* Preset Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Preset</label>
        <select
          value={request.preset}
          onChange={(e) => onPresetChange(e.target.value)}
          className="w-full bg-[#0F1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#E85D3A]"
        >
          {filteredScenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
          <option value="custom">カスタム入力</option>
        </select>
      </div>

      {/* Prompt Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Prompt</label>
        <textarea
          value={request.prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={8}
          placeholder="プロンプトを入力してください..."
          className="w-full bg-[#0F1117] border border-gray-700 rounded-lg px-3 py-3 text-sm text-gray-200 font-mono resize-none focus:outline-none focus:border-[#E85D3A]"
        />
      </div>

      {/* Send Button */}
      <button
        onClick={onSend}
        disabled={loading || !request.prompt.trim()}
        className="w-full bg-[#E85D3A] hover:bg-[#d4512f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          "Send Request"
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: page.tsx を更新**

```tsx
import Playground from "./components/Playground";

export default function PunkRecordsPlaygroundPage() {
  return (
    <main>
      <Playground />
    </main>
  );
}
```

- [ ] **Step 4: ローカルで左カラム表示を確認**

Run: `npm run dev`
ブラウザで `http://localhost:3000/punk-records-playground` にアクセス。左カラムにプロバイダー選択・モデル・TaskType・プリセット・プロンプト入力・送信ボタンが表示されることを確認。プロバイダー切替でモデル候補が変わることを確認。

- [ ] **Step 5: コミット**

```bash
git add app/punk-records-playground/
git commit -m "feat: Playground メインコンポーネントと RequestPanel を追加"
```

---

### Task 4: ResponsePanel + HeaderCards + PromptTransformView

**Files:**
- Create: `app/punk-records-playground/components/ResponsePanel.tsx`
- Create: `app/punk-records-playground/components/HeaderCards.tsx`
- Create: `app/punk-records-playground/components/PromptTransformView.tsx`

**IMPORTANT:** このタスクでは `frontend-design:frontend-design` スキルを使用して UI を構築すること。

- [ ] **Step 1: HeaderCards.tsx を作成**

```tsx
type Props = {
  headers: {
    "X-PunkRecords-Model-Used": string;
    "X-PunkRecords-Model-Requested": string;
    "X-PunkRecords-Quality-Score": number;
    "X-PunkRecords-Quality-Delta": number | null;
    "X-PunkRecords-Trace-ID": string;
  };
};

const HEADER_CONFIG = [
  { key: "X-PunkRecords-Model-Used", label: "Model Used", format: "string" },
  { key: "X-PunkRecords-Model-Requested", label: "Model Requested", format: "string" },
  { key: "X-PunkRecords-Quality-Score", label: "Quality Score", format: "score" },
  { key: "X-PunkRecords-Quality-Delta", label: "Quality Delta", format: "delta" },
  { key: "X-PunkRecords-Trace-ID", label: "Trace ID", format: "trace" },
] as const;

export default function HeaderCards({ headers }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {HEADER_CONFIG.map(({ key, label, format }) => {
        const value = headers[key as keyof typeof headers];
        return (
          <div
            key={key}
            className="bg-[#0F1117] rounded-lg p-3 border border-gray-800"
          >
            <div className="text-xs text-gray-500 mb-1 truncate">{label}</div>
            <div
              className={`text-sm font-mono truncate ${
                format === "score" || format === "delta"
                  ? "text-emerald-400 text-lg font-bold"
                  : format === "trace"
                    ? "text-gray-500 text-xs"
                    : "text-gray-200"
              }`}
              title={String(value ?? "null")}
            >
              {format === "score"
                ? (value as number).toFixed(2)
                : format === "delta"
                  ? value != null
                    ? `+${(value as number).toFixed(2)}`
                    : "null (collecting baseline)"
                  : String(value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: PromptTransformView.tsx を作成**

```tsx
type Props = {
  originalPrompt: string;
  transformedPrompt: string;
  promptRuleApplied: string;
};

export default function PromptTransformView({
  originalPrompt,
  transformedPrompt,
  promptRuleApplied,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>Applied Rule:</span>
        <code className="bg-[#0F1117] px-2 py-0.5 rounded text-[#E85D3A] text-xs">
          {promptRuleApplied}
        </code>
      </div>

      {/* Original Prompt */}
      <div>
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
          Original Prompt
        </div>
        <pre className="bg-[#1e1e2e] border border-gray-700 rounded-lg p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-auto max-h-64">
          {originalPrompt}
        </pre>
      </div>

      {/* Arrow */}
      <div className="flex justify-center text-gray-600">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      {/* Transformed Prompt */}
      <div>
        <div className="text-xs text-[#E85D3A] mb-1 uppercase tracking-wider">
          Transformed Prompt
        </div>
        <pre className="bg-[#1a1510] border border-[#E85D3A]/20 rounded-lg p-4 text-sm text-gray-200 font-mono whitespace-pre-wrap overflow-auto max-h-64">
          {transformedPrompt}
        </pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: ResponsePanel.tsx を作成**

```tsx
"use client";

import { useState } from "react";
import type { ResponseState } from "./Playground";
import HeaderCards from "./HeaderCards";
import PromptTransformView from "./PromptTransformView";

type Props = {
  response: ResponseState;
  loading: boolean;
};

export default function ResponsePanel({ response, loading }: Props) {
  const [activeTab, setActiveTab] = useState<"response" | "transform">(
    "response"
  );

  if (loading) {
    return (
      <div className="bg-[#1A1D27] rounded-xl p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-[#E85D3A]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-gray-400 text-sm">
            Applying PromptRule transformation...
          </span>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="bg-[#1A1D27] rounded-xl p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-sm">
          Send a request to see the response and PromptRule transformation.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1D27] rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-200">Response</h2>

      {/* Header Cards */}
      <HeaderCards headers={response.headers} />

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0F1117] rounded-lg p-1">
        <button
          onClick={() => setActiveTab("response")}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "response"
              ? "bg-[#2A2D37] text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Response
        </button>
        <button
          onClick={() => setActiveTab("transform")}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "transform"
              ? "bg-[#2A2D37] text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Prompt Transform
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "response" ? (
        <pre className="bg-[#0F1117] rounded-lg p-4 text-sm text-gray-200 font-mono whitespace-pre-wrap overflow-auto max-h-96 border border-gray-800">
          {response.response}
        </pre>
      ) : (
        <PromptTransformView
          originalPrompt={response.originalPrompt}
          transformedPrompt={response.transformedPrompt}
          promptRuleApplied={response.promptRuleApplied}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: ローカルで全体の動作確認**

Run: `npm run dev`
ブラウザで以下を確認:
1. プリセット選択 → Send Request → 右カラムにヘッダーカード + レスポンス表示
2. Prompt Transform タブに切替 → 変換前後のプロンプト比較表示
3. プロバイダー切替 → モデル/プリセットが連動して変化
4. カスタム入力 → 汎用レスポンスが返される
5. ローディングスピナーが表示される

- [ ] **Step 5: コミット**

```bash
git add app/punk-records-playground/components/
git commit -m "feat: ResponsePanel, HeaderCards, PromptTransformView を追加"
```

---

### Task 5: 最終確認とコミット

- [ ] **Step 1: TypeScript 型チェック**

Run: `npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 2: Lint チェック**

Run: `npx next lint`
Expected: エラーなし

- [ ] **Step 3: ローカル最終動作確認**

Run: `npm run dev`
全機能を一通り操作して問題ないことを確認。

- [ ] **Step 4: 最終コミット（必要な場合）**

修正があれば修正してコミット。
