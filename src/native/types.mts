import { PageNr } from "../native/state.mjs";

export interface Book {
  pages: Page[];
  delay: number;
  width: number;
  height: number;
  dpi: number;
  color: Color;
}

export interface Color {
  contrast: number;
}
export namespace Color {
  export const merge = (c1: Page, c2: Book): Color => ({
    contrast: (c1.properties?.color.contrast ?? 0) + c2.color.contrast,
  });
}

export interface Page {
  hash: string;
  duplicated?: string;
  properties?: Page.Properties;
  original: { width: number; height: number };
}

export namespace Page {
  const prevPrevProperties = (book: Book, page: Page) => {
    const nr = book.pages.findIndex(PageNr.eq(page));
    for (let pnr = nr - 2; 0 <= pnr; pnr -= 2) if (book.pages[pnr].properties) return book.pages[pnr].properties;
    return undefined;
  };
  export const defaultProperties: Properties = {
    x: 0,
    y: 0,
    rotate: 0,
    color: { contrast: 0 },
  };
  export const properties = (book: Book, page: Page): Page.Properties =>
    page.properties ?? prevPrevProperties(book, page) ?? Page.defaultProperties;
  export interface Properties {
    x: number;
    y: number;
    rotate: number;
    color: Color;
  }
}
