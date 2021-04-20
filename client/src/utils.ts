import { Params } from "../../common/params";

export type Result<T> =
  | { success: true, result: T }
  | { success: false, result: Error }

export async function httpRequest<T>(body: Params): Promise<Result<T>> {
  try {
    const xx = await fetch("http://localhost/server", {
      body: JSON.stringify(body),
      method: "POST",
    });
    const x = JSON.parse(await xx.text());
    return x.error ? { success: false, result: x.error } : { success: true, result: x };
  } catch(error) {
    return { success: false, result: error };
  }
}
