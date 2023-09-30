import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { IconType } from "react-icons/lib";
import md5 from "md5";
import { State } from "../native/state";
import { genInvoke, toError } from "../native/utils";
import type { MainEndpoints } from "../backend/endpoints";
import { ipcRenderer } from "electron";

export const reactSvgComponentToMarkupString = (component: IconType) =>
  `url(data:image/svg+xml,${encodeURIComponent(
    renderToStaticMarkup(createElement(component))
  )})`;

export const hashToPng = (tmpPath: string, hash: string) => `${tmpPath}/${hash}.png`;

const queue: Map<string, { handler: number; reject: () => void }> = new Map();
export function dispatch<T>(f: () => Promise<T>, hash: string, timeout: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const previous = queue.get(hash);
    if (previous) {
      const { reject, handler } = previous;
      reject();
      clearTimeout(handler);
    }
    const handler = window.setTimeout(() => {
      f()
        .then((x) => { queue.delete(hash); resolve(x);})
        .catch(reject);
    }, timeout);
    queue.set(hash, { handler, reject: () => reject("cancelled") });
  });
}

export const scan = async (s: State) => {
  try {
    const hash = await invoke("scanToHash", s.rs.book.dpi, s.rs.device)
    return () => invoke("popPageFromHash", hash)
  } catch (e) {
    s.setRS(rs => ({ ...rs, modal: { kind: "errorScan", message: toError(e).message } }));
  }
}

export const randomMd5 = () => md5(Math.random().toString());

export const invoke = genInvoke<MainEndpoints>((...args) => ipcRenderer.invoke(...args))
export type InitProps = Awaited<ReturnType<MainEndpoints["init"]>>
