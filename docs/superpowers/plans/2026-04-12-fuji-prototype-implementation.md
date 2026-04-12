# Fuji Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 非エンジニアが Claude Code だけで AI モック/プロトタイプを作成・デプロイできる Next.js 環境を構築する

**Architecture:** Next.js App Router の 1 アプリ内に、各モックを独立したディレクトリとして配置する。トップページは `meta.json` を持つディレクトリを自動検出してリンク一覧を生成する。LLM 呼び出しは共通ライブラリ + API Route でサーバーサイドに閉じる。

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Anthropic SDK, OpenAI SDK, Vitest

---

## File Structure

### 新規作成

| ファイル | 責務 |
|---------|------|
| `lib/llm/types.ts` | LLM 共通型定義 |
| `lib/llm/client.ts` | Anthropic/OpenAI クライアント生成・呼び出し |
| `lib/llm/__tests__/client.test.ts` | LLM クライアントのテスト |
| `lib/mocks.ts` | モック一覧検出ユーティリティ |
| `lib/__tests__/mocks.test.ts` | モック検出のテスト |
| `app/layout.tsx` | ルートレイアウト（最低限の html/body） |
| `app/page.tsx` | トップページ（モック一覧自動生成） |
| `app/api/llm/route.ts` | LLM API Route |
| `app/api/llm/__tests__/route.test.ts` | API Route のテスト |
| `app/hello-world/meta.json` | サンプルモックのメタデータ |
| `app/hello-world/layout.tsx` | サンプルモックの独立レイアウト |
| `app/hello-world/page.tsx` | サンプルモックのページ |
| `app/hello-world/components/Chat.tsx` | サンプルモックのチャットコンポーネント |
| `app/hello-world/data/messages.json` | サンプルモックのデータ |
| `CLAUDE.md` | Claude Code 向け指示書 |
| `README.md` | セットアップ担当向け手順書 |
| `.env.example` | 環境変数テンプレート |
| `.gitignore` | Git 除外設定 |

---

## Task 1: Next.js プロジェクト初期化

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`

- [ ] **Step 1: Next.js プロジェクトを作成**

```bash
cd /Users/ryugo/Developer/src/sivira/fuji-prototype && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

`--src-dir=false` で `app/` をルート直下に配置する。

- [ ] **Step 2: Vitest をインストール**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Vitest 設定ファイルを作成**

`vitest.config.ts` を作成:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [],
    include: ["**/__tests__/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 4: LLM SDK をインストール**

```bash
npm install @anthropic-ai/sdk openai
```

- [ ] **Step 5: .env.example を作成**

```
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
```

- [ ] **Step 6: .gitignore に .env を追加**

`.gitignore` に以下が含まれていることを確認し、なければ追加:

```
.env
.env.local
```

- [ ] **Step 7: package.json に test スクリプトを追加**

`package.json` の `scripts` に追加:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 8: 動作確認**

```bash
npm run dev
```

`http://localhost:3000` にアクセスしてデフォルトページが表示されることを確認。Ctrl+C で停止。

- [ ] **Step 9: コミット**

```bash
git add -A && git commit -m "chore: initialize Next.js project with Vitest and LLM SDKs"
```

---

## Task 2: LLM 共通型定義

**Files:**
- Create: `lib/llm/types.ts`

- [ ] **Step 1: 型定義ファイルを作成**

`lib/llm/types.ts`:

```ts
export type LLMProvider = "anthropic" | "openai";

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMRequest {
  provider: LLMProvider;
  model: string;
  messages: LLMMessage[];
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProvider;
}
```

- [ ] **Step 2: コミット**

```bash
git add lib/llm/types.ts && git commit -m "feat: add LLM common type definitions"
```

---

## Task 3: LLM クライアント実装（TDD）

**Files:**
- Create: `lib/llm/client.ts`
- Create: `lib/llm/__tests__/client.test.ts`

- [ ] **Step 1: テストファイルを作成**

`lib/llm/__tests__/client.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { callLLM } from "../client";
import type { LLMRequest } from "../types";

// Anthropic SDK をモック
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "Hello from Claude" }],
        model: "claude-sonnet-4-20250514",
      }),
    },
  })),
}));

// OpenAI SDK をモック
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: "Hello from GPT" } }],
          model: "gpt-4o",
        }),
      },
    },
  })),
}));

describe("callLLM", () => {
  beforeEach(() => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
  });

  it("should call Anthropic API and return response", async () => {
    const request: LLMRequest = {
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: "Hello" }],
    };

    const response = await callLLM(request);

    expect(response.content).toBe("Hello from Claude");
    expect(response.provider).toBe("anthropic");
    expect(response.model).toBe("claude-sonnet-4-20250514");
  });

  it("should call OpenAI API and return response", async () => {
    const request: LLMRequest = {
      provider: "openai",
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
    };

    const response = await callLLM(request);

    expect(response.content).toBe("Hello from GPT");
    expect(response.provider).toBe("openai");
    expect(response.model).toBe("gpt-4o");
  });

  it("should throw error for unsupported provider", async () => {
    const request = {
      provider: "unknown" as any,
      model: "test",
      messages: [{ role: "user" as const, content: "Hello" }],
    };

    await expect(callLLM(request)).rejects.toThrow("Unsupported provider: unknown");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run lib/llm/__tests__/client.test.ts
```

Expected: FAIL（`callLLM` が存在しない）

- [ ] **Step 3: クライアント実装**

`lib/llm/client.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { LLMRequest, LLMResponse } from "./types";

async function callAnthropic(request: LLMRequest): Promise<LLMResponse> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // system メッセージを分離
  const systemMessage = request.messages.find((m) => m.role === "system");
  const nonSystemMessages = request.messages.filter((m) => m.role !== "system");

  const response = await client.messages.create({
    model: request.model,
    max_tokens: 4096,
    system: systemMessage?.content,
    messages: nonSystemMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const textContent = response.content.find((c) => c.type === "text");

  return {
    content: textContent?.text ?? "",
    model: response.model,
    provider: "anthropic",
  };
}

async function callOpenAI(request: LLMRequest): Promise<LLMResponse> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.chat.completions.create({
    model: request.model,
    messages: request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    model: response.model,
    provider: "openai",
  };
}

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  switch (request.provider) {
    case "anthropic":
      return callAnthropic(request);
    case "openai":
      return callOpenAI(request);
    default:
      throw new Error(`Unsupported provider: ${request.provider}`);
  }
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npx vitest run lib/llm/__tests__/client.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: コミット**

```bash
git add lib/llm/client.ts lib/llm/__tests__/client.test.ts && git commit -m "feat: implement LLM client with Anthropic and OpenAI support"
```

---

## Task 4: LLM API Route 実装（TDD）

**Files:**
- Create: `app/api/llm/route.ts`
- Create: `app/api/llm/__tests__/route.test.ts`

- [ ] **Step 1: テストファイルを作成**

`app/api/llm/__tests__/route.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { POST } from "../route";

// callLLM をモック
vi.mock("@/lib/llm/client", () => ({
  callLLM: vi.fn().mockResolvedValue({
    content: "Mocked response",
    model: "claude-sonnet-4-20250514",
    provider: "anthropic",
  }),
}));

function createRequest(body: object): Request {
  return new Request("http://localhost:3000/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/llm", () => {
  it("should return LLM response for valid request", async () => {
    const request = createRequest({
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: "Hello" }],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toBe("Mocked response");
    expect(data.provider).toBe("anthropic");
  });

  it("should return 400 for missing provider", async () => {
    const request = createRequest({
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: "Hello" }],
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should return 400 for missing messages", async () => {
    const request = createRequest({
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run app/api/llm/__tests__/route.test.ts
```

Expected: FAIL（`POST` が存在しない）

- [ ] **Step 3: API Route 実装**

`app/api/llm/route.ts`:

```ts
import { NextResponse } from "next/server";
import { callLLM } from "@/lib/llm/client";
import type { LLMRequest } from "@/lib/llm/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.provider || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "provider and messages are required" },
        { status: 400 }
      );
    }

    const llmRequest: LLMRequest = {
      provider: body.provider,
      model: body.model,
      messages: body.messages,
    };

    const response = await callLLM(llmRequest);

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npx vitest run app/api/llm/__tests__/route.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: コミット**

```bash
git add app/api/llm/route.ts app/api/llm/__tests__/route.test.ts && git commit -m "feat: implement LLM API route"
```

---

## Task 5: モック検出ユーティリティ実装（TDD）

**Files:**
- Create: `lib/mocks.ts`
- Create: `lib/__tests__/mocks.test.ts`

- [ ] **Step 1: テストファイルを作成**

`lib/__tests__/mocks.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMockList, type MockMeta } from "../mocks";
import fs from "fs";
import path from "path";

vi.mock("fs", () => ({
  default: {
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

describe("getMockList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return mocks that have meta.json", () => {
    const appDir = path.join(process.cwd(), "app");

    vi.mocked(fs.readdirSync).mockReturnValue([
      "chat-bot" as any,
      "dashboard" as any,
      "api" as any,
      "page.tsx" as any,
    ]);

    vi.mocked(fs.statSync).mockImplementation((p) => {
      const name = path.basename(p as string);
      return {
        isDirectory: () => ["chat-bot", "dashboard", "api"].includes(name),
      } as any;
    });

    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const str = p as string;
      return str.includes("chat-bot/meta.json") || str.includes("dashboard/meta.json");
    });

    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const str = p as string;
      if (str.includes("chat-bot")) {
        return JSON.stringify({ name: "Chat Bot", description: "A chat bot" });
      }
      if (str.includes("dashboard")) {
        return JSON.stringify({ name: "Dashboard", description: "A dashboard" });
      }
      return "";
    });

    const mocks = getMockList();

    expect(mocks).toHaveLength(2);
    expect(mocks[0].slug).toBe("chat-bot");
    expect(mocks[0].name).toBe("Chat Bot");
    expect(mocks[1].slug).toBe("dashboard");
    expect(mocks[1].name).toBe("Dashboard");
  });

  it("should return empty array when no mocks exist", () => {
    vi.mocked(fs.readdirSync).mockReturnValue([
      "api" as any,
      "page.tsx" as any,
    ]);

    vi.mocked(fs.statSync).mockImplementation(() => ({
      isDirectory: () => true,
    } as any));

    vi.mocked(fs.existsSync).mockReturnValue(false);

    const mocks = getMockList();

    expect(mocks).toHaveLength(0);
  });

  it("should sort mocks alphabetically by name", () => {
    const appDir = path.join(process.cwd(), "app");

    vi.mocked(fs.readdirSync).mockReturnValue([
      "zebra" as any,
      "alpha" as any,
    ]);

    vi.mocked(fs.statSync).mockImplementation(() => ({
      isDirectory: () => true,
    } as any));

    vi.mocked(fs.existsSync).mockReturnValue(true);

    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const str = p as string;
      if (str.includes("zebra")) {
        return JSON.stringify({ name: "Zebra", description: "Z" });
      }
      return JSON.stringify({ name: "Alpha", description: "A" });
    });

    const mocks = getMockList();

    expect(mocks[0].name).toBe("Alpha");
    expect(mocks[1].name).toBe("Zebra");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run lib/__tests__/mocks.test.ts
```

Expected: FAIL（`getMockList` が存在しない）

- [ ] **Step 3: モック検出ユーティリティを実装**

`lib/mocks.ts`:

```ts
import fs from "fs";
import path from "path";

export interface MockMeta {
  slug: string;
  name: string;
  description: string;
}

export function getMockList(): MockMeta[] {
  const appDir = path.join(process.cwd(), "app");
  const entries = fs.readdirSync(appDir);

  const mocks: MockMeta[] = [];

  for (const entry of entries) {
    const entryPath = path.join(appDir, entry);
    const stat = fs.statSync(entryPath);

    if (!stat.isDirectory()) continue;

    const metaPath = path.join(entryPath, "meta.json");
    if (!fs.existsSync(metaPath)) continue;

    const raw = fs.readFileSync(metaPath, "utf-8");
    const meta = JSON.parse(raw);

    mocks.push({
      slug: entry,
      name: meta.name,
      description: meta.description,
    });
  }

  mocks.sort((a, b) => a.name.localeCompare(b.name));

  return mocks;
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npx vitest run lib/__tests__/mocks.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: コミット**

```bash
git add lib/mocks.ts lib/__tests__/mocks.test.ts && git commit -m "feat: implement mock discovery utility"
```

---

## Task 6: ルートレイアウト

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: ルートレイアウトを最低限にする**

`app/layout.tsx` を以下に置き換え:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fuji Prototype",
  description: "AI service mock & prototype platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

ルートレイアウトには Tailwind の import や共通スタイルを入れない。各モックが完全に独立したスタイルを持つため。

- [ ] **Step 2: globals.css を最低限にする**

`app/globals.css` を以下に置き換え:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: コミット**

```bash
git add app/layout.tsx app/globals.css && git commit -m "feat: create minimal root layout"
```

---

## Task 7: トップページ（モック一覧）

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: トップページを実装**

`app/page.tsx` を以下に置き換え:

```tsx
import { getMockList } from "@/lib/mocks";
import Link from "next/link";

export default function Home() {
  const mocks = getMockList();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Fuji Prototype
      </h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        AI Service Mocks & Prototypes
      </p>

      {mocks.length === 0 ? (
        <p style={{ color: "#999" }}>
          No mocks yet. Create a new directory under app/ with a meta.json file.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {mocks.map((mock) => (
            <Link
              key={mock.slug}
              href={`/${mock.slug}`}
              style={{
                display: "block",
                padding: 20,
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#333")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#e0e0e0")
              }
            >
              <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
                {mock.name}
              </h2>
              <p style={{ fontSize: 14, color: "#666" }}>{mock.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

インラインスタイルを使用する理由: トップページのスタイルは固定でシンプルなため、Tailwind に依存させず自己完結させる。各モックの Tailwind 設定と干渉しない。

- [ ] **Step 2: dev サーバーで確認**

```bash
npm run dev
```

`http://localhost:3000` にアクセスして「No mocks yet.」のメッセージが表示されることを確認。Ctrl+C で停止。

- [ ] **Step 3: コミット**

```bash
git add app/page.tsx && git commit -m "feat: implement top page with auto-generated mock list"
```

---

## Task 8: サンプルモック（hello-world）

**Files:**
- Create: `app/hello-world/meta.json`
- Create: `app/hello-world/layout.tsx`
- Create: `app/hello-world/page.tsx`
- Create: `app/hello-world/components/Chat.tsx`
- Create: `app/hello-world/data/messages.json`

- [ ] **Step 1: meta.json を作成**

`app/hello-world/meta.json`:

```json
{
  "name": "Hello World",
  "description": "LLM と会話するサンプルモック"
}
```

- [ ] **Step 2: サンプルデータを作成**

`app/hello-world/data/messages.json`:

```json
[
  {
    "role": "assistant",
    "content": "こんにちは！何かお手伝いできることはありますか？"
  }
]
```

- [ ] **Step 3: 独立レイアウトを作成**

`app/hello-world/layout.tsx`:

```tsx
import "@/app/globals.css";

export default function HelloWorldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
```

- [ ] **Step 4: チャットコンポーネントを作成**

`app/hello-world/components/Chat.tsx`:

```tsx
"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  initialMessages: Message[];
}

export default function Chat({ initialMessages }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "anthropic",
          model: "claude-sonnet-4-20250514",
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to connect to API" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-400">
              ...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white font-medium disabled:opacity-50 hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: ページを作成**

`app/hello-world/page.tsx`:

```tsx
import Chat from "./components/Chat";
import initialMessages from "./data/messages.json";

export default function HelloWorldPage() {
  return (
    <main>
      <Chat initialMessages={initialMessages} />
    </main>
  );
}
```

- [ ] **Step 6: dev サーバーで確認**

```bash
npm run dev
```

- `http://localhost:3000` にアクセスして「Hello World」のカードが表示されることを確認
- カードをクリックして `/hello-world` に遷移し、チャット画面が表示されることを確認
- Ctrl+C で停止

- [ ] **Step 7: コミット**

```bash
git add app/hello-world/ && git commit -m "feat: add hello-world sample mock with chat UI"
```

---

## Task 9: CLAUDE.md 作成

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: CLAUDE.md を作成**

```markdown
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
- 「似ているから共通化しよう」という判断は**絶対にしない**こと

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
```

- [ ] **Step 2: コミット**

```bash
git add CLAUDE.md && git commit -m "docs: add CLAUDE.md for Claude Code instructions"
```

---

## Task 10: README.md 作成

**Files:**
- Create: `README.md`

- [ ] **Step 1: README.md を作成**

```markdown
# Fuji Prototype

AI サービスのモック・プロトタイプを構築・管理するプラットフォーム。
利用ユーザは Claude Desktop（Claude Code）を使い、チャットで指示するだけでモックを作成・デプロイできる。

## セットアップ担当向け: 初期構築手順

### 1. リポジトリのセットアップ

```bash
# リポジトリを clone（または新規作成済みの場合はスキップ）
git clone https://github.com/sivira/fuji-prototype.git
cd fuji-prototype

# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env
```

`.env` を開き、以下の API キーを設定する:

```
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
```

**Anthropic API キーの取得:**
1. https://console.anthropic.com/ にアクセス
2. アカウントを作成またはログイン
3. 左メニューの「API Keys」をクリック
4. 「Create Key」をクリック
5. Name に `fuji-prototype` と入力
6. 「Create Key」をクリック
7. 表示されたキー（`sk-ant-` で始まる文字列）をコピー

**OpenAI API キーの取得:**
1. https://platform.openai.com/ にアクセス
2. アカウントを作成またはログイン
3. 左メニューの「API keys」をクリック
4. 「Create new secret key」をクリック
5. Name に `fuji-prototype` と入力
6. 「Create secret key」をクリック
7. 表示されたキー（`sk-` で始まる文字列）をコピー

### 2. Vercel の設定

1. https://vercel.com/ にアクセスし、GitHub アカウントでログイン
2. 「Add New...」→「Project」をクリック
3. `sivira/fuji-prototype` リポジトリを選択し「Import」
4. Framework Preset が「Next.js」になっていることを確認
5. 「Environment Variables」セクションを開く
6. 以下の環境変数を追加:
   - Key: `ANTHROPIC_API_KEY` / Value: `.env` と同じ値
   - Key: `OPENAI_API_KEY` / Value: `.env` と同じ値
7. 「Deploy」をクリック

以降、main ブランチに push されると自動でデプロイされる。

### 3. 利用ユーザのマシンセットアップ

以下の手順を利用ユーザのマシンで実行する（セットアップ担当が代行する）。

#### 3.1 Homebrew のインストール

ターミナルを開き、以下を実行:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

インストール完了後、表示される `Next steps` の指示に従って PATH を設定する。

#### 3.2 Node.js のインストール

```bash
brew install node
```

確認:

```bash
node -v
```

バージョン番号が表示されれば OK。

#### 3.3 GitHub CLI のインストールと認証

```bash
brew install gh
```

GitHub にログイン:

```bash
gh auth login
```

対話形式で以下を選択:
- `? What account do you want to log into?` → **GitHub.com**
- `? What is your preferred protocol for Git operations on this host?` → **HTTPS**
- `? Authenticate Git with your GitHub credentials?` → **Yes**
- `? How would you like to authenticate GitHub CLI?` → **Login with a web browser**
- ブラウザが開くので、GitHub アカウントでログインして認証を完了する

#### 3.4 リポジトリの clone

```bash
cd ~/Documents
gh repo clone sivira/fuji-prototype
cd fuji-prototype
npm install
```

#### 3.5 環境変数の設定

`.env` ファイルを作成する（API キーはセットアップ担当が入力する）:

```bash
cp .env.example .env
```

`.env` を開き、API キーを入力する。

#### 3.6 Claude Desktop のインストール

1. https://claude.ai/download にアクセス
2. macOS 版をダウンロードしてインストール
3. Claude アプリを起動し、Anthropic アカウントでログイン（Claude Pro / Max / Team の契約が必要）
4. 画面上部中央の「Code」タブをクリックして Claude Code が利用できることを確認

#### 3.7 Claude Code プラグインのインストール

Claude Desktop の Code タブを開いた状態で、チャット入力欄に以下を入力して実行:

**superpowers プラグイン:**

```
/install-plugin superpowers@claude-plugins-official
```

**frontend-design プラグイン:**

```
/install-plugin frontend-design@claude-plugins-official
```

それぞれ確認プロンプトが表示されたら承認する。

#### 3.8 動作確認

Claude Desktop の Code タブで、プロジェクトディレクトリとして `~/Documents/fuji-prototype` を開く。
チャットで以下のように入力して、dev サーバーが起動しブラウザで確認できれば完了:

```
ローカルサーバーを起動して
```

## 利用ユーザ向け: 使い方

Claude Desktop を開き、プロジェクトを選択したら、チャットで指示するだけ。

**モックを作る例:**

```
「カスタマーサポート向けのチャットボットのモックを作って。
左側にチャット一覧、右側にチャット画面があるレイアウトで。」
```

```
「この PDF の仕様書に基づいて、ダッシュボード画面のモックを作って。」
```

**モックを修正する例:**

```
「chat-bot のモックで、送信ボタンの色を緑に変えて」
```

**デプロイする例:**

```
「今の変更を反映して（push して）」
```
```

- [ ] **Step 2: コミット**

```bash
git add README.md && git commit -m "docs: add README with setup instructions"
```

---

## Task 11: 全体の動作確認と初回 push

**Files:** なし（確認のみ）

- [ ] **Step 1: テストを全件実行**

```bash
npm run test
```

Expected: 全テスト PASS

- [ ] **Step 2: lint を実行**

```bash
npm run lint
```

Expected: エラーなし

- [ ] **Step 3: ビルド確認**

```bash
npm run build
```

Expected: エラーなしでビルド成功

- [ ] **Step 4: dev サーバーで最終確認**

```bash
npm run dev
```

- `http://localhost:3000` → モック一覧が表示される（Hello World カードが1つ）
- `/hello-world` → チャット画面が表示される
- Ctrl+C で停止

- [ ] **Step 5: 最終コミットと push**

```bash
git add -A && git status
```

未コミットのファイルがあればコミット。

```bash
git push origin main
```

push 後、Vercel のダッシュボードでデプロイが開始されることを確認する。
