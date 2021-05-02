import React from "react";
import { ProcessedPageOpts } from './logic';
import { miniaturePNG } from './scanner';
import { Book, Page } from './types';

export type PageNr = Pick<Page, "hash" | "duplicated">;
export namespace PageNr {
  export const get = ({ hash, duplicated }: Page) => ({ hash, duplicated });
  export const key = (p: Page) => { // TODO use in miniatures {}
    const v = get(p);
    return `${v.hash}-${v.duplicated}`;
  }
  export const eq =
    (pn?: PageNr) => (p: Page) => p.hash === pn?.hash && p.duplicated === pn?.duplicated;
}

interface Common {
  currentPage?: PageNr;
  book: Book;
  miniatures?: Map<string, string>;
  allowPageResize: boolean;
  device?: string;
}
export type RawState = Common & (
  | { kind: "scanning one" | "scanning many" | "nothing" }
  | {
    kind: "generating pdf";
    processedPages: number;
  }
)

export interface State {
  rs: RawState,
  isCurrentPage: (p: Page) => boolean,
  getRS: () => Promise<RawState>,
  setRS: (f: (rs: RawState) => RawState) => void,
  setBook: (book: Book) => void,
  deletePage: (page: PageNr) => void,
  getPage: (page?: PageNr) => Page | undefined,
  setPage: (page: Page) => void,
  initMiniatures: () => Promise<void>,
  createMiniature: (p: Page) => Promise<void>,
  refreshMiniatures: () => Promise<void>,
}

export const emptyRawState: RawState = {
  kind: "nothing",
  book: {
    delay: 5,
    pages: [],
    width: 400,
    height: 400,
    dpi: 100,
    color: {
      contrast: 1,
    }
  },
  allowPageResize: false,
};

const loadRSFromLS = () => loadRS(window.localStorage.getItem('book'));
export const loadRSFromBook = (book: Book) => ({ ...emptyRawState, book });
const loadRS = (bookRaw: string | null) =>
  bookRaw ? loadRSFromBook(JSON.parse(bookRaw)) : emptyRawState;

export const StateContext = React.createContext<State>({
  rs: loadRSFromLS(),
  isCurrentPage: () => false,
  getRS: async () => loadRSFromLS(),
  setRS: () => {},
  setBook: () => {},
  deletePage: () => {},
  getPage: () => undefined,
  setPage: () => {},
  initMiniatures: () => Promise.resolve(),
  createMiniature: () => Promise.resolve(),
  refreshMiniatures: () => Promise.resolve(),
});

export const StateProvider: React.FC = ({ children }) => {
  const reduce = (rs: RawState, f: (rs: RawState) => RawState) => {
    window.localStorage.setItem('book', JSON.stringify(rs.book));
    return f(rs);
  }
  const [rs, setRS] = React.useReducer(reduce, loadRSFromLS());
  const isCurrentPage = PageNr.eq(rs.currentPage);
  const getRS =
    () => new Promise<RawState>(resolve => setRS(rs => { resolve(rs); return rs }));
  const setBook =
    (book: Book) => setRS(rs => ({ ...rs, book }));
  const deletePage = (page: PageNr) =>
    setRS(rs => ({ ...rs, book: { ...rs.book, pages: rs.book.pages.filter(p => !PageNr.eq(page)(p)) } }));
  const getPage = (page?: PageNr) => rs.book.pages.find(PageNr.eq(page))
  const setPage = async (page: Page) => {
    setRS(rs => ({
      ...rs,
      book: {
        ...rs.book,
        pages: rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...p, ...page } : p)
      }
    }));
    await createMiniature(page);
  }
  const createMiniature = async (p: Page) => {
    const b64 = await miniaturePNG(ProcessedPageOpts.from(rs.book, p));
    setRS(rs => {
      const miniatures = rs.miniatures || new Map<string, string>();
      miniatures.set(JSON.stringify(PageNr.get(p)), b64);
      return ({ ...rs, miniatures })
    });
  }
  const refreshMiniatures = async () => { await Promise.all(rs.book.pages.map(createMiniature)) };
  const initMiniatures = async () => { !rs.miniatures && (await refreshMiniatures()) };

  const value = {
    rs, isCurrentPage, getRS, setRS, setBook, deletePage, getPage, setPage,
    initMiniatures, createMiniature, refreshMiniatures
  };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
