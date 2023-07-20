import { getClientConfig } from "../config/client";
import { ACCESS_CODE_PREFIX } from "../constant";
import { ChatMessage, ModelType, useAccessStore, useChatStore } from "../store";
import { ChatGPTApi } from "./platforms/openai";
import * as CryptoJS from "crypto-js";
import {
  PostChangePassword,
  PostForgotPassword,
  PostInvitationRecords,
  PostRegister,
  PostSendCode,
  PostSendResetPasswordCode,
  PostUser,
} from "@/app/http/user";

export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export const Models = ["gpt-3.5-turbo", "gpt-4"] as const;
export type ChatModel = ModelType;

export interface RequestMessage {
  role: MessageRole;
  content: string;
}

export interface LLMConfig {
  model: string;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface ChatOptions {
  messages: RequestMessage[];
  config: LLMConfig;

  onUpdate?: (message: string, chunk: string) => void;
  onFinish: (message: string) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
}

export interface LLMUsage {
  used: number;
  total: number;
}

export interface LLMModel {
  name: string;
  available: boolean;
}

export abstract class LLMApi {
  abstract chat(options: ChatOptions): Promise<void>;
  abstract usage(): Promise<LLMUsage>;
  abstract models(): Promise<LLMModel[]>;
}

type ProviderName = "openai" | "azure" | "claude" | "palm";

interface Model {
  name: string;
  provider: ProviderName;
  ctxlen: number;
}

interface ChatProvider {
  name: ProviderName;
  apiConfig: {
    baseUrl: string;
    apiKey: string;
    summaryModel: Model;
  };
  models: Model[];

  chat: () => void;
  usage: () => void;
}

export class ClientApi {
  public llm: LLMApi;

  constructor() {
    this.llm = new ChatGPTApi();
  }

  config() {}

  prompts() {}

  masks() {}

  async share(messages: ChatMessage[], avatarUrl: string | null = null) {
    const msgs = messages
      .map((m) => ({
        from: m.role === "user" ? "human" : "gpt",
        value: m.content,
      }))
      .concat([
        {
          from: "human",
          value: "Share from [TryChat]: https://TryChat/",
        },
      ]);
    console.log("[Share]", msgs);
    const clientConfig = getClientConfig();
    const proxyUrl = "/sharegpt";
    const rawUrl = "https://sharegpt.com/api/conversations";
    const shareUrl = clientConfig?.isApp ? rawUrl : proxyUrl;
    const res = await fetch(shareUrl, {
      body: JSON.stringify({
        avatarUrl,
        items: msgs,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const resJson = await res.json();
    console.log("[Share]", resJson);
    if (resJson.id) {
      return `https://shareg.pt/${resJson.id}`;
    }
  }

  async PostLatestNews() {
    const proxyUrl = "/api/latestNews";
    const response = await fetch(proxyUrl, {
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    return response.json();
  }

  async PostLogin(params: any) {
    const proxyUrl = "/api/login";
    const response = await fetch(proxyUrl, {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    return response.json();
  }

  async PostRegister(params: any) {
    const proxyUrl = "/api/register";
    const response = await fetch(proxyUrl, {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    return response.json();
  }

  async PostSendCode(params: any) {
    const proxyUrl = "/api/sendCode";
    const response = await fetch(proxyUrl, {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    return response.json();
  }
  async PostSendResetPasswordCode(params: any) {
    const proxyUrl = "/api/sendResetPasswordCode";
    const response = await fetch(proxyUrl, {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    return response.json();
  }
  async PostUser() {
    const proxyUrl = "/api/user";
    const token = localStorage.getItem("access_token") || "";
    const response = await fetch(proxyUrl, {
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      method: "POST",
    });

    return response.json();
  }
  async PostChangePassword(params: any) {
    const proxyUrl = "/api/changePassword";
    const token = localStorage.getItem("access_token") || "";
    const response = await fetch(proxyUrl, {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      method: "POST",
    });

    return response.json();
  }
  async PostInvitationRecords(params: any) {
    const proxyUrl = "/api/invitationRecords";
    const token = localStorage.getItem("access_token") || "";
    const response = await fetch(proxyUrl, {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      method: "POST",
    });

    return response.json();
  }
  async PostForgotPassword(params: any) {
    const proxyUrl = "/api/forgotPassword";
    const token = localStorage.getItem("access_token") || "";
    const response = await fetch(proxyUrl, {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      method: "POST",
    });

    return response.json();
  }
}

export const api = new ClientApi();

export function generateAuth() {
  const key = "TryChat-2023-C1-07-14-A";
  const timestamp = Date.now().toString();
  const plaintext = key + timestamp;

  return CryptoJS.AES.encrypt(plaintext, key).toString();
}

export function getHeaders() {
  const accessStore = useAccessStore.getState();
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    "user-agent-auth": generateAuth(),
    "x-requested-with": "XMLHttpRequest",
    "x-access-token": localStorage.getItem("access_token") || "",
    "x-model-type": useChatStore.getState().currentSession().mask.modelConfig
      .model,
  };

  const makeBearer = (token: string) => `Bearer ${token.trim()}`;
  const validString = (x: string) => x && x.length > 0;

  // use user's api key first
  if (validString(accessStore.token)) {
    headers.Authorization = makeBearer(accessStore.token);
  } else if (
    accessStore.enabledAccessControl() &&
    validString(accessStore.accessCode)
  ) {
    headers.Authorization = makeBearer(
      ACCESS_CODE_PREFIX + accessStore.accessCode,
    );
  }

  return headers;
}
