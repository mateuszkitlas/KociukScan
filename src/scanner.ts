import { Page } from "./types";
import md5 from "md5";
import { writeFileSync, createWriteStream, readFileSync } from 'fs';
import { zoomByDpi, ProcessedPageOpts, ScanOpts } from "./logic";
import { Sharp, OutputInfo, sharp, pdfkit, dialog } from './electronImports';
import { scan } from 'scanner-to-buffer';
import { PageNr, State } from './state';
import { arrayBufferToBuffer, dispatch, hashToPng } from './utils';

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
const linear = (s: Sharp, contrast: number) => {
  const brightness = 1;
  return contrast === 1
    ? s
    : s.linear(brightness * contrast, brightness * (-(128 * contrast) + 128));
}
const background = { alpha: 0, r: 255, g: 255, b: 255 };

const processPage = async (opts: ProcessedPageOpts, withContrast: boolean): Promise<Buffer> => {
  const zoom = zoomByDpi(opts.dpi);
  const img = await toBuffer(sharp(hashToPng(opts.pageNr.hash)));
  
  /*const sharp1 = zoom === 1
    ? sharp(img.buffer)
    : sharp(img.buffer).resize(
      Math.floor(img.info.width*zoom),
      Math.floor(img.info.height*zoom)
    );*/
  const sharp11 = await toBuffer(sharp(img.buffer).rotate(opts.rotate, { background }));
  //const margin = 500;
  //const sharp2 = await reSharp(sharp11.extend({ background, top: margin, left: margin, right: margin, bottom: margin }));
  const img3 = sharp(sharp11.buffer)
    .extract({
      top: Math.floor(opts.y / zoom), // + margin,
      left: Math.floor(opts.x / zoom), // + margin,
      width: Math.floor(opts.width / zoom),
      height:Math.floor(opts.height / zoom),
    })
  if (withContrast) {
    return (await toBuffer(linear(img3, opts.color.contrast))).buffer
  } else {
    return (await toBuffer(img3)).buffer
  }
}

export const loadPNG = (hash: string) => {
  try {
    const buf = readFileSync(hashToPng(hash));
    return buf.toString("base64");
  } catch {
    return ""
  }
}

const miniaturePNGRaw = async (opts: ProcessedPageOpts) => {
  console.log("calling for miniature...")
  const s = sharp(await processPage(opts, false))
    .resize({
      width: 400,
      height: 400,
      fit: sharp.fit.contain,
      background
    });
  const buffer = await linear(s, opts.color.contrast).toFormat("png").toBuffer();
  return buffer.toString("base64")
}

export const miniaturePNG = (opts: ProcessedPageOpts) =>
  dispatch(() => miniaturePNGRaw(opts), PageNr.key(opts.pageNr), 1000);

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
      const zoom = zoomByDpi(page.original.dpi);
      console.log(`generating ${i + 1} out of ${book.pages.length} pages...`);
      const buffer = await processPage(ProcessedPageOpts.from(book, page), true);
      pdf
        .addPage({
          margins: { left: 0, right: 0, top: 0, bottom: 0 },
          size: [Math.floor(book.width / zoom), Math.floor(book.height / zoom)]
        })
        .image(buffer);
    }
    pdf.end();
  }
};
