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
