"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 w-80 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Counter</h1>
      <div className="text-6xl font-mono font-semibold text-indigo-600 mb-8">
        {count}
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setCount((prev) => prev - 1)}
          className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 active:scale-95 transition-all cursor-pointer"
        >
          − 1
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-5 py-2.5 rounded-lg bg-gray-400 text-white font-medium hover:bg-gray-500 active:scale-95 transition-all cursor-pointer"
        >
          Reset
        </button>
        <button
          onClick={() => setCount((prev) => prev + 1)}
          className="px-5 py-2.5 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 active:scale-95 transition-all cursor-pointer"
        >
          ＋ 1
        </button>
      </div>
    </div>
  );
}
