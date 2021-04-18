import React from "react";
import { Book, File } from '../../common/book';

export interface RawState {
  kind: "scanning one" | "nothing",
  book: Book
}

export interface State {
  rs: RawState,
  setRS: (rs: RawState) => void,
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
} 

export const StateContext = React.createContext<State>({
  rs: emptyRawState,
  setRS: () => {},
  addFile: () => {}
});

export const StateProvider: React.FC = ({ children }) => {
  const [rs, setRS] = React.useState<RawState>(emptyRawState);
  
  
  const addFile = (file: File) => setRS({ ...rs, book: { ...rs.book, files: [...rs.book.files, file] } })
  const value = { rs, setRS, addFile };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
