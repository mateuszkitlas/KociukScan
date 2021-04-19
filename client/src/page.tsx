import React from 'react';
import { State } from './state';
import { image } from "./image";
import { File } from "../../common/book"

const somePage = (s: State) => (f: File) => {
  return image(f);
}

const noPage = (s: State) => {
  return <span>scan something</span>;
}

export const page = (s: State) => {
  const file = s.getFile(s.rs.fileHash);
  return file ? somePage(s)(file) : noPage(s);
}
