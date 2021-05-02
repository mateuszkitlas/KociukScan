import { Page } from "./types";
import md5 from "md5";
import { writeFileSync, createWriteStream, readFileSync } from 'fs';
import { zoomByDpi, ProcessedPageOpts, ScanOpts } from "./logic";
import { Sharp, OutputInfo, sharp, pdfkit, dialog } from './electronImports';
import { scan } from 'scanner-to-buffer';
import { State } from './state';
import { arrayBufferToBuffer, hashToPng } from './utils';

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
  const img = await toBuffer(sharp(hashToPng(opts.hash)));
  
  const sharp1 = zoom === 1
    ? sharp(img.buffer)
    : sharp(img.buffer).resize(
      Math.floor(img.info.width*zoom),
      Math.floor(img.info.height*zoom)
    );
  const sharp11 = sharp1.rotate(opts.rotate);
  const margin = 500;
  const sharp2 = await reSharp(sharp11.extend((margin)));
  const { contrast } = opts.color
  const brightness = 1;
  const img3 = sharp2
    .extract({
      top: opts.y + margin,
      left: opts.x + margin,
      width: opts.width,
      height: opts.height,
    })
    .linear(brightness * contrast, brightness * (-(128 * contrast) + 128))
    
  return (await toBuffer(img3)).buffer
}

export const loadPNG = (hash: string) => {
  try {
    const buf = readFileSync(hashToPng(hash));
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

const scanFromBuffer = async (buffer: Buffer, opts: ScanOpts) => {
  const hash = md5(buffer);
  const info = await getInfo(buffer);
  const path = hashToPng(hash);
  writeFileSync(path, buffer);
  const page: Page = {
    hash,
    x: opts.x,
    y: opts.y,
    rotate: opts.rotate,
    original: {
      dpi: opts.dpi,
      width: info.width,
      height: info.height,
    },
    color: {
      contrast: 0,
    }
  };
  return page;
}

export const scanFromFile = async (buffer: ArrayBuffer, opts: Omit<ProcessedPageOpts, "hash" | "dpi">) =>
  scanFromBuffer(
    arrayBufferToBuffer(buffer),
    { ...opts, dpi: 300 }
  );

export const scanX = async (opts: ScanOpts) =>
  scanFromBuffer(await scan({ dpi: opts.dpi, format: "png", device: opts.device }), opts);

export const pdf = async (s: State) => {
  const book = s.rs.book;
  const doContinue = async () => (await s.getRS()).kind === "generating pdf";
  const pdf = new pdfkit({ autoFirstPage: false });
  const filename = dialog.showSaveDialogSync({
    defaultPath: `Book.pdf`,
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
