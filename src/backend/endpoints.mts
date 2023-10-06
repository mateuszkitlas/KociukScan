import fs from "fs";
import { join } from "path";
import { broadcast, pdf, scanFromBuffer } from "./scanner.mjs";
import * as STB from "scanner-to-buffer";
import { Book } from "../native/types.mjs";
import { AnyFun, SRecord, arrayBufferToBuffer, jsonSafeParse, registerEndpoints } from "../native/utils.mjs";
import { ipcMain } from "electron";

type State = {
  scanning?: "many" | "one";
  abortPdf: boolean;
  book: Book;
};

const state: State = {
  abortPdf: false,
  book: {
    delay: 5,
    pages: [],
    width: 400,
    height: 400,
    dpi: 200,
    color: { contrast: 1 },
  },
};

const beep = () => {
  const context = new AudioContext();
  const o = context.createOscillator();
  o.type = "sine";
  o.connect(context.destination);
  o.start();
  setTimeout(() => o.stop(), 300);
};

const randomId = () => Math.floor(new Date().getTime() + Math.random()) * 10000;

const endpoints = async (app: Electron.App) => {
  const rootPath = app.getAppPath();
  const tmpPath = join(rootPath, "tmp");
  const exists = await new Promise(resolve => fs.access(tmpPath, err => resolve(!err)));
  if (!exists) fs.promises.mkdir(tmpPath);
  const bookJsonFilePath = join(tmpPath, "book.json");
  const sfb = (buffer: Buffer) => scanFromBuffer(tmpPath, randomId(), buffer);
  const scan = (device?: string) => STB.scan({ dpi: state.book.dpi, format: "png", device });

  return {
    init: async () => ({
      tmpPath,
      book: (state.book = jsonSafeParse<Book>(
        await fs.promises.readFile(bookJsonFilePath, { encoding: "utf8" }).catch(() => ""),
        state.book,
      )),
    }),
    scanFromFile: (arrayBuffer: ArrayBuffer) => scanFromBuffer(tmpPath, randomId(), arrayBufferToBuffer(arrayBuffer)),
    scanOne: async (device?: string) => {
      if (state.scanning) throw "already scanning";
      state.scanning = "one";
      const x = await sfb(await scan(device));
      state.scanning = undefined;
      return x;
    },
    scanMany: async (device?: string) => {
      if (state.scanning) throw "already scanning";
      state.scanning = "many";
      while (state.scanning === "many") {
        const b = await scan(device);
        beep();
        broadcast("newPage", await sfb(b));
      }
    },
    scanAbort: () => (state.scanning = undefined),
    abortPdf: () => (state.abortPdf = true),
    pdf: () =>
      pdf({
        tmpPath,
        book: state.book,
        abort: () => {
          if (state.abortPdf) {
            state.abortPdf = false;
            return true;
          } else return false;
        },
      }),
    listDevices: STB.list,
    setBook: (book: Book) => {
      state.book = book;
      fs.promises.writeFile(bookJsonFilePath, JSON.stringify(book), { encoding: "utf8" });
    },
  } satisfies SRecord<AnyFun>;
};

export const registerMainEndpoints = async (app: Electron.App) =>
  registerEndpoints(ipcMain.handle, await endpoints(app));

export type MainEndpoints = Awaited<ReturnType<typeof endpoints>>;
