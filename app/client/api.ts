import { getClientConfig } from "../config/client";
import { ACCESS_CODE_PREFIX } from "../constant";
import { ChatMessage, ModelType, useAccessStore, useChatStore } from "../store";
import { ChatGPTApi } from "./platforms/openai";
import * as CryptoJS from "crypto-js";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { showToast } from "@/app/components/ui-lib";

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
  private dataListeners: ((data: string) => void)[] = [];

  constructor() {
    this.llm = new ChatGPTApi();
  }

  config() {}

  prompts() {}
  endpoints() {}

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
  async GetCaptcha() {
    const proxyUrl = "/api/captcha";
    const response = await fetch(proxyUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });
    return response.json();
  }
  // async PostGenerateAMindMap(params: any) {
  //   const proxyUrl = "/api/module/generateAMindMap";
  //   const token = localStorage.getItem("access_token") || "";
  //   const response = await fetch(proxyUrl, {
  //     body: JSON.stringify(params),
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-access-token": token,
  //     },
  //     method: "POST",
  //   });
  //   return await response.text();
  // }

  // async PostGenerateAMindMap(params: any, onData: (data: string) => void) {
  //   const proxyUrl = "/api/module/generateAMindMap";
  //   const token = localStorage.getItem("access_token") || "";
  //
  //   let responseText = "";
  //   let finished = false;
  //
  //   const response = await fetchEventSource(proxyUrl, {
  //     body: JSON.stringify(params),
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-access-token": token,
  //     },
  //     method: "POST",
  //     onopen(res) {
  //       const contentType = res.headers.get("content-type");
  //       console.log("[OpenAI] request response content type: ", contentType);
  //
  //       if (contentType?.startsWith("text/plain")) {
  //         responseText = "";
  //         return;
  //       }
  //
  //       if (
  //         !res.ok ||
  //         !res.headers
  //           .get("content-type")
  //           ?.startsWith(EventStreamContentType) ||
  //         res.status !== 200
  //       ) {
  //         console.error("[Request] error", res);
  //         return;
  //       }
  //     },
  //     onmessage(msg) {
  //       if (msg.data === "[DONE]" || finished) {
  //         finish();
  //         return;
  //       }
  //       const text = msg.data;
  //       try {
  //         const json = JSON.parse(text);
  //         const delta = json.choices[0].delta.content;
  //         if (delta) {
  //           responseText += delta;
  //           onData(delta); // 调用回调函数，传递实时数据
  //         }
  //       } catch (e) {
  //         console.error("[Request] parse error", text, msg);
  //       }
  //     },
  //     onclose() {
  //       finish();
  //     },
  //     onerror(e) {
  //       console.error("[Request] error", e);
  //       throw e;
  //     },
  //     openWhenHidden: true,
  //   });
  //
  //   return responseText;
  //
  //   function finish() {
  //     finished = true;
  //     // 处理请求结束的逻辑
  //   }
  // }

  async PostGenerateAMindMap(
    params: any,
    onData: (responseText: string, delta: string) => void,
  ) {
    // 将 onData 作为参数传入
    const proxyUrl = "/api/module/generateAMindMap";
    const token = localStorage.getItem("access_token") || "";

    let responseText = "";

    const response = await fetchEventSource(proxyUrl, {
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      method: "POST",
      onopen: async (res: Response) => {
        const contentType = res.headers.get("content-type");

        if (contentType?.startsWith("text/plain")) {
          responseText = "";
          return;
        }

        if (!res.ok) {
          if (contentType?.startsWith("application/json")) {
            const errorData = await res.json();
            console.log(errorData);

            if (errorData.status === 429) {
              showToast(errorData.msg);
            } else {
              showToast("当前接口负载过高，请稍后重试");
            }
          } else {
            showToast("当前接口负载过高，请稍后重试");
          }
          return;
        }

        if (
          !res.headers.get("content-type")?.startsWith(EventStreamContentType)
        ) {
          console.log(res);
          showToast("当前接口负载过高，请稍后重试");
          return;
        }
      },

      onmessage(msg) {
        if (msg.data === "[DONE]") {
          finish();
          return;
        }
        const text = msg.data;
        try {
          const json = JSON.parse(text);
          const delta = json.choices[0].delta.content;
          if (delta) {
            responseText += delta;
            onData(responseText, delta); // 调用传入的 onData 回调函数，传递实时数据
          }
        } catch (e) {
          console.error("[Request] parse error", text, msg);
        }
      },
      onclose() {
        finish();
      },
      onerror(e) {
        console.error("[Request] error", e);
        throw e;
      },
      openWhenHidden: true,
    });

    return responseText;

    function finish() {
      // 处理请求结束的逻辑
    }
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
