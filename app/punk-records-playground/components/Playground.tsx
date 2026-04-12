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
