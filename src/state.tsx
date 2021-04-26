import React from "react";
import { ProcessedPageOpts } from './logic';
import { createMiniaturePNG } from './scanner';
import { Book, Page } from './types';

type PageNr = Pick<Page, "hash" | "duplicated">;

export interface RawState {
  kind: "scanning one" | "scanning many" | "nothing" | "generating pdf";
  currentPage?: PageNr;
  book: Book;
  miniatures: Record<string, string>
}

export interface State {
  rs: RawState,
  isCurrentPage: (p: Page) => boolean,
  getRS: () => Promise<RawState>,
  setRS: (f: (rs: RawState) => RawState) => void,
  setBook: (book: Book) => void,
  addPage: (page: Page) => void,
  deletePage: (page: PageNr) => void,
  getPage: (page?: PageNr) => Page | undefined,
  setPage: (page: Page) => void,
  initMiniatures: () => Promise<void>
}

const emptyRawState: RawState = {
  kind: "nothing",
  book: {
    title: "New Book",
    delay: 5,
    pages: [],
    width: 100,
    height: 100,
    dpi: 100,
  },
  miniatures: {}
};

const loadRS = () => {
  const rs = window.localStorage.getItem('rawState');
  if (rs) {
    const prs: RawState = JSON.parse(rs);
    return {
      ...prs,
      miniatures: {},
    }
  } else {
    return emptyRawState;
  }
}

export const StateContext = React.createContext<State>({
  rs: loadRS(),
  isCurrentPage: () => false,
  getRS: async () => loadRS(),
  setRS: () => {},
  setBook: () => {},
  addPage: () => {},
  deletePage: () => {},
  getPage: () => undefined,
  setPage: () => {},
  initMiniatures: () => Promise.resolve(),
});

export const eqPage =
  (pn?: PageNr) => (p: Page) => p.hash === pn?.hash && p.duplicated === pn?.duplicated;

export const StateProvider: React.FC = ({ children }) => {
  const reduce = (rs: RawState, f: (rs: RawState) => RawState) => {
    const { miniatures, ...withoutMiniatures } = rs;
    window.localStorage.setItem('rawState', JSON.stringify(withoutMiniatures));
    return f(rs);
  }
  const [rs, setRS] = React.useReducer(reduce, loadRS());
  const isCurrentPage = eqPage(rs.currentPage);
  const getRS =
    () => new Promise<RawState>(resolve => setRS(rs => { resolve(rs); return rs }));
  const setBook =
    (book: Book) => setRS(rs => ({ ...rs, book }));
  const addPage = (page: Page) =>
    setRS(rs => ({ ...rs, book: { ...rs.book, pages: [...rs.book.pages, page] } }));
  const deletePage = (page: PageNr) =>
    setRS(rs => ({ ...rs, book: { ...rs.book, pages: rs.book.pages.filter(p => !eqPage(page)(p)) } }));
  const getPage = (page?: PageNr) => rs.book.pages.find(eqPage(page))
  const setPage = async (page: Page) => {
    setRS(rs => ({
      ...rs,
      book: {
        ...rs.book,
        pages: rs.book.pages.map(p => eqPage(page)(p) ? { ...p, ...page } : p)
      }
    }));
  }
  const initMiniatures = async () => {
    if (Object.keys(rs.miniatures).length === 0) {
      const b64s = await Promise.all(
        rs.book.pages.map(async p => [
          p.hash,
          await createMiniaturePNG(ProcessedPageOpts.from(rs.book, p))
        ] as const)
      );
      const miniatures = Object.fromEntries(b64s)
      setRS(rs => ({ ...rs, miniatures }));
    }
  }
  const value = { rs, isCurrentPage, getRS, setRS, setBook, addPage, deletePage, getPage, setPage, initMiniatures };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
