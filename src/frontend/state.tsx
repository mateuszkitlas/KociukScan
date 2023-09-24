import React from "react";
import { Book, Page } from "../native/types";
import { PageNr, RawState, State, emptyRawState, loadRSFromBook } from "../native/state";
import { ipcRendererInvoke } from "../backend/endpoints";


const loadRSFromLS = () => loadRS(window.localStorage.getItem("book"));
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
});

export const StateProvider: React.FC = ({ children }: { children?: React.ReactNode }) => {
  const reduce = (rs: RawState, f: (rs: RawState) => RawState) => {
    window.localStorage.setItem("book", JSON.stringify(rs.book));
    return f(rs);
  };
  const [rs, setRS] = React.useReducer(reduce, loadRSFromLS());
  if(!rs.tmpPath)
    ipcRendererInvoke("tmpPath").then(tmpPath => setRS(s => ({ ...s, tmpPath })))
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

  const value = {
    rs, isCurrentPage, getRS, setRS, setBook, deletePage, getPage, setPage,
  };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
};
