import fs from "fs";
import { join } from "path";
import { scanFromBuffer, scanFromFile } from "./scanner";
import electron from "electron";
import { scan } from "scanner-to-buffer";
import md5 from "md5";
import { Page } from "../native/types";

const pages: Record<string, Promise<Page>> = {}

export const endpoints = async (app: Electron.App) => {
  const rootPath = app.getAppPath();
  const tmpPath = join(rootPath, "tmp");
  const exists = await new Promise(resolve =>
    fs.access(tmpPath, err => resolve(!err)))
  if(!exists) fs.promises.mkdir(tmpPath)
  return {
    rootPath: () => rootPath,
    tmpPath: () => tmpPath,
    scanFromFile: scanFromFile(tmpPath),
    scanToHash: async (dpi: number, device?: string) => {
      const buffer = await scan({ dpi, format: "png", device });
      const hash = md5(buffer);
      pages[hash] = scanFromBuffer(tmpPath, hash, buffer);
      return hash;
    },
    popPageFromHash: (hash: string) => {
      const p = pages[hash];
      delete pages[hash];
      return p;
    }
  } satisfies Record<string, Function>;
}

type E = Awaited<ReturnType<typeof endpoints>>

export const ipcRendererInvoke = <K extends keyof E>(channel: K, ...args: Parameters<E[K]>) =>
  electron.ipcRenderer.invoke(channel, ...args) as Promise<Awaited<ReturnType<E[K]>>>
