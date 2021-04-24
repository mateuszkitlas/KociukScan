import { activateHttpServer } from './httpServer';
import { spawnPromise } from './utils';
import { Params } from "../../common/params";
import { Page } from "../../common/book";
import * as sharp from "sharp";
import { join } from "path";
import * as md5 from "md5";
import { writeFileSync, createWriteStream, unlink } from 'fs';
import * as pdfkit from "pdfkit";
import { zoomByDpi, ProcessedPageOpts, toProcessedPageOpts } from "../../client/src/logic";

const tmpPath = (filename: string) => join(__dirname, "../../../../tmp", filename);
const imgPath = (hash: string) => tmpPath(`${hash}.png`);
const miniaturePath = (hash: string, miniatureHash: string) => imgPath(`${hash}-${miniatureHash}-miniature`);

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

const x = async (json: Params, _url: any) => {
  console.log(json);
  switch (json.kind) {
    case "scan":
      try {
        const { stdout } = await spawnPromise("scanimage", [
          "--mode",
          "Color",
          "--resolution",
          json.opts.dpi.toString(),
          "--format",
          "png"
        ]);
        const hash = md5(stdout);
        const path = imgPath(hash);
        writeFileSync(path, stdout);
        const { original, miniatureHash } = await createMiniature({ ...json.opts, hash });
        const page: Page = {
          hash,
          miniatureHash,
          x: json.opts.x,
          y: json.opts.y,
          rotate: json.opts.rotate,
          original,
        };
        return page;
      } catch(error) {
        return { error: error || "undefined error" };
      }
    case "miniature":
      const [{ miniatureHash }] = await Promise.all([
        createMiniature(json.opts),
        new Promise(resolve => unlink(miniaturePath(json.opts.hash, json.miniatureHash), resolve)),
      ]);
      return miniatureHash;
    case "pdf":
      try {
        const start = Date.now();
        const pdf = new pdfkit({ autoFirstPage: false });
        pdf.pipe(createWriteStream(tmpPath("pdf.pdf")));
        for (let i = 0; i < json.book.pages.length; i++) {
          const page = json.book.pages[i];
          console.log(`generating ${i + 1} out of ${json.book.pages.length} pages...`);
          const { buffer } = await processPage(toProcessedPageOpts(json.book, page));
          pdf
            .addPage({
              margins: { left: 0, right: 0, top: 0, bottom: 0 },
              size: [json.book.width, json.book.height]
            })
            .image(buffer);
        }
        pdf.end();
        const elapsedTime = (Date.now() - start)/1000;
        console.log(`Done in ${elapsedTime}seconds`);
        return { path: "tmp/pdf.pdf" };
      } catch(error) {
        return { error: error || "undefined error" };
      }
  }
};

activateHttpServer(5001, x);
