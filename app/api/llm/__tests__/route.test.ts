import { describe, it, expect, vi } from "vitest";
import { POST } from "../route";

vi.mock("@/lib/llm/client", () => ({
  callLLM: vi.fn().mockResolvedValue({
    content: "Mocked response",
    model: "claude-sonnet-4-20250514",
    provider: "anthropic",
  }),
}));

function createRequest(body: object): Request {
  return new Request("http://localhost:3000/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/llm", () => {
  it("should return LLM response for valid request", async () => {
    const request = createRequest({
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: "Hello" }],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toBe("Mocked response");
    expect(data.provider).toBe("anthropic");
  });

  it("should return 400 for missing provider", async () => {
    const request = createRequest({
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: "Hello" }],
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("should return 400 for missing messages", async () => {
    const request = createRequest({
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
