import React from "react";
import { Book, Page } from "./types";
import { randomMd5 } from "./utils";

export type PageNr = Pick<Page, "hash" | "duplicated">;
export namespace PageNr {
  export const get = ({ hash, duplicated }: Page | PageNr) => ({ hash, duplicated });
  export const key = (p: Page | PageNr) => { // TODO use in miniatures {}
    const v = get(p);
    return `${v.hash}-${v.duplicated}`;
  };
  export const eq =
    (pn?: PageNr) => (p: Page | PageNr) => p.hash === pn?.hash && p.duplicated === pn?.duplicated;
}

interface Common {
  currentPage?: PageNr;
  book: Book;
  miniatures?: Map<string, string>;
  allowPageResize: boolean;
  device?: string;
  modals: { node: React.ReactNode; hash: string }[];
  zoom: number;
}
export type RawState = Common & (
  | { kind: "scanning one" | "scanning many" | "nothing" }
  | {
    kind: "generating pdf";
    processedPages: number;
    startedAt: number;
  }
)

export interface State {
  rs: RawState,
  isCurrentPage: (p: PageNr) => boolean,
  getRS: () => Promise<RawState>,
  setRS: (f: (rs: RawState) => RawState) => void,
  setBook: (book: Book) => void,
  deletePage: (page: PageNr) => void,
  getPage: (page?: PageNr) => Page | undefined,
  setPage: (page: Page) => void,
  addModal: (f: (key: string, dispose: () => void) => React.ReactNode) => void,
}

export const emptyRawState: RawState = {
  kind: "nothing",
  book: {
    delay: 5,
    pages: [],
    width: 400,
    height: 400,
    dpi: 150,
    color: {
      contrast: 1,
    }
  },
  allowPageResize: false,
  modals: [],
  zoom: 1,
};

const loadRSFromLS = () => loadRS(window.localStorage.getItem("book"));
export const loadRSFromBook = (book: Book) => ({ ...emptyRawState, book });
const loadRS = (bookRaw: string | null) =>
  bookRaw ? loadRSFromBook(JSON.parse(bookRaw)) : emptyRawState;

export const StateContext = React.createContext<State>({
  rs: loadRSFromLS(),
  isCurrentPage: () => false,
  getRS: async () => loadRSFromLS(),
  setRS: () => undefined,
  setBook: () => undefined,
  deletePage: () => undefined,
  getPage: () => undefined,
  setPage: () => undefined,
  addModal: () => undefined,
});

export const StateProvider: React.FC = ({ children }: { children?: React.ReactNode }) => {
  const reduce = (rs: RawState, f: (rs: RawState) => RawState) => {
    window.localStorage.setItem("book", JSON.stringify(rs.book));
    return f(rs);
  };
  const [rs, setRS] = React.useReducer(reduce, loadRSFromLS());
  const isCurrentPage = PageNr.eq(rs.currentPage);
  const getRS =
    () => new Promise<RawState>(resolve => setRS(rs => { resolve(rs); return rs; }));
  const setBook =
    (book: Book) => setRS(rs => ({ ...rs, book }));
  const deletePage = (page: PageNr) =>
    setRS(rs => ({ ...rs, book: { ...rs.book, pages: rs.book.pages.filter(p => !PageNr.eq(page)(p)) } }));
  const getPage = (page?: PageNr) => rs.book.pages.find(PageNr.eq(page));
  const setPage = async (page: Page) => {
    setRS(rs => ({
      ...rs,
      book: {
        ...rs.book,
        pages: rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...p, ...page } : p)
      }
    }));
  };
  
  const addModal = (f: (key: string, dispose: () => void) => React.ReactNode) => {
    const hash = randomMd5();
    const dispose = () =>
      setRS(rs => ({ ...rs, modals: rs.modals.filter(m => m.hash !== hash) }));
    const node = f(hash, dispose);
    setRS(rs => ({ ...rs, modals: [...rs.modals, { hash, node }] }));
    return ;
  };

  const value = {
    rs, isCurrentPage, getRS, setRS, setBook, deletePage, getPage, setPage,
    addModal
  };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
};
