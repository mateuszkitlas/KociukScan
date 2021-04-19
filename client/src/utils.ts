import rp from "request-promise"
import { Params } from "../../common/params";

export type Result<T> =
  | { success: true, result: T }
  | { success: false, result: Error }

export async function httpRequest<T>(body: Params): Promise<Result<T>> {
  try {
    const x = await rp({
      method: "POST",
      body,
      url: "http://localhost:5000",
      json: true,
      headers: {'Access-Control-Allow-Origin': '*'}
    });
    return x.error ? { success: false, result: x.error } : { success: true, result: x };
  } catch(error) {
    return { success: false, result: error };
  }
}
