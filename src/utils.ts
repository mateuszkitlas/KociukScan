import { join } from "path";
import { existsSync, mkdirSync } from 'fs';
import { electron } from './electronImports';
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { IconType } from 'react-icons/lib';
import md5 from "md5";

export const sleep = (seconds: number) => new Promise(resolve => setTimeout(resolve, 1000*seconds));

export function arrayBufferToBuffer(ab: ArrayBuffer) {
  const buf = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
  }
  return buf;
}

export const reactSvgComponentToMarkupString = (component: IconType) =>
  `url(data:image/svg+xml,${encodeURIComponent(
    renderToStaticMarkup(createElement(component))
  )})`;


const rootPath = electron.remote.process?.cwd();
export const tmpRawPath = join(rootPath, "tmp");
if (!existsSync(tmpRawPath)) {
  mkdirSync(tmpRawPath);
}

const tmpPath = (filename: string) => join(tmpRawPath, filename);
export const hashToPng = (hash: string) => tmpPath(`${hash}.png`);


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

export const randomMd5 = () => md5(Math.random().toString());
