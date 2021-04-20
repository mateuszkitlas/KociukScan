import React from "react";
import { Book, Page } from '../../common/book';

export interface RawState {
  kind: "scanning one" | "nothing",
  pageHash?: string;
  book: Book
}

export interface State {
  rs: RawState,
  setRS: (rs: RawState) => void,
  setBook: (book: Book) => void,
  addPage: (page: Page) => void,
  deletePage: (hash: string) => void,
  getPage: (hash?: string) => Page | undefined,
  setPage: (hash: string, page: Page) => void,
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
  setPage: () => {}
});

export const StateProvider: React.FC = ({ children }) => {
  const [rs, setRSRaw] = React.useState<RawState>(loadRS());
  const setRS = (rs: RawState) => {
    window.localStorage.setItem('rawState', JSON.stringify(rs));
    return setRSRaw(rs);
  }

  const setBook = (book: Book) => setRS({ ...rs, book });
  const setPages = (pages: Page[]) => setBook({ ...rs.book, pages });
  const addPage = (page: Page) => setPages([...rs.book.pages, page]);
  const deletePage = (hash: string) => setPages(rs.book.pages.filter(p => p.hash !== hash));
  const getPage = (hash?: string) => rs.book.pages.find(p => p.hash === hash);
  const setPage = (hash: string, page: Page) => {
    setPages(rs.book.pages.map(p => p.nr === page.nr ? page : p));
  }
  const value = { rs, setRS, setBook, addPage, deletePage, getPage, setPage };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
