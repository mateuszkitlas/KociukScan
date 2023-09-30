import fs from "fs";
import { join } from "path";
import { pdf, scanFromBuffer } from "./scanner";
import * as STB from "scanner-to-buffer";
import md5 from "md5";
import { Book, Page } from "../native/types";
import { AnyFun, SRecord, arrayBufferToBuffer, jsonSafeParse, registerEndpoints, satisfies } from "../native/utils";
import { ipcMain } from "electron";

const state = {
  pages: satisfies<SRecord<Promise<Page>>>({}),
  abortPdf: false,
}

const endpoints = async (app: Electron.App) => {
  const rootPath = app.getAppPath();
  const tmpPath = join(rootPath, "tmp");
  const exists = await new Promise(resolve =>
    fs.access(tmpPath, err => resolve(!err)))
  if(!exists) fs.promises.mkdir(tmpPath)
  const bookJsonFilePath = join(tmpPath, "book.json");

  return {
    init: async () => {
      const bookJson = await fs.promises.readFile(bookJsonFilePath, { encoding: "utf8" }).catch(() => "");
      const book = jsonSafeParse<Book>(bookJson, {
          delay: 5,
          pages: [],
          width: 400,
          height: 400,
          dpi: 200,
          color: {
            contrast: 1,
          }
      })
      return {
      tmpPath,
      book
    }
    },
    scanFromFile: async (arrayBuffer: ArrayBuffer) => {
      const buffer = arrayBufferToBuffer(arrayBuffer)
      return scanFromBuffer(tmpPath, md5(buffer), buffer);
    },
    scanToHash: async (dpi: number, device?: string) => {
      const buffer = await STB.scan({ dpi, format: "png", device });
      const hash = md5(buffer);
      state.pages[hash] = scanFromBuffer(tmpPath, hash, buffer);
      return hash;
    },
    popPageFromHash: (hash: string) => {
      const p = state.pages[hash];
      delete state.pages[hash];
      return p;
    },
    abortPdf: () => {
      state.abortPdf = true;
    },
    pdf: (book: Book) => pdf({ tmpPath, book, abort: () => { 
      if(state.abortPdf) {
        state.abortPdf = false;
        return true;
      } else return false;
    } }),
    listDevices: () => STB.list(),
    setBook: (book: Book) => fs.promises.writeFile(bookJsonFilePath, JSON.stringify(book), { encoding: "utf8" })
  } satisfies SRecord<AnyFun>;
}

export const registerMainEndpoints = async (app: Electron.App) =>
  registerEndpoints(ipcMain.handle, await endpoints(app))

export type MainEndpoints = Awaited<ReturnType<typeof endpoints>>
