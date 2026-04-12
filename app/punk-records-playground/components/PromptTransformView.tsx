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
