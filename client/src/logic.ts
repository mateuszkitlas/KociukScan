import { Page } from '../../common/book';

type DPI = Page["original"]["dpi"];

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
    case 300: return -850; // TODO
    case 200: return -425;
    case 100: return 0;
    case 75: return 105;
  }
}
export const marginY = (dpi: DPI) => {
  switch (dpi){
    case 300: return -1169; // TODO
    case 200: return -585;
    case 100: return 0;
    case 75: return 145;
  }
}
