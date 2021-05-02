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
    contrast: c1.color.contrast + c2.color.contrast,
  });
}

export interface Page {
  hash: string;
  duplicated?: string;
  x: number;
  y: number;
  rotate: number;
  color: Color;
  original: {
    width: number;
    height: number;
    dpi: DPI;
  }
}
