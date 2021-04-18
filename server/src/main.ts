import { activateHttpServer } from './httpServer';
import { spawnPromise } from './utils';
import { Params } from "../../common/params";

const x = (json: Params, _url: any) => {
  switch (json.kind) {
    case "scan":
      spawnPromise("echo", ["scanning..."]);
      return true;
  }
};

activateHttpServer(5000, x);
