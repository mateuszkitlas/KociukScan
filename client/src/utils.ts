import { Book, Page } from '../../common/book';
import { Params } from "../../common/params";

export type Result<T> =
  | { success: true, result: T }
  | { success: false, result: Error }

export async function httpRequest<T>(body: Params): Promise<Result<T>> {
  try {
    const raw = await fetch("/server", {
      body: JSON.stringify(body),
      method: "POST",
    });
    const parsed = JSON.parse(await raw.text());
    return parsed.error
      ? { success: false, result: parsed.error }
      : { success: true, result: parsed };
  } catch(error) {
    return { success: false, result: error };
  }
}

export const createMiniature = (book: Book, page: Page) => {
  return httpRequest({ kind: "miniature", book, page });
}
