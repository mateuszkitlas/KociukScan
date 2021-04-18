import { activateHttpServer } from './httpServer';
import { spawnPromise } from './utils';
import { Params } from "../../common/params";

const x = async (json: Params, _url: any) => {
  console.log("siema", json);
  switch (json.kind) {
    case "scan":
      await spawnPromise("echo", ["scanning..."]);
      return true;
  }
};

activateHttpServer(5000, x);
