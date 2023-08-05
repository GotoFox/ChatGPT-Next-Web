import { create } from "zustand";
import { persist } from "zustand/middleware";
import Fuse from "fuse.js";
import { getLang } from "../locales";
import { StoreKey } from "../constant";
import { nanoid } from "nanoid";

export interface Endpoint {
  id: string;
  isUser?: boolean;
  title: string;
  url: string;
  content: string;
  checked: boolean;
  createdAt: number;
}

export interface PromptStore {
  counter: number;
  prompts: Record<string, Endpoint>;

  add: (prompt: Endpoint) => string;
  get: (id: string) => Endpoint | undefined;
  remove: (id: string) => void;
  search: (text: string) => Endpoint[];
  update: (id: string, updater: (prompt: Endpoint) => void) => void;

  getUserPrompts: () => Endpoint[];
}

export const SearchEndpointsService = {
  ready: false,
  builtinEngine: new Fuse<Endpoint>([], { keys: ["title"] }),
  userEngine: new Fuse<Endpoint>([], { keys: ["title"] }),
  count: {
    builtin: 0,
  },
  allPrompts: [] as Endpoint[],
  builtinPrompts: [] as Endpoint[],

  init(builtinPrompts: Endpoint[], userPrompts: Endpoint[]) {
    if (this.ready) {
      return;
    }
    this.allPrompts = userPrompts.concat(builtinPrompts);
    this.builtinPrompts = builtinPrompts.slice();
    this.builtinEngine.setCollection(builtinPrompts);
    this.userEngine.setCollection(userPrompts);
    this.ready = true;
  },

  remove(id: string) {
    this.userEngine.remove((doc) => doc.id === id);
  },

  add(prompt: Endpoint) {
    this.userEngine.add(prompt);
  },

  search(text: string) {
    const userResults = this.userEngine.search(text);
    const builtinResults = this.builtinEngine.search(text);
    return userResults.concat(builtinResults).map((v) => v.item);
  },
};

export const useEndpoints = create<PromptStore>()(
  persist(
    (set, get) => ({
      counter: 0,
      latestId: 0,
      prompts: {},

      add(prompt) {
        const prompts = get().prompts;
        prompt.id = nanoid();
        prompt.isUser = true;
        prompt.checked = false;
        prompt.createdAt = Date.now();
        prompts[prompt.id] = prompt;

        set(() => ({
          latestId: prompt.id!,
          prompts: prompts,
        }));

        return prompt.id!;
      },

      get(id) {
        const targetPrompt = get().prompts[id];

        if (!targetPrompt) {
          return SearchEndpointsService.builtinPrompts.find((v) => v.id === id);
        }

        return targetPrompt;
      },

      remove(id) {
        const prompts = get().prompts;
        delete prompts[id];
        SearchEndpointsService.remove(id);

        set(() => ({
          prompts,
          counter: get().counter + 1,
        }));
      },

      getUserPrompts() {
        const userPrompts = Object.values(get().prompts ?? {});
        userPrompts.sort((a, b) =>
          b.id && a.id ? b.createdAt - a.createdAt : 0,
        );
        return userPrompts;
      },

      update(id, updater) {
        const prompt = get().prompts[id] ?? {
          title: "",
          content: "",
          checked: "",
          id,
        };

        SearchEndpointsService.remove(id);
        updater(prompt);
        const prompts = get().prompts;
        prompts[id] = prompt;
        set(() => ({ prompts }));
        SearchEndpointsService.add(prompt);
      },

      search(text) {
        if (text.length === 0) {
          // return all rompts
          return get()
            .getUserPrompts()
            .concat(SearchEndpointsService.builtinPrompts);
        }
        return SearchEndpointsService.search(text) as Endpoint[];
      },
    }),
    {
      name: StoreKey.Endpoints,
      version: 3,

      migrate(state, version) {
        const newState = JSON.parse(JSON.stringify(state)) as PromptStore;

        if (version < 3) {
          Object.values(newState.prompts).forEach((p) => (p.id = nanoid()));
        }

        return newState;
      },

      onRehydrateStorage(state) {
        const PROMPT_URL = "./endpoints.json";

        type PromptList = Array<[string, string, string, boolean]>;

        fetch(PROMPT_URL)
          .then((res) => res.json())
          .then((res) => {
            let fetchPrompts = [res.list];
            fetchPrompts = fetchPrompts.reverse();
            const builtinPrompts = fetchPrompts.map(
              (promptList: PromptList) => {
                return promptList.map(
                  ([title, url, content, checked]) =>
                    ({
                      id: nanoid(),
                      title,
                      url,
                      content,
                      checked,
                      createdAt: Date.now(),
                    } as Endpoint),
                );
              },
            );

            const userPrompts = useEndpoints.getState().getUserPrompts() ?? [];

            const allPromptsForSearch = builtinPrompts
              .reduce((pre, cur) => pre.concat(cur), [])
              .filter((v) => !!v.url);
            SearchEndpointsService.count.builtin = res.list.length;
            SearchEndpointsService.init(allPromptsForSearch, userPrompts);
          });
      },
    },
  ),
);
