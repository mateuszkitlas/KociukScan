import React from "react";
import { Book, Page } from "../native/types";
import { PageNr, RawState, State } from "../native/state";
import { InitProps, invoke } from "./utils";

const emptyRawState: RawState = {
  kind: "nothing",
  tmpPath: "",
  book: {
    delay: 5,
    pages: [],
    width: 400,
    height: 400,
    dpi: 200,
    color: {
      contrast: 1,
    },
  },
  allowPageResize: false,
};

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

export const StateProvider: React.FC<InitProps> = ({ children, tmpPath, book }) => {
  const [rs, setRS] = React.useReducer(
    (rs: RawState, f: (rs: RawState) => RawState) => {
      const newRs = f(rs);
      if (rs.book !== newRs.book) void invoke("setBook", rs.book);
      return newRs;
    },
    { ...emptyRawState, book, tmpPath },
  );
  const isCurrentPage = PageNr.eq(rs.currentPage);
  const getRS = () =>
    new Promise<RawState>(resolve =>
      setRS(rs => {
        resolve(rs);
        return rs;
      }),
    );
  const setBook = (book: Book) => setRS(rs => ({ ...rs, book }));
  const deletePage = (page: PageNr) =>
    setRS(rs => ({
      ...rs,
      book: {
        ...rs.book,
        pages: rs.book.pages.filter(p => !PageNr.eq(page)(p)),
      },
    }));
  const getPage = (page?: PageNr) => rs.book.pages.find(PageNr.eq(page));
  const setPage = async (page: Page) => {
    setRS(rs => ({
      ...rs,
      book: {
        ...rs.book,
        pages: rs.book.pages.map(p => (PageNr.eq(page)(p) ? { ...p, ...page } : p)),
      },
    }));
  };

  const value = {
    rs,
    isCurrentPage,
    getRS,
    setRS,
    setBook,
    deletePage,
    getPage,
    setPage,
  };

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
};
