import { join } from "path";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { IconType } from "react-icons/lib";
import md5 from "md5";
import { State } from "../native/state";
import { toError } from "../native/utils";
import { ipcRendererInvoke } from "../backend/endpoints";

export const reactSvgComponentToMarkupString = (component: IconType) =>
  `url(data:image/svg+xml,${encodeURIComponent(
    renderToStaticMarkup(createElement(component))
  )})`;

export const hashToPng = (tmpPath: string, hash: string) => join(tmpPath, `${hash}.png`);

const queue: Map<string, { handler: NodeJS.Timeout; reject: () => void }> = new Map();
export function dispatch<T>(f: () => Promise<T>, hash: string, timeout: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const previous = queue.get(hash);
    if (previous) {
      const { reject, handler } = previous;
      reject();
      clearTimeout(handler);
    }
    const handler = setTimeout(() => {
      f()
        .then((x) => { queue.delete(hash); resolve(x);})
        .catch(reject);
    }, timeout);
    queue.set(hash, { handler, reject: () => reject("cancelled") });
  });
}

export const scan = async (s: State) => {
  try {
    const hash = await ipcRendererInvoke("scanToHash", s.rs.book.dpi, s.rs.device)
    return () => ipcRendererInvoke("popPageFromHash", hash)
  } catch (e) {
    s.setRS(rs => ({ ...rs, modal: { kind: "errorScan", message: toError(e).message } }));
  }
}

export const randomMd5 = () => md5(Math.random().toString());
