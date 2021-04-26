import { Book, Page } from './types';
import { ProcessedPageOpts } from './logic';
import { createMiniaturePNG, createPNG } from './scanner';

export const imgSrcAsDataMiniature = async (book: Book, page: Page) =>
  'data:image/png;base64,' + (await createMiniaturePNG(ProcessedPageOpts.from(book, page)));

export const imgSrcAsData = (hash: string) => 'data:image/png;base64,' + createPNG(hash);