"use client";

import { useState } from "react";
import RequestPanel from "./RequestPanel";
import ResponsePanel from "./ResponsePanel";
import scenarios from "../data/scenarios.json";

export type Scenario = (typeof scenarios)[number];

export type Provider = "anthropic" | "openai" | "gemini";

export type RequestState = {
  provider: Provider;
  model: string;
  taskType: string;
  preset: string; // scenario id or "custom"
  prompt: string;
};

export type ResponseState = {
  response: string;
  headers: {
    "X-PunkRecords-Model-Used": string;
    "X-PunkRecords-Model-Requested": string;
    "X-PunkRecords-Quality-Score": number;
    "X-PunkRecords-Quality-Delta": number | null;
    "X-PunkRecords-Trace-ID": string;
  };
  originalPrompt: string;
  transformedPrompt: string;
  promptRuleApplied: string;
  error?: string;
} | null;

const MODEL_OPTIONS: Record<string, string[]> = {
  anthropic: ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"],
  openai: ["gpt-4o", "gpt-4o-mini"],
  gemini: ["gemini-2.5-flash", "gemini-2.0-flash"],
};

const TASK_TYPES = [
  "structured_output",
  "summarization",
  "translation",
  "code_generation",
  "qa",
  "creative_writing",
] as const;

// カスタム入力時の汎用 PromptRule 変換テンプレート
function buildTransformedPrompt(taskType: string, originalPrompt: string): string {
  const templates: Record<string, (p: string) => string> = {
    structured_output: (p) =>
      `<instructions>\n<task>${p}</task>\n<output_format>\nJSON形式で構造化して回答してください。\n</output_format>\n</instructions>`,
    summarization: (p) =>
      `<instructions>\n<task>以下を簡潔に要約してください。</task>\n<constraints>\n- 主要なポイントを網羅する\n- 簡潔にまとめる\n</constraints>\n<input>\n${p}\n</input>\n</instructions>`,
    translation: (p) =>
      `<instructions>\n<task>以下を翻訳してください。</task>\n<guidelines>\n- 自然で読みやすい翻訳にする\n- 原文の意味を正確に保つ\n</guidelines>\n<source_text>\n${p}\n</source_text>\n</instructions>`,
    code_generation: (p) =>
      `You are a senior developer. Write production-quality code.\n\nTask: ${p}\n\nRequirements:\n- Handle edge cases\n- Include comments\n- Respond with ONLY the code.`,
    qa: (p) =>
      `You are a helpful assistant. Answer concisely and accurately.\n\nQuestion: ${p}`,
    creative_writing: (p) =>
      `あなたはプロのライターです。\n\n以下のリクエストに応えてください：\n${p}\n\n条件:\n- 読者を惹きつける表現を使う\n- 簡潔かつインパクトのある内容にする`,
  };
  const fn = templates[taskType] ?? templates.qa;
  return fn(originalPrompt);
}

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

    // シナリオからの変換情報を取得、またはカスタム用に生成
    const scenario = request.preset !== "custom"
      ? scenarios.find((s) => s.id === request.preset)
      : null;

    const originalPrompt = request.prompt;
    const transformedPrompt = scenario
      ? scenario.transformedPrompt
      : buildTransformedPrompt(request.taskType, originalPrompt);
    const promptRuleApplied = scenario
      ? scenario.promptRuleApplied
      : `rule_${request.taskType}_generic_v1`;

    try {
      // /api/llm を実際に呼び出す（変換後のプロンプトで）
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: request.provider,
          model: request.model,
          messages: [{ role: "user", content: transformedPrompt }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResponse({
          response: "",
          headers: {
            "X-PunkRecords-Model-Used": request.model,
            "X-PunkRecords-Model-Requested": request.model,
            "X-PunkRecords-Quality-Score": 0,
            "X-PunkRecords-Quality-Delta": null,
            "X-PunkRecords-Trace-ID": `tr_err_${Date.now().toString(36)}`,
          },
          originalPrompt,
          transformedPrompt,
          promptRuleApplied,
          error: data.error ?? "Request failed",
        });
      } else {
        // シミュレートされたヘッダー情報を生成
        const qualityScore = scenario
          ? scenario.headers["X-PunkRecords-Quality-Score"]
          : +(0.8 + Math.random() * 0.15).toFixed(2);
        const qualityDelta = scenario
          ? scenario.headers["X-PunkRecords-Quality-Delta"]
          : +(0.05 + Math.random() * 0.2).toFixed(2);

        setResponse({
          response: data.content,
          headers: {
            "X-PunkRecords-Model-Used": data.model ?? request.model,
            "X-PunkRecords-Model-Requested": request.model,
            "X-PunkRecords-Quality-Score": qualityScore,
            "X-PunkRecords-Quality-Delta": qualityDelta,
            "X-PunkRecords-Trace-ID": `tr_${Date.now().toString(36)}`,
          },
          originalPrompt,
          transformedPrompt,
          promptRuleApplied,
        });
      }
    } catch (err) {
      setResponse({
        response: "",
        headers: {
          "X-PunkRecords-Model-Used": request.model,
          "X-PunkRecords-Model-Requested": request.model,
          "X-PunkRecords-Quality-Score": 0,
          "X-PunkRecords-Quality-Delta": null,
          "X-PunkRecords-Trace-ID": `tr_err_${Date.now().toString(36)}`,
        },
        originalPrompt,
        transformedPrompt,
        promptRuleApplied,
        error: err instanceof Error ? err.message : "Network error",
      });
    }

    setLoading(false);
  };

  const handleProviderChange = (provider: Provider) => {
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
