export type LLMProvider = "anthropic" | "openai";

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMRequest {
  provider: LLMProvider;
  model: string;
  messages: LLMMessage[];
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProvider;
}
