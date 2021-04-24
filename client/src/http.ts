import { Book, Page } from '../../common/book';
import { Params } from "../../common/params";
import { toProcessedPageOpts } from './logic';

export type Result<T> =
  | { success: true, result: T }
  | { success: false, result: Error }

export async function httpRequest<T>(body: Params): Promise<Result<T>> {
  const raw = await fetch("/server", {
    body: JSON.stringify(body),
    method: "POST",
    headers: {
      "Connection": "Keep-Alive",
      "Origin": "localhost",
      "Content-Type": "application/json",
    },
  }).catch(x => x);
  try {
    const parsed = JSON.parse(await raw.text());
    return parsed.error
      ? { success: false, result: parsed.error }
      : { success: true, result: parsed };
  } catch(error) {
    return { success: false, result: { ...error, message: error.message, raw } };
  }
}

export const createMiniature = (book: Book, page: Page) => {
  return httpRequest<string>({
    kind: "miniature",
    opts: toProcessedPageOpts(book, page),
    miniatureHash: page.miniatureHash
  });
}
