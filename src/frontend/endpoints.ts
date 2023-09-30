import { ipcRenderer } from "electron";
import { State } from "../native/state.mjs";
import { AnyFun, SRecord, registerEndpoints } from "../native/utils.mjs";

const endpoints = (s: State) => {
  return {
    genPdfProgress: (processedPages: number) =>
      s.setRS(rs => (s.rs.kind === "generating pdf" ? { ...rs, processedPages } : rs)),
    error: (message: string) => s.setRS(rs => ({ ...rs, modal: { kind: "errorScan", message } })),
  } satisfies SRecord<AnyFun>;
};

export type RendererEndpoints = ReturnType<typeof endpoints>;
export const registerRendererEndpoints = (s: State) =>
  registerEndpoints((...args) => ipcRenderer.on(...args), endpoints(s));
