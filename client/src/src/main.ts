import { spawnPromise } from './utils';
import { Book, Page } from "../types";
import type { Sharp, OutputInfo, SharpOptions, FitEnum } from "sharp";
import { join } from "path";
import md5 from "md5";
import { writeFileSync, createWriteStream, unlink } from 'fs';
//import type { } from "pdfkit";
import { zoomByDpi, ProcessedPageOpts, toProcessedPageOpts } from "../logic";

const sharp: {
  (buf: Buffer | string, o?: SharpOptions): Sharp,
  fit: FitEnum
} = window.require("sharp");
const pdfkit = window.require("pdfkit");

console.log(__dirname);
const tmpPath = (filename: string) => join(__dirname, "/home/mati/projects/scan/tmp", filename);
const imgPath = (hash: string) => tmpPath(`${hash}.png`);
const miniaturePath = (hash: string, miniatureHash: string) => imgPath(`${hash}-${miniatureHash}-miniature`);

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

interface ProcessedPage {
  original: Page["original"];
  buffer: Buffer;
}

const processPage = async (opts: ProcessedPageOpts): Promise<ProcessedPage> => {
  const zoom = zoomByDpi(opts.dpi);
  const img = await toBuffer(sharp(imgPath(opts.hash)));
  const original = img.info;
  
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
  return {
    buffer: (await toBuffer(img3)).buffer,
    original: {
      width: original.width,
      height: original.height,
      dpi: opts.dpi,
    }
  };
}

const createMiniature = async (opts: ProcessedPageOpts) => {
  const img = await processPage(opts)
  const { buffer } = await toBuffer(sharp(img.buffer)
    .resize({
      width: 100,
      height: 100,
      fit: sharp.fit.contain,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
  )
  const miniatureHash = md5(buffer);
  sharp(buffer).toFile(miniaturePath(opts.hash, miniatureHash));
  return { original: img.original, miniatureHash };
}

export const scan = async (opts: Omit<ProcessedPageOpts, "hash">) => {
  console.log("scanning...");
  const { stdout } = await spawnPromise("scanimage", [
    "--mode",
    "Color",
    "--resolution",
    opts.dpi.toString(),
    "--format",
    "png"
  ]);
  const hash = md5(stdout);
  const path = imgPath(hash);
  writeFileSync(path, stdout);
  const { original, miniatureHash } = await createMiniature({ ...opts, hash });
  const page: Page = {
    hash,
    miniatureHash,
    x: opts.x,
    y: opts.y,
    rotate: opts.rotate,
    original,
  };
  return page;
}

export const miniature = async (opts: ProcessedPageOpts, oldMiniatureHash: string) => {
  const [{ miniatureHash }] = await Promise.all([
    createMiniature(opts),
    new Promise(resolve => unlink(miniaturePath(opts.hash, oldMiniatureHash), resolve)),
  ]);
  return miniatureHash;
}

export const pdf = async (book: Book) => {
  const start = Date.now();
  const pdf = new pdfkit({ autoFirstPage: false });
  pdf.pipe(createWriteStream(tmpPath("pdf.pdf")));
  for (let i = 0; i < book.pages.length; i++) {
    const page = book.pages[i];
    console.log(`generating ${i + 1} out of ${book.pages.length} pages...`);
    const { buffer } = await processPage(toProcessedPageOpts(book, page));
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
  return { path: "tmp/pdf.pdf" };
};
