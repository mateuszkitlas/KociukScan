import { Book, Page } from "./types";
import type { Sharp, OutputInfo, SharpOptions, FitEnum } from "sharp";
import { join } from "path";
import md5 from "md5";
import { writeFileSync, createWriteStream, readFileSync, existsSync, mkdirSync } from 'fs';
import type * as pdfkitT from "pdfkit";
import { zoomByDpi, ProcessedPageOpts } from "./logic";
import type * as electronT from "electron"
import { scan } from 'scanner-to-buffer';

const sharp: {
  (buf: Buffer | string, o?: SharpOptions): Sharp,
  fit: FitEnum
} = window.require("sharp");
const pdfkit: (typeof pdfkitT)["default"] = window.require("pdfkit");
const electron: (typeof electronT) = require('electron');

const rootPath = electron.remote.process?.cwd();
const tmpRawPath = join(rootPath, "tmp");
if (!existsSync(tmpRawPath)) {
  mkdirSync(tmpRawPath);
}


const tmpPath = (filename: string) => join(tmpRawPath, filename);
const imgPath = (hash: string) => tmpPath(`${hash}.png`);

const toBuffer = (s: Sharp) =>
  new Promise<{ buffer: Buffer, info: OutputInfo}>(
    (resolve, reject) => s.toBuffer((err, buffer, info) => {
      if (err) {
        reject(err);
      } else {
        resolve({ buffer, info });
      }
    }
  )
);
const reSharp = async (s: Sharp) => sharp((await toBuffer(s)).buffer);

const processPage = async (opts: ProcessedPageOpts): Promise<Buffer> => {
  const zoom = zoomByDpi(opts.dpi);
  const img = await toBuffer(sharp(imgPath(opts.hash)));
  
  const sharp1 = zoom === 1
    ? sharp(img.buffer)
    : sharp(img.buffer).resize(
      Math.floor(img.info.width*zoom),
      Math.floor(img.info.height*zoom)
    );
  const sharp11 = sharp1.rotate(opts.rotate);
  const margin = 500;
  const sharp2 = await reSharp(sharp11.extend((margin)));
  const img3 = sharp2
    .extract({
      top: opts.y + margin,
      left: opts.x + margin,
      width: opts.width,
      height: opts.height,
    });
  return (await toBuffer(img3)).buffer
}

export const loadPNG = (hash: string) => {
  try {
    const buf = readFileSync(imgPath(hash));
    return buf.toString("base64");
  } catch {
    return ""
  }
}

export const miniaturePNG = async (opts: ProcessedPageOpts) => {
  const buffer = await sharp(await processPage(opts))
    .resize({
      width: 100,
      height: 100,
      fit: sharp.fit.contain,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFormat("png")
    .toBuffer()
  return buffer.toString("base64")
}

const getInfo = (buf: Buffer) => new Promise<OutputInfo>((resolve, reject) =>
  sharp(buf).toBuffer((err, _buf, info) => err ? reject(err) : resolve(info))
);

export const scanX = async (opts: Omit<ProcessedPageOpts, "hash">) => {
  console.log("scanning...");
  const stdout = await scan({ dpi: opts.dpi, format: "png" });
  const hash = md5(stdout);
  const info = await getInfo(stdout);
  console.log(hash);
  const path = imgPath(hash);
  writeFileSync(path, stdout);
  const page: Page = {
    hash,
    miniatureHash: "000",
    x: opts.x,
    y: opts.y,
    rotate: opts.rotate,
    original: {
      dpi: opts.dpi,
      width: info.width,
      height: info.height,
    },
  };
  return page;
}

export const pdf = async (book: Book) => {
  const start = Date.now();
  const pdf = new pdfkit({ autoFirstPage: false });
  const filename = electron.remote.dialog.showSaveDialogSync({
    defaultPath: `${book.title}.pdf`,
    filters: [{
      name: "PDF document",
      extensions: ["pdf", "PDF"]
    }],
  });
  if (filename) {
    pdf.pipe(createWriteStream(filename));
    for (let i = 0; i < book.pages.length; i++) {
      const page = book.pages[i];
      console.log(`generating ${i + 1} out of ${book.pages.length} pages...`);
      const buffer = await processPage(ProcessedPageOpts.from(book, page));
      pdf
        .addPage({
          margins: { left: 0, right: 0, top: 0, bottom: 0 },
          size: [book.width, book.height]
        })
        .image(buffer);
    }
    pdf.end();
    const elapsedTime = (Date.now() - start)/1000;
    console.log(`Done in ${elapsedTime}seconds`);
  }
};
