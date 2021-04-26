export type DPI = 75 | 100 | 200 | 300;

export interface Book {
  title: string;
  pages: Page[];
  delay: number;
  width: number;
  height: number;
  dpi: DPI;
}

export interface Page {
  hash: string;
  miniatureHash: string;
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
