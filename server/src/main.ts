import { activateHttpServer } from './httpServer';
import { spawnPromise } from './utils';
import { Params } from "../../common/params";
import { Page } from "../../common/book";
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
const bufferSharp = async (s: sharp.Sharp) => sharp(await buffer(s))

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
          x: 0,
          y: 0,
          orientation: "left",
          rotate: 0,
          hash
        };
        return page;
      } catch(error) {
        return { error: error || "undefined error" };
      }
    case "pdf":
      try {
        const pdf = new pdfkit({ autoFirstPage: false });
        pdf.pipe(createWriteStream(tmpPath("pdf.pdf")));
        for (const page of json.book.pages) {
          const img = await bufferSharp(sharp(imgPath(page.hash)).rotate(page.rotate));
          const img2 = await bufferSharp(img.extend(500));
          const img3 = img2
            .extract({
              top: page.y + 500,
              left: page.x + 500,
              width: json.book.width,
              height: json.book.height,
            });
          const img4 = await buffer(img3);
          pdf.addPage({ margins: { left: 0, right: 0, top: 0, bottom: 0 } });
          pdf.image(img4);
        }
        pdf.end();
        return { path: "tmp/pdf.pdf" };
      } catch(error) {
        return { error: error || "undefined error" };
      }
  }
};

activateHttpServer(5001, x);
