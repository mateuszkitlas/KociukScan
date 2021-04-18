import * as rp from "request-promise-native";

export function httpRequest<T>(json: any): Promise<T> {
  return rp.post("", { json });
}
