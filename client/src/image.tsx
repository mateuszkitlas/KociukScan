import { Page } from '../../common/book';

export const imgPath = (p: Page, miniature: boolean) =>
  miniature
    ? `/tmp/${p.hash}-${p.miniatureHash}-miniature.png`
    : `/tmp/${p.hash}.png`;
