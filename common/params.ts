import { ProcessedPageOpts } from '../client/src/logic';
import { Book } from './book';

export type Params =
  | { kind: "scan", book: Book }
  | { kind: "pdf", book: Book }
  | { kind: "miniature", opts: ProcessedPageOpts, miniatureHash: string }
