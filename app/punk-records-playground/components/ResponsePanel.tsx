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
