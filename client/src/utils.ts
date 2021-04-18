import rp from "request-promise"
import { Params } from "../../common/params";

export async function httpRequest<T>(body: Params): Promise<T> {
  const x = await rp({
    method: "POST",
    body,
    url: "http://localhost:5000",
    json: true,
    headers: {'Access-Control-Allow-Origin': '*'}
  });
  return x;
}
