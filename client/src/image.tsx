import { Page } from './types';

export const imgPath = (p: Page, miniature: boolean) =>
  miniature
    ? `/tmp/${p.hash}-${p.miniatureHash}-miniature.png`
    : `/tmp/${p.hash}.png`;
