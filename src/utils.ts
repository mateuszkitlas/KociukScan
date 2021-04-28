import { join } from "path";
import { existsSync, mkdirSync } from 'fs';
import { electron } from './electronImports';


export const sleep = (seconds: number) => new Promise(resolve => setTimeout(resolve, 1000*seconds));

export function arrayBufferToBuffer(ab: ArrayBuffer) {
  const buf = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
  }
  return buf;
}

const rootPath = electron.remote.process?.cwd();
export const tmpRawPath = join(rootPath, "tmp");
if (!existsSync(tmpRawPath)) {
  mkdirSync(tmpRawPath);
}

const tmpPath = (filename: string) => join(tmpRawPath, filename);
export const hashToPng = (hash: string) => tmpPath(`${hash}.png`);
