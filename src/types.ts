import { oneBeforeLast } from './logic';

export type DPI = 75 | 100 | 200 | 300;

export interface Book {
  pages: Page[];
  delay: number;
  width: number;
  height: number;
  dpi: DPI;
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
  original: {
    width: number;
    height: number;
    dpi: DPI;
  };
}

export namespace Page {
  export const defaultProperties: Properties = { x: 0, y: 0, rotate: 0, color: { contrast: 0 } };
  export const properties = (book: Book, page: Page): Page.Properties =>
    page.properties ?? oneBeforeLast(book.pages)?.properties ?? Page.defaultProperties;
  export interface Properties {
    x: number;
    y: number;
    rotate: number;
    color: Color;
  };
}
