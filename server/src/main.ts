import { activateHttpServer } from './httpServer';
import { spawnPromise } from './utils';
import { Params } from "../../common/params";
import { File } from "../../common/book";
//import * as sharp from "sharp";
import { join } from "path";
import * as md5 from "md5";
import { writeFileSync } from 'fs';

const x = async (json: Params, _url: any) => {
  console.log(json);
  switch (json.kind) {
    case "scan":
      try {
        const { stdout } = await spawnPromise("scanimage", ["--mode","Color","--resolution","50","--format","png"]);
        const hash = md5(stdout);
        const path = join(__dirname, "../../../../client/public/tmp", `${hash}.png`);
        writeFileSync(path, stdout);
        //sharp(stdout).toFile(path);
        const file: File = {
          pages: [{ nr: 0, crop: {start: {x: 0, y: 0}}, orientation: "left", rotate: 0 }],
          path,
          hash
        };
        return file;
      } catch(error) {
        return { error: error || "undefined error" };
      }
  }
};

activateHttpServer(5000, x);
