import * as rp from "request-promise-native";
import { Params } from "../../common/params";

export function httpRequest<T>(json: Params): Promise<T> {
  return rp.post("http://localhost:5000", { json });
}
