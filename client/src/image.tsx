import { Book, Page } from './types';
import { toProcessedPageOpts } from './logic';
import { createMiniaturePNG, createPNG } from './src/main';

export const imgSrcAsData = async (book: Book, page: Page, miniature: boolean) =>
'data:image/png;base64,' + (miniature
    ? await createMiniaturePNG(toProcessedPageOpts(book, page))
    : await createPNG(page.hash));
