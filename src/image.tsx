import { Book, Page } from './types';
import { toProcessedPageOpts } from './logic';
import { createMiniaturePNG, createPNG } from './main';

export const imgSrcAsDataMiniature = async (book: Book, page: Page) =>
  'data:image/png;base64,' + (await createMiniaturePNG(toProcessedPageOpts(book, page)));

export const imgSrcAsData = (hash: string) => 'data:image/png;base64,' + createPNG(hash);