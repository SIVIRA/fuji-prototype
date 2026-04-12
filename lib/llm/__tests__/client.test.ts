import { describe, it, expect, vi, beforeEach } from "vitest";
import { callLLM } from "../client";
import type { LLMRequest } from "../types";

// Anthropic SDK をモック
vi.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = vi.fn().mockImplementation(function () {
    return {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: "text", text: "Hello from Claude" }],
          model: "claude-sonnet-4-20250514",
        }),
      },
    };
  });
  return { default: MockAnthropic };
});

// OpenAI SDK をモック
vi.mock("openai", () => {
  const MockOpenAI = vi.fn().mockImplementation(function () {
    return {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "Hello from GPT" } }],
            model: "gpt-4o",
          }),
        },
      },
    };
  });
  return { default: MockOpenAI };
});

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

    await expect(callLLM(request)).rejects.toThrow(
      "Unsupported provider: unknown"
    );
  });
});
