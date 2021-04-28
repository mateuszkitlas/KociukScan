export type DPI = 75 | 100 | 200 | 300;

export interface Book {
  pages: Page[];
  delay: number;
  width: number;
  height: number;
  dpi: DPI;
}

export interface Page {
  hash: string;
  duplicated?: string;
  x: number;
  y: number;
  rotate: number;
  original: {
    width: number;
    height: number;
    dpi: DPI;
  }
}
