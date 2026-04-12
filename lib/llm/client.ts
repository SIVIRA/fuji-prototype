import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { LLMRequest, LLMResponse } from "./types";

async function callAnthropic(request: LLMRequest): Promise<LLMResponse> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

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
