import React from "react";
import { Book, Page } from '../../common/book';

export interface RawState {
  kind: "scanning one" | "scanning many" | "nothing" | "generating pdf",
  pageHash?: string;
  book: Book
}

export interface State {
  rs: RawState,
  setRS: (f: (rs: RawState) => RawState) => void,
  setBook: (book: Book) => void,
  addPage: (page: Page) => void,
  deletePage: (hash: string) => void,
  getPage: (hash?: string) => Page | undefined,
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
  setRS: () => {},
  setBook: () => {},
  addPage: () => {},
  deletePage: () => {},
  getPage: () => undefined,
  setPage: () => {},
});

export const StateProvider: React.FC = ({ children }) => {
  const reduce = (rs: RawState, f: (rs: RawState) => RawState) => {
    window.localStorage.setItem('rawState', JSON.stringify(rs));
    return f(rs);
  }
  const [rs, setRS] = React.useReducer(reduce, loadRS());
  /*const setRS = (f: (rs: RawState) => RawState) => {
    setRSRaw(f);
    return f(rs)
  }*/
  
  const setBook = (book: Book) => setRS(rs => ({ ...rs, book }));
  const setPages = (pages: Page[]) => setRS(rs => ({ ...rs, book: { ...rs.book, pages } }));
  const addPage = (page: Page) =>
    setRS(rs => ({ ...rs, book: { ...rs.book, pages: [...rs.book.pages, page] } }));
  const deletePage = (hash: string) =>
    setRS(rs => ({ ...rs, book: { ...rs.book, pages: rs.book.pages.filter(p => p.hash !== hash) } }));
  const getPage = (hash?: string) => rs.book.pages.find(p => p.hash === hash);
  const setPage = (page: Page) =>
    setPages(rs.book.pages.map(p => p.hash === page.hash ? page : p));
  const value = { rs, setRS, setBook, addPage, deletePage, getPage, setPage };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
