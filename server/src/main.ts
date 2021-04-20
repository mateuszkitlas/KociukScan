import { activateHttpServer } from './httpServer';
import { spawnPromise } from './utils';
import { Params } from "../../common/params";
import { Page } from "../../common/book";
//import * as sharp from "sharp";
import { join } from "path";
import * as md5 from "md5";
import { writeFileSync, createWriteStream } from 'fs';
import * as pdfkit from "pdfkit";

const tmpPath = (filename: string) => join(__dirname, "../../../../client/public/tmp", filename);

const x = async (json: Params, _url: any) => {
  console.log(json);
  switch (json.kind) {
    case "scan":
      try {
        const { stdout } = await spawnPromise("scanimage", ["--mode","Color","--resolution","50","--format","png"]);
        const hash = md5(stdout);
        const path = tmpPath(`${hash}.png`);
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
        const pdf = new pdfkit();
        pdf.pipe(createWriteStream(tmpPath("pdf.pdf")));
        return true;
        //json.book.files
        
        //pdf.image(
      } catch(error) {
        return { error: error || "undefined error" };
      }
  }
};

activateHttpServer(5000, x);
