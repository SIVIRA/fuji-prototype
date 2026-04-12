"use client";

import type { RequestState, Scenario, Provider } from "./Playground";

type Props = {
  request: RequestState;
  modelOptions: string[];
  taskTypes: string[];
  filteredScenarios: Scenario[];
  loading: boolean;
  onProviderChange: (provider: Provider) => void;
  onModelChange: (model: string) => void;
  onTaskTypeChange: (taskType: string) => void;
  onPresetChange: (preset: string) => void;
  onPromptChange: (prompt: string) => void;
  onSend: () => void;
};

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  gemini: "Google (Gemini)",
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
          {(["anthropic", "openai", "gemini"] as const).map((p) => (
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
