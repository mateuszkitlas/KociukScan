import { activateHttpServer } from './httpServer';
import { spawnPromise } from './utils';
import { Params } from "../../common/params";
import { Book, Page } from "../../common/book";
import * as sharp from "sharp";
import { join } from "path";
import * as md5 from "md5";
import { writeFileSync, createWriteStream } from 'fs';
import * as pdfkit from "pdfkit";
import { zoomByDpi } from "../../client/src/logic";

const tmpPath = (filename: string) => join(__dirname, "../../../../tmp", filename);
const imgPath = (hash: string) => tmpPath(`${hash}.png`);
const toBuffer = (s: sharp.Sharp) =>
  new Promise<{ buffer: Buffer, info: sharp.OutputInfo}>(
    (resolve, reject) => s.toBuffer((err, buffer, info) => {
      if (err) {
        reject(err);
      } else {
        resolve({ buffer, info });
      }
    }
  )
);
const reSharp = async (s: sharp.Sharp) => sharp((await toBuffer(s)).buffer);
const last = <T>(arr: T[]) => arr.length > 0 ? arr[arr.length - 1] : undefined;

interface ProcessedPage {
  original: Page["original"],
  buffer: Buffer
}


const processPage = async (
  book: Book,
  page: Pick<Page, "x" | "y" | "hash" | "rotate">,
  dpi: Page["original"]["dpi"],
): Promise<ProcessedPage> => {
  const zoom = zoomByDpi(dpi);
  const img = await toBuffer(sharp(imgPath(page.hash)));
  const original = img.info;
  
  const sharp1 = zoom === 1
    ? sharp(img.buffer)
    : sharp(img.buffer).resize(
      Math.floor(img.info.width*zoom),
      Math.floor(img.info.height*zoom)
    );
  const sharp11 = sharp1.rotate(page.rotate);
  const margin = 500;
  const sharp2 = await reSharp(sharp11.extend((margin)));
  const img3 = sharp2
    .extract({
      top: page.y + margin,
      left: page.x + margin,
      width: book.width,
      height: book.height,
    });
  return {
    buffer: (await toBuffer(img3)).buffer,
    original: {
      width: original.width,
      height: original.height,
      dpi,
    }
  };
}

const createMiniature = async (
  book: Book,
  page: Pick<Page, "x" | "y" | "hash" | "rotate">,
  dpi: Page["original"]["dpi"],
) => {
  const img = await processPage(book, page, dpi)
  await sharp(img.buffer).resize({
    width: 100,
    height: 100,
    fit: sharp.fit.contain,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }).toFile(tmpPath(`${page.hash}-miniature.png`));
  return img.original;
}

const x = async (json: Params, _url: any) => {
  console.log(json);
  switch (json.kind) {
    case "scan":
      try {
        const { stdout } = await spawnPromise("scanimage", [
          "--mode",
          "Color",
          "--resolution",
          json.book.dpi.toString(),
          "--format",
          "png"
        ]);
        const hash = md5(stdout);
        const path = imgPath(hash);
        writeFileSync(path, stdout);
        const page = {
          ...(last(json.book.pages) || {
            x: 0,
            y: 0,
            orientation: "left",
            rotate: 0,
            zoom: 1,
          }),
          hash,
        };
        const original = await createMiniature(json.book, page, json.book.dpi);
        return { ...page, original };
      } catch(error) {
        return { error: error || "undefined error" };
      }
    case "miniature":
      return await createMiniature(json.book, json.page, json.page.original.dpi);
    case "pdf":
      try {
        const pdf = new pdfkit({ autoFirstPage: false });
        pdf.pipe(createWriteStream(tmpPath("pdf.pdf")));
        for (const page of json.book.pages) {
          pdf
            .addPage({
              margins: { left: 0, right: 0, top: 0, bottom: 0 },
              size: [json.book.width, json.book.height]
            })
            .image((await processPage(json.book, page, page.original.dpi)).buffer);
        }
        pdf.end();
        return { path: "tmp/pdf.pdf" };
      } catch(error) {
        return { error: error || "undefined error" };
      }
  }
};

activateHttpServer(5001, x);
