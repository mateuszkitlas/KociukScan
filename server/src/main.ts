import { activateHttpServer } from './httpServer';
import { spawnPromise } from './utils';
import { Params } from "../../common/params";
import { Book, Page } from "../../common/book";
import * as sharp from "sharp";
import { join } from "path";
import * as md5 from "md5";
import { writeFileSync, createWriteStream } from 'fs';
import * as pdfkit from "pdfkit";

const tmpPath = (filename: string) => join(__dirname, "../../../../tmp", filename);
const imgPath = (hash: string) => tmpPath(`${hash}.png`);
const buffer = (s: sharp.Sharp) => new Promise<Buffer>((resolve, reject) => s.toBuffer((err, buf, _info) => {
  if (err) {
    reject(err);
  } else {
    // console.log("sharp info", info);
    resolve(buf);
  }
}));
const bufferSharp = async (s: sharp.Sharp) => sharp(await buffer(s));
const last = <T>(arr: T[]) => arr.length > 0 ? arr[arr.length - 1] : undefined;


const processPage = async (book: Book, page: Page) => {
  const img = await bufferSharp(sharp(imgPath(page.hash)).rotate(page.rotate));
  //const meta = await img.metadata();
  const margin = 500; //Math.max(meta.width!, meta.width!)/2;
  const img2 = await bufferSharp(img.extend((margin)));
  const img3 = img2
    .extract({
      top: page.y + margin,
      left: page.x + margin,
      width: book.width,
      height: book.height,
    });
  return buffer(img3);
}

const createMiniature = async (book: Book, page: Page) => {
  const img = await processPage(book, page)
  await sharp(img).resize({
    width: 100,
    height: 100,
    fit: sharp.fit.contain,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }).toFile(tmpPath(`${page.hash}-miniature.png`));
}

const x = async (json: Params, _url: any) => {
  console.log(json);
  switch (json.kind) {
    case "scan":
      try {
        const { stdout } = await spawnPromise("scanimage", ["--mode","Color","--resolution","50","--format","png"]);
        const hash = md5(stdout);
        const path = imgPath(hash);
        writeFileSync(path, stdout);
        const page: Page = {
          ...(last(json.book.pages) || {
            x: 0,
            y: 0,
            orientation: "left",
            rotate: 0,
          }),
          hash,
        };
        await createMiniature(json.book, page);
        return page;
      } catch(error) {
        return { error: error || "undefined error" };
      }
    case "miniature":
      return await createMiniature(json.book, json.page);
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
            .image(await processPage(json.book, page));
        }
        pdf.end();
        return { path: "tmp/pdf.pdf" };
      } catch(error) {
        return { error: error || "undefined error" };
      }
  }
};

activateHttpServer(5001, x);
