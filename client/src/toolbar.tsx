import React from 'react';
import './App.css';
import { httpRequest } from './utils';
import { State } from './state';
import { File } from "../../common/book";

type B = React.MouseEventHandler<HTMLDivElement>;



const scanningButtons = (s: State) => {
  const scanOnePage: B = async (_event) => {
    s.setRS({ ...s.rs, kind: "scanning one" });
    const res = await httpRequest<File>({ kind: "scan" });
    if (res.success) {
      s.addFile(res.result);
    } else {
      s.setRS({ ...s.rs, kind: "nothing" });
      alert(JSON.stringify(res.result));
    }
  }
  switch (s.rs.kind) {
    case "nothing": return [
      <div key="one" className="button" onClick={scanOnePage}>scan one page</div>,
      <div key="many" className="button">
        scan many pages with delay
      </div>
    ]
    case "scanning one": return [
      <span key="scanning">"scanning..."</span>
    ]
  }
};

const pageButtons = (s: State) => {
  const f = s.getFile(s.rs.fileHash);
  if (f) {
    const page = f.pages[0];
    const rotate = (deg: number): B => (_event) => {
      s.setPage(f.hash, { ...page, rotate: page.rotate + deg });
    }
    return [
      <div className="button" onClick={rotate(1)}>rotate left 1'</div>,
      <div className="button" onClick={rotate(-1)}>rotate right 1'</div>
    ];
  } else {
    return [];
  }
}

export const buttons = (s: State) => [...scanningButtons(s), ...pageButtons(s)];
