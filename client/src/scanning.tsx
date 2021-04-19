import React from 'react';
import './App.css';
import { httpRequest } from './utils';
import { State } from './state';
import { File } from "../../common/book";

const scanOnePage: ((s: State) => React.MouseEventHandler<HTMLDivElement>) = (s: State) => async (_event) => {
  s.setRS({ ...s.rs, kind: "scanning one" });
  const res = await httpRequest<File>({ kind: "scan" });
  if (res.success) {
    s.addFile(res.result);
  } else {
    s.setRS({ ...s.rs, kind: "nothing" });
    alert(JSON.stringify(res.result));
  }
}

export const scanningButtons = (s: State) => {
  switch (s.rs.kind) {
    case "nothing": return [
      <div key="one" className="button" onClick={scanOnePage(s)}>scan one page</div>,
      <div key="many" className="button">
        scan many pages with delay
      </div>
    ]
    case "scanning one": return [
      <span key="scanning">"scanning..."</span>
    ]
  }
};
