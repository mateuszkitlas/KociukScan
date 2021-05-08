import { Page } from "./types";
import md5 from "md5";
import { writeFileSync, createWriteStream } from "fs";
import { ProcessPage, scaleByPage, ScanOpts } from "./logic";
import { Sharp, OutputInfo, sharp, pdfkit, dialog } from "./electronImports";
import { scan } from "scanner-to-buffer";
import { State } from "./state";
import { arrayBufferToBuffer, hashToPng } from "./utils";

const toBuffer = (s: Sharp) => new Promise<Buffer>((resolve, reject) =>
  s.toBuffer((err, buffer) => err ? reject(err) : resolve(buffer))
);
const toInfo = (buf: Buffer) => new Promise<OutputInfo>((resolve, reject) =>
  sharp(buf).toBuffer((err, _buf, info) => err ? reject(err) : resolve(info))
);
const background = { alpha: 0, r: 255, g: 255, b: 255 };

const processPage = async (opts: ProcessPage): Promise<Buffer> => {
  const rotatedBuffer = await toBuffer(sharp(hashToPng(opts.pageNr.hash)).rotate(opts.pageProperties.rotate, { background }));
  const brightness = 1;
  const contrast = opts.pageProperties.color.contrast;
  const img3 = sharp(rotatedBuffer)
    .extract({
      top: Math.floor(opts.pageProperties.y / opts.scale),
      left: Math.floor(opts.pageProperties.x / opts.scale),
      width: Math.floor(opts.width / opts.scale),
      height: Math.floor(opts.height / opts.scale),
    })
    .linear(brightness * contrast, brightness * (-(128 * contrast) + 128));
  return await toBuffer(img3);
};

const scanFromBuffer = async (buffer: Buffer) => {
  const hash = md5(buffer);
  const info = await toInfo(buffer);
  const path = hashToPng(hash);
  writeFileSync(path, buffer);
  const page: Page = {
    hash,
    original: {
      width: info.width,
      height: info.height,
    },
  };
  return page;
};

export const scanFromFile = async (buffer: ArrayBuffer) => scanFromBuffer(arrayBufferToBuffer(buffer));

export const scanX = async (opts: ScanOpts) => {
  const buffer = await scan({ dpi: opts.dpi, format: "png", device: opts.device });
  return () => scanFromBuffer(buffer);
};

export const pdf = async (s: State) => {
  const book = s.rs.book;
  const doContinue = async () => (await s.getRS()).kind === "generating pdf";
  const pdf = new pdfkit({ autoFirstPage: false });
  const filename = dialog.showSaveDialogSync({
    defaultPath: "Book.pdf",
    filters: [{
      name: "PDF document",
      extensions: ["pdf", "PDF"]
    }],
  });
  if (filename) {
    pdf.pipe(createWriteStream(filename));
    for (let i = 0; i < book.pages.length && await doContinue(); i++) {
      s.setRS(rs => ({ ...rs, kind: "generating pdf", processedPages: i }));
      const page = book.pages[i];
      const scale = scaleByPage(page);
      const buffer = await processPage(ProcessPage.from(book, page));
      pdf
        .addPage({
          margins: { left: 0, right: 0, top: 0, bottom: 0 },
          size: [Math.floor(book.width / scale), Math.floor(book.height / scale)]
        })
        .image(buffer);
    }
    pdf.end();
  }
};
