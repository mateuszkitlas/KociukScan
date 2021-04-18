import React from "react";
import { Book } from '../../common/book';

export interface RawState {
  kind: "scanning one" | "nothing",
  book: Book
}

export interface State {
  rs: RawState,
  setRS: (rs: RawState) => void,
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

export const StateContext = React.createContext<State>({ rs: emptyRawState, setRS: () => {} });

export const StateProvider: React.FC = ({ children }) => {
  const [rs, setRS] = React.useState<RawState>(emptyRawState);
  const value = { rs, setRS };
  
  return <StateContext.Provider value={value}>{ children }</StateContext.Provider>;
}
