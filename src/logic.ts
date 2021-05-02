import { RawState } from './state';
import { Book, Color, DPI, Page } from './types';

export function last<T>(arr: T[]) {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

export const zoomByDpi = (dpi: DPI) => {
  switch (dpi) {
    case 75: return 1.33;
    case 100: return 1;
    case 200: return 0.5;
    case 300: return 0.33333;
  }
}

export const marginX = (dpi: DPI) => {
  switch (dpi){
    case 300: return -850;
    case 200: return -425;
    case 100: return 0;
    case 75: return 105;
  }
}
export const marginY = (dpi: DPI) => {
  switch (dpi){
    case 300: return -1169;
    case 200: return -585;
    case 100: return 0;
    case 75: return 145;
  }
}

export interface ScanOpts {
  width: number;
  height: number;
  x: number;
  y: number;
  rotate: number;
  dpi: DPI;
  device?: string;
}

export interface ProcessedPageOpts {
  width: number;
  height: number;
  x: number;
  y: number;
  hash: string;
  rotate: number;
  dpi: DPI;
  color: Color;
}
export module ProcessedPageOpts {
  export const from = (book: Book, page: Page): ProcessedPageOpts => ({
    width: book.width,
    height: book.height,
    x: page.x,
    y: page.y,
    hash: page.hash,
    rotate: page.rotate,
    dpi: page.original.dpi,
    color: Color.merge(page, book)
  });
  export const fromLast = (rs: RawState): ScanOpts => {
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
