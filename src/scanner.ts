import { Book, Page } from "./types";
import { join } from "path";
import md5 from "md5";
import { writeFileSync, createWriteStream, readFileSync, existsSync, mkdirSync } from 'fs';
import { zoomByDpi, ProcessedPageOpts } from "./logic";
import { electron, Sharp, OutputInfo, sharp, pdfkit } from './electronImports';
import { scan } from 'scanner-to-buffer';
import { State } from './state';
import { arrayBufferToBuffer } from './utils';

const rootPath = electron.remote.process?.cwd();
export const tmpRawPath = join(rootPath, "tmp");
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
      width: 400,
      height: 400,
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

const scanFromBuffer = async (buffer: Buffer, opts: Omit<ProcessedPageOpts, "hash">) => {
  const hash = md5(buffer);
  const info = await getInfo(buffer);
  const path = imgPath(hash);
  writeFileSync(path, buffer);
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

export const scanFromFile = async (buffer: ArrayBuffer, opts: Omit<ProcessedPageOpts, "hash" | "dpi">) =>
  scanFromBuffer(
    arrayBufferToBuffer(buffer),
    { ...opts, dpi: 300 }
  );

export const scanX = async (opts: Omit<ProcessedPageOpts, "hash">) =>
  scanFromBuffer(await scan({ dpi: opts.dpi, format: "png" }), opts);

export const pdf = async (s: State) => {
  const book = s.rs.book;
  const doContinue = async () => (await s.getRS()).kind === "generating pdf";
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
    for (let i = 0; i < book.pages.length && await doContinue(); i++) {
      s.setRS(rs => ({ ...rs, kind: "generating pdf", processedPages: i }))
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
  }
};
