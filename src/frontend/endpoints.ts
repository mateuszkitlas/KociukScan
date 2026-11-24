import { ipcRenderer } from "electron";
import { AnyFun, SRecord, registerEndpoints } from "../native/utils.mjs";
import { SetState } from "./state.mjs";
import { Page } from "../native/types.mjs";

const beep = () => {
  const context = new AudioContext();
  const o = context.createOscillator();
  o.type = "sine";
  o.connect(context.destination);
  o.start();
  setTimeout(() => {
    o.stop();
    context.close();
  }, 300);
};

const endpoints = (set: SetState) =>
  ({
    newPage: (page: Page) => {
      beep();
      set.pages(pages => [...pages, page]);
    },
    genPdfProgress: (processedPages: number) =>
      set(rs => (rs.kind === "generating pdf" ? { ...rs, processedPages } : rs)),
    error: (message: string) => set(rs => ({ ...rs, modal: { kind: "error", message } })),
  }) satisfies SRecord<AnyFun>;

export type RendererEndpoints = ReturnType<typeof endpoints>;
export const registerRendererEndpoints = (set: SetState) =>
  registerEndpoints({
    add: (...args) => ipcRenderer.on(...args),
    remove: (...args) => ipcRenderer.removeListener(...args),
    endpoints: endpoints(set),
  });
