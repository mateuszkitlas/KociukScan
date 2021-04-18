import React from "react";
import { Book, File } from '../../common/book';

export interface RawState {
  kind: "scanning one" | "nothing",
  book: Book
}

export interface State {
  rs: RawState,
  setRS: (rs: RawState) => void,
  setBook: (book: Book) => void,
  addFile: (file: File) => void,
}

const emptyRawState: RawState = {
  kind: "nothing",
  book: {
    title: "New Book",
    delay: 5,
    files: [],
    fspath: ""
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
  addFile: () => {}
});

export const StateProvider: React.FC = ({ children }) => {
  const [rs, setRSRaw] = React.useState<RawState>(loadRS());
  const setRS = (rs: RawState) => {
    window.localStorage.setItem('rawState', JSON.stringify(rs));
    return setRSRaw(rs);
  }

  const setBook = (book: Book) => setRS({ ...rs, book });
  const addFile = (file: File) => setBook({ ...rs.book, files: [...rs.book.files, file] })
  const value = { rs, setRS, setBook, addFile };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
