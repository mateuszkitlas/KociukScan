import { Book, Page } from './book';

export type Params =
  | { kind: "scan", book: Book }
  | { kind: "pdf", book: Book }
  | { kind: "miniature", book: Book, page: Page }
