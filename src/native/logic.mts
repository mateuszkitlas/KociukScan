import { PageNr } from "./state.mjs";
import { Book, Color, Page } from "./types.mjs";

export const scaleByPage = (page: Page) => 850 / page.original.width;

export interface ProcessPage {
  width: number;
  height: number;
  pageProperties: Page.Properties;
  pageNr: PageNr;
  scale: number;
}
export namespace ProcessPage {
  export const from = (book: Book, page: Page): ProcessPage => ({
    width: book.width,
    height: book.height,
    pageNr: PageNr.get(page),
    pageProperties: {
      ...Page.properties(book, page),
      color: Color.merge(page, book),
    },
    scale: scaleByPage(page),
  });
}
