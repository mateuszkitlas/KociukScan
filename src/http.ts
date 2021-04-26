import { Book, Page } from './types';
import { toProcessedPageOpts } from './logic';
import * as X from "./main";

export const createMiniature = (book: Book, page: Page) =>
  X.miniature(toProcessedPageOpts(book, page), page.miniatureHash);
