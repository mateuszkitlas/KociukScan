import React from "react";
import { Book, Page } from '../../common/book';
import { createMiniature } from './http';

type PageNr = Pick<Page, "hash" | "duplicated">;

export interface RawState {
  kind: "scanning one" | "scanning many" | "nothing" | "generating pdf";
  currentPage?: PageNr;
  book: Book;
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
}

const emptyRawState: RawState = {
  kind: "nothing",
  book: {
    title: "New Book",
    delay: 5,
    pages: [],
    fspath: "",
    width: 100,
    height: 100,
    dpi: 100,
  }
};

const loadRS = () => {
  const rs = window.localStorage.getItem('rawState');
  return rs ? JSON.parse(rs) : emptyRawState;
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
});

export const eqPage =
  (pn?: PageNr) => (p: Page) => p.hash === pn?.hash && p.duplicated === pn?.duplicated;

export const StateProvider: React.FC = ({ children }) => {
  const reduce = (rs: RawState, f: (rs: RawState) => RawState) => {
    window.localStorage.setItem('rawState', JSON.stringify(rs));
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
    const req = await createMiniature(rs.book, page);
    if (req.success) {
      setRS(rs => ({
        ...rs,
        book: {
          ...rs.book,
          pages: rs.book.pages.map(p => eqPage(page)(p) ? { ...p, miniatureHash: req.result } : p)
        }
      }));
    }
  }
  const value = { rs, isCurrentPage, getRS, setRS, setBook, addPage, deletePage, getPage, setPage };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
