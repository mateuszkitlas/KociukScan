import { ipcRenderer } from "electron";
import { AnyFun, SRecord, registerEndpoints } from "../native/utils.mjs";
import { SetState } from "./state.mjs";
import { Page } from "../native/types.mjs";

const endpoints = (set: SetState) =>
  ({
    newPage: (page: Page) => set.pages(pages => [...pages, page]),
    genPdfProgress: (processedPages: number) =>
      set(rs => (rs.kind === "generating pdf" ? { ...rs, processedPages } : rs)),
    error: (message: string) => set(rs => ({ ...rs, modal: { kind: "error", message } })),
  }) satisfies SRecord<AnyFun>;

export type RendererEndpoints = ReturnType<typeof endpoints>;
export const registerRendererEndpoints = (set: SetState) =>
  registerEndpoints((...args) => ipcRenderer.on(...args), endpoints(set));
