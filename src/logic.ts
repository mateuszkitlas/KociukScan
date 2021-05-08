import { PageNr, RawState } from './state';
import { Book, Color, DPI, Page } from './types';

export const scaleByPage = (page: Page) =>
  zoomByDpi(dpiByWidth(page.original.width))

const zoomByDpi = (dpi: DPI) => {
  switch (dpi) {
    case 75: return 1.33333;
    case 100: return 1;
    case 200: return 0.5;
    case 300: return 0.33333;
  }
}

const dpiByWidth = (width: number) =>
  width <= 637
    ? 75
    : width <= 850
      ? 100
      : width <= 1700
        ? 200
        : 300

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
export module ProcessPage {
  export const from = (book: Book, page: Page): ProcessPage => ({
    width: book.width,
    height: book.height,
    pageNr: PageNr.get(page),
    pageProperties: {
      ...Page.properties(book, page),
      color: Color.merge(page, book),
    },
    scale: zoomByDpi(dpiByWidth(page.original.width)),
  });
  
}
