import { ProcessedPageOpts } from '../client/src/logic';
import { Book } from './book';

export type Params =
  | { kind: "scan", opts: Omit<ProcessedPageOpts, "hash"> }
  | { kind: "pdf", book: Book }
  | { kind: "miniature", opts: ProcessedPageOpts, miniatureHash: string }
