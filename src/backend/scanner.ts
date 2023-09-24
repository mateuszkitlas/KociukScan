import { Page } from "../native/types";
import md5 from "md5";
import { createWriteStream } from "fs";
import { ProcessPage, scaleByPage } from "../native/logic";
//import { Sharp, OutputInfo, sharp, pdfkit, dialog } from "../electronImports";
import * as ScannerToBuffer from "scanner-to-buffer";
import { State } from "../native/state";
import { arrayBufferToBuffer } from "../native/utils";
import { assertNotFalsy } from "../native/utils";
import { promises as fs } from "fs"
import sharp, { OutputInfo, Sharp } from "sharp";
import pdfkit from "pdfkit"
import electron from "electron"
import { hashToPng } from "../frontend/utils";

const toBuffer = (s: Sharp) => new Promise<Buffer>((resolve, reject) =>
  s.toBuffer((err, buffer) => err ? reject(err) : resolve(buffer))
);
const toInfo = (buf: Buffer) => new Promise<OutputInfo>((resolve, reject) =>
  sharp(buf).toBuffer((err, _buf, info) => err ? reject(err) : resolve(info))
);
const background = { alpha: 0, r: 255, g: 255, b: 255 };

const processPage = async (tmpPath: string, opts: ProcessPage): Promise<Buffer> => {
  const rotatedBuffer = await toBuffer(sharp(hashToPng(tmpPath, opts.pageNr.hash)).rotate(opts.pageProperties.rotate, { background }));
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

export const scanFromBuffer = async (tmpPath: string, hash: string, buffer: Buffer) => {
  const info = await toInfo(buffer);
  const path = hashToPng(tmpPath, hash);
  await fs.writeFile(path, buffer);
  const page: Page = {
    hash,
    original: {
      width: info.width,
      height: info.height,
    },
  };
  return page;
};

export const scanFromFile = (tmpPath: string) => async (arrayBuffer: ArrayBuffer) => {
  const buffer = arrayBufferToBuffer(arrayBuffer)
  return scanFromBuffer(tmpPath, md5(buffer), buffer);
}

export const pdf = async (s: State) => {
  const { tmpPath, book } = s.rs;
  assertNotFalsy(tmpPath, "tmpPath");
  const doContinue = async () => (await s.getRS()).kind === "generating pdf";
  const pdf = new pdfkit({ autoFirstPage: false });
  const filename = electron.dialog.showSaveDialogSync({
    defaultPath: "Book.pdf",
    filters: [{
      name: "PDF document",
      extensions: ["pdf", "PDF"]
    }],
  });
  if (filename) {
    const startedAt = Date.now();
    s.setRS(rs => ({ ...rs, kind: "generating pdf", processedPages: 0, startedAt }));
    pdf.pipe(createWriteStream(filename));
    for (let i = 0; i < book.pages.length && await doContinue(); i++) {
      s.setRS(rs => ({ ...rs, kind: "generating pdf", processedPages: i, startedAt }));
      const page = book.pages[i];
      const scale = scaleByPage(page);
      const buffer = await processPage(tmpPath, ProcessPage.from(book, page));
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
