import React from "react";
import { Book, Page } from "../native/types";
import { PageNr, RawState, State, emptyRawState } from "../native/state";
import { invoke } from "./utils";

export const StateContext = React.createContext<State>({
  rs: emptyRawState,
  isCurrentPage: () => false,
  getRS: async () => emptyRawState,
  setRS: () => undefined,
  setBook: () => undefined,
  deletePage: () => undefined,
  getPage: () => undefined,
  setPage: () => undefined,
});

export const StateProvider: React.FC = ({ children }: { children?: React.ReactNode }) => {
  const [rs, setRS] = React.useReducer((rs: RawState, f: (rs: RawState) => RawState) => {
    const newRs = f(rs);
    if(rs.book !== newRs.book) void invoke("setBook", rs.book);
    return newRs;
  }, emptyRawState);
  React.useEffect(() => void (async () => {
    const [tmpPath, book] = await Promise.all([
      invoke("tmpPath"),
      invoke("getBook")
    ])
    setRS(rs => ({ ...rs, tmpPath, book }))
  })(), [])
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
