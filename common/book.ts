export type DPI = 75 | 100 | 200 | 300;

export interface Book {
  title: string;
  pages: Page[];
  fspath: string;
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
  orientation: "left" | "right";
  original: {
    width: number;
    height: number;
    dpi: DPI;
  }
}
