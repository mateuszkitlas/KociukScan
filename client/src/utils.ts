import rp from "request-promise"
import { Params } from "../../common/params";

export async function httpRequest<T>(data: Params): Promise<T> {
  const x = await rp({
    method: "POST",
    body: data,
    url: "http://localhost:5000",
    json: true
  });
  console.log(x);
  return x as unknown as T;
}
