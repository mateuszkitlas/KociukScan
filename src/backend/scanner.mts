import { Book, Page } from "../native/types.mjs";
import { createWriteStream } from "fs";
import { ProcessPage, scaleByPage } from "../native/logic.mjs";
import { genBroadcast, idToPng } from "../native/utils.mjs";
import { promises as fs } from "fs";
import sharp, { OutputInfo, Sharp } from "sharp";
import pdfkit from "pdfkit";
import { dialog, webContents } from "electron";
import { RendererEndpoints } from "../frontend/endpoints.js";
import { join } from "path";
import open from "open";

export const broadcast = genBroadcast<RendererEndpoints>((...args) =>
  webContents.getAllWebContents().forEach(wc => wc.send(...args)),
);

const toBuffer = (s: Sharp) =>
  new Promise<Buffer>((resolve, reject) => s.toBuffer((err, buffer) => (err ? reject(err) : resolve(buffer))));
const toInfo = (buf: Buffer) =>
  new Promise<OutputInfo>((resolve, reject) =>
    sharp(buf).toBuffer((err, _buf, info) => (err ? reject(err) : resolve(info))),
  );
const background = { alpha: 0, r: 255, g: 255, b: 255 };

const processPage = async (tmpPath: string, opts: ProcessPage): Promise<Buffer> => {
  const rotatedBuffer = await toBuffer(sharp(idToPng(tmpPath, opts.id)).rotate(opts.props.rotate, { background }));
  const brightness = 1;
  const contrast = opts.props.color.contrast;
  const img3 = sharp(rotatedBuffer)
    .extract({
      top: Math.floor(opts.props.y / opts.scale),
      left: Math.floor(opts.props.x / opts.scale),
      width: Math.floor(opts.width / opts.scale),
      height: Math.floor(opts.height / opts.scale),
    })
    .linear(brightness * contrast, brightness * (-(128 * contrast) + 128));
  return await toBuffer(img3);
};

export const scanFromBuffer = async (tmpPath: string, id: number, buffer: Buffer) => {
  const info = await toInfo(buffer);
  const path = idToPng(tmpPath, id);
  await fs.writeFile(path, buffer);
  const page: Page = {
    id,
    original: {
      width: info.width,
      height: info.height,
    },
  };
  return page;
};

export const pdf = async (props: { tmpPath: string; book: Book; abort: () => boolean }) => {
  const pdf = new pdfkit({ autoFirstPage: false, font: join(props.tmpPath, "..", "blank.ttf") });
  const filePath = dialog.showSaveDialogSync({
    defaultPath: "Book.pdf",
    filters: [
      {
        name: "PDF document",
        extensions: ["pdf", "PDF"],
      },
    ],
  });
  if (filePath) {
    pdf.pipe(createWriteStream(filePath));
    for (let i = 0; i < props.book.pages.length && !props.abort(); i++) {
      broadcast("genPdfProgress", i);
      const page = props.book.pages[i];
      const scale = scaleByPage(page);
      const buffer = await processPage(props.tmpPath, ProcessPage.from(props.book, i));
      pdf
        .addPage({
          margins: { left: 0, right: 0, top: 0, bottom: 0 },
          size: [Math.floor(props.book.width / scale), Math.floor(props.book.height / scale)],
        })
        .image(buffer);
    }
    pdf.end();
    open(filePath);
  }
};
