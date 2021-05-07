import { PageNr, RawState } from './state';
import { Book, Color, DPI, Page } from './types';

export function last<T>(arr: T[]) {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

export const zoomByDpi = (dpi: DPI) => {
  switch (dpi) {
    case 75: return 1.33333;
    case 100: return 1;
    case 200: return 0.5;
    case 300: return 0.33333;
  }
}

export const dpiByWidth = (width: number) =>
  width <= 637
    ? 75
    : width <= 850
      ? 100
      : width <= 1700
        ? 200
        : 300

export interface ScanOpts {
  width: number;
  height: number;
  x: number;
  y: number;
  rotate: number;
  dpi: DPI;
  device?: string;
}
export namespace ScanOpts {
  export const from = (rs: RawState): ScanOpts => {
    const page = last(rs.book.pages);
    return {
      width: rs.book.width,
      height: rs.book.height,
      x: page?.x || 0,
      y: page?.y || 0,
      rotate: page?.rotate || 0,
      dpi: rs.book.dpi,
      device: rs.device
    };
  }
}

export interface ProcessedPageOpts {
  width: number;
  height: number;
  x: number;
  y: number;
  rotate: number;
  dpi: DPI;
  color: Color;
  pageNr: PageNr;
}
export module ProcessedPageOpts {
  export const from = (book: Book, page: Page): ProcessedPageOpts => ({
    width: book.width,
    height: book.height,
    x: page.x,
    y: page.y,
    rotate: page.rotate,
    dpi: page.original.dpi,
    color: Color.merge(page, book),
    pageNr: PageNr.get(page),
  });
  
}
