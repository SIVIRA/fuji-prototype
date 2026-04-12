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
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
