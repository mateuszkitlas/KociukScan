import { activateHttpServer } from './httpServer';
//import { spawnPromise } from './utils';
import { Params } from "../../common/params";
import { File } from "../../common/book";

const x = async (json: Params, _url: any) => {
  console.log("siema", json);
  switch (json.kind) {
    case "scan":
      //await spawnPromise("echo", ["scanning"]);
      const file: File = {
        pages: [],
        path: "",
        hash: Math.random().toString()
      };
      return file;
  }
};

activateHttpServer(5000, x);
