import React from "react";
import { ProcessedPageOpts } from './logic';
import { miniaturePNG } from './scanner';
import { Book, Page } from './types';

type PageNr = Pick<Page, "hash" | "duplicated">;

export interface RawState {
  kind: "scanning one" | "scanning many" | "nothing" | "generating pdf";
  currentPage?: PageNr;
  book: Book;
  miniatures?: Record<string, string>
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
  initMiniatures: () => Promise<void>,
  createMiniature: (p: Page) => Promise<void>,
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
  const bookRaw = window.localStorage.getItem('book');
  if (bookRaw) {
    const prs: RawState = {
      ...emptyRawState,
      book: JSON.parse(bookRaw)
    }
    return prs
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
  createMiniature: () => Promise.resolve(),
});

export const eqPage =
  (pn?: PageNr) => (p: Page) => p.hash === pn?.hash && p.duplicated === pn?.duplicated;

export const StateProvider: React.FC = ({ children }) => {
  const reduce = (rs: RawState, f: (rs: RawState) => RawState) => {
    window.localStorage.setItem('book', JSON.stringify(rs.book));
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
    await createMiniature(page);
  }
  const createMiniature = async (p: Page) => {
    const b64 = await miniaturePNG(ProcessedPageOpts.from(rs.book, p));
    setRS(rs => ({ ...rs, miniatures: { ...(rs.miniatures || {}), [p.hash]: b64 } }));
  }
  const recreateAllMiniatures = () => Promise.all(rs.book.pages.map(createMiniature));
  const initMiniatures = async () => { !rs.miniatures && (await recreateAllMiniatures()) };

  const value = {
    rs, isCurrentPage, getRS, setRS, setBook, addPage, deletePage, getPage, setPage,
    initMiniatures, createMiniature,
  };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
