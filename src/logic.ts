import { PageNr, RawState } from "./state";
import { Book, Color, DPI, Page } from "./types";

export const scaleByPage = (page: Page) => 850 / page.original.width;

export interface ScanOpts {
  dpi: DPI;
  device?: string;
}
export namespace ScanOpts {
  export const from = (rs: RawState): ScanOpts => ({ dpi: rs.book.dpi, device: rs.device });
}

export interface ProcessPage {
  width: number;
  height: number;
  pageProperties: Page.Properties;
  pageNr: PageNr;
  scale: number
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
