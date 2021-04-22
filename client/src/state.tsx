import React from "react";
import { Book, Page } from '../../common/book';
import { createMiniature } from './utils';

export interface RawState {
  kind: "scanning one" | "nothing",
  pageHash?: string;
  book: Book
}

export interface State {
  rs: RawState,
  setRS: (rs: RawState) => RawState,
  setBook: (book: Book) => RawState,
  addPage: (page: Page) => RawState,
  deletePage: (hash: string) => RawState,
  getPage: (hash?: string) => Page | undefined,
  setPage: (page: Page) => RawState,
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
  setRS: () => loadRS(),
  setBook: () => loadRS(),
  addPage: () => loadRS(),
  deletePage: () => loadRS(),
  getPage: () => undefined,
  setPage: () => loadRS()
});

export const StateProvider: React.FC = ({ children }) => {
  const [rs, setRSRaw] = React.useState<RawState>(loadRS());
  const setRS = (rs: RawState) => {
    window.localStorage.setItem('rawState', JSON.stringify(rs));
    setRSRaw(rs);
    return rs;
  }

  const setBook = (book: Book) => setRS({ ...rs, book });
  const setPages = (pages: Page[]) => setBook({ ...rs.book, pages });
  const addPage = (page: Page) => setPages([...rs.book.pages, page]);
  const deletePage = (hash: string) => setPages(rs.book.pages.filter(p => p.hash !== hash));
  const getPage = (hash?: string) => rs.book.pages.find(p => p.hash === hash);
  const setPage = (page: Page) => {
    const rs2 = setPages(rs.book.pages.map(p => p.hash === page.hash ? page : p));
    createMiniature(rs2.book, page);
    return rs2;
  }
  const value = { rs, setRS, setBook, addPage, deletePage, getPage, setPage };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
