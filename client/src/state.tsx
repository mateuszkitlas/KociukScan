import React from "react";
import { Book, File } from '../../common/book';

export interface RawState {
  kind: "scanning one" | "nothing",
  fileHash?: string;
  book: Book
}

export interface State {
  rs: RawState,
  setRS: (rs: RawState) => void,
  setBook: (book: Book) => void,
  addFile: (file: File) => void,
  deleteFile: (hash: string) => void,
  getFile: (hash?: string) => File | undefined,
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
  addFile: () => {},
  deleteFile: () => {},
  getFile: () => undefined,
});

export const StateProvider: React.FC = ({ children }) => {
  const [rs, setRSRaw] = React.useState<RawState>(loadRS());
  const setRS = (rs: RawState) => {
    window.localStorage.setItem('rawState', JSON.stringify(rs));
    return setRSRaw(rs);
  }

  const setBook = (book: Book) => setRS({ ...rs, book });
  const setFiles = (files: File[]) => setBook({ ...rs.book, files });
  const addFile = (file: File) => setFiles([...rs.book.files, file]);
  const deleteFile = (hash: string) => setFiles(rs.book.files.filter(f => f.hash !== hash));
  const getFile = (hash?: string) => rs.book.files.find(f => f.hash === hash);
  const value = { rs, setRS, setBook, addFile, deleteFile, getFile };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
