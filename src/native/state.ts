import { Book, Page } from "./types";

export type PageNr = Pick<Page, "hash" | "duplicated">;
export namespace PageNr {
  export const get = ({ hash, duplicated }: Page | PageNr) => ({
    hash,
    duplicated,
  });
  export const key = (p: Page | PageNr) => {
    // TODO use in miniatures {}
    const v = get(p);
    return `${v.hash}-${v.duplicated}`;
  };
  export const eq = (pn?: PageNr) => (p: Page | PageNr) => p.hash === pn?.hash && p.duplicated === pn?.duplicated;
}

export interface SettingsModal {
  kind: "settings";
  devices?: null | string[];
  modal?: { kind: "deleteProject" } | { kind: "importPages" };
}

interface Common {
  tmpPath: string;
  currentPage?: PageNr;
  book: Book;
  miniatures?: Map<string, string>;
  allowPageResize: boolean;
  device?: string;
  modal?:
    | SettingsModal
    | { kind: "deletePage"; pageNr: PageNr }
    | { kind: "errorScan"; message: string }
    | { kind: "reScanPage"; pageNr: PageNr };
}
export type RawState = Common &
  (
    | { kind: "scanning one" | "scanning many" | "nothing" }
    | {
        kind: "generating pdf";
        processedPages: number;
        startedAt: number;
      }
  );

export interface State {
  rs: RawState;
  isCurrentPage: (p: PageNr) => boolean;
  getRS: () => Promise<RawState>;
  setRS: (f: (rs: RawState) => RawState) => void;
  setBook: (book: Book) => void;
  deletePage: (page: PageNr) => void;
  getPage: (page?: PageNr) => Page | undefined;
  setPage: (page: Page) => void;
}
