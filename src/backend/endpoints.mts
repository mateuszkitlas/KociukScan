import fs from "fs";
import { join } from "path";
import { broadcast, pdf, scanFromBuffer } from "./scanner.mjs";
import * as STB from "scanner-to-buffer";
import { Book } from "../native/types.mjs";
import { AnyFun, SRecord, jsonSafeParse, registerEndpoints } from "../native/utils.mjs";
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

const id = () => new Date().getTime() * 100000;

const endpoints = async (app: Electron.App) => {
  const rootPath = app.getAppPath();
  const tmpPath = join(rootPath, "tmp");
  const exists = await new Promise(resolve => fs.access(tmpPath, err => resolve(!err)));
  if (!exists) fs.promises.mkdir(tmpPath);
  const bookJsonFilePath = join(tmpPath, "book.json");
  const sfb = (buffer: Buffer) => scanFromBuffer(tmpPath, id(), buffer);
  const scan = (device?: string) => STB.scan({ dpi: state.book.dpi, format: "png", device });

  return {
    init: async () => {
      state.book = jsonSafeParse<Book>(
        await fs.promises.readFile(bookJsonFilePath, { encoding: "utf8" }).catch(() => ""),
        state.book,
      );
      return {
        tmpPath,
        book: state.book,
      };
    },
    scanFromFiles: (files: Buffer[]) => {
      const firstId = id();
      return Promise.all(files.map((b, i) => scanFromBuffer(tmpPath, firstId + i * 100, b)));
    },
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
    closeApp: () => app.exit(),
  } satisfies SRecord<AnyFun>;
};

export const registerMainEndpoints = async (app: Electron.App) =>
  registerEndpoints({ add: ipcMain.handle, endpoints: await endpoints(app) });

export type MainEndpoints = Awaited<ReturnType<typeof endpoints>>;
