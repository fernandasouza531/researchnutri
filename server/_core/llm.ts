import { ENV } from "./env";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type InvokeResult = {
  id: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

export async function invokeLLM(params: {
  messages: Message[];
  responseFormat?: { type: "text" } | { type: "json_object" };
  maxTokens?: number;
}): Promise<InvokeResult> {
  if (!ENV.llmApiKey) {
    throw new Error("LLM_API_KEY is not configured");
  }

  const payload: Record<string, unknown> = {
    model: "gemini-2.5-flash",
    messages: params.messages,
    max_tokens: params.maxTokens ?? 16384,
  };

  if (params.responseFormat) {
    payload.response_format = params.responseFormat;
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.llmApiKey}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }

  return (await response.json()) as InvokeResult;
}
