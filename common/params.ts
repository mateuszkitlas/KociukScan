import { Book } from './book';

export type Params = { kind: "scan" } | { kind: "pdf", book: Book }
