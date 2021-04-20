import React from 'react';
import './App.css';
import { httpRequest } from './utils';
import { State } from './state';
import { Page } from "../../common/book";

type B = React.MouseEventHandler<HTMLDivElement>;
const b = (label: string, f: B) => (<div className="button" onClick={f}>{label}</div>);


const scanningButtons = (s: State) => {
  const scanOnePage: B = async (_event) => {
    s.setRS({ ...s.rs, kind: "scanning one" });
    const res = await httpRequest<Page>({ kind: "scan" });
    if (res.success) {
      s.addPage(res.result);
    } else {
      s.setRS({ ...s.rs, kind: "nothing" });
      alert(JSON.stringify(res.result));
    }
  }
  switch (s.rs.kind) {
    case "nothing": return [
      <div key="one" className="button" onClick={scanOnePage}>scan</div>,
      <div key="many" className="button">
        scan*
      </div>
    ]
    case "scanning one": return [
      <span key="scanning">"scanning..."</span>
    ]
  }
};

const pageButtons = (s: State) => {
  const page = s.getPage(s.rs.pageHash);
  if (page) {
    const rotate = (deg: number): B => (_event) => {
      s.setPage(page.hash, { ...page, rotate: page.rotate + deg });
    }
    const moveX = (x: number): B => (_event) => {
      s.setPage(page.hash, { ...page, x: page.x + x });
    }
    const moveY = (y: number): B => (_event) => {
      s.setPage(page.hash, { ...page, y: page.y + y });
    }
    const width = (w: number): B => (_event) => {
      s.setBook({ ...s.rs.book, width: s.rs.book.width + w });
    }
    const height = (h: number): B => (_event) => {
      s.setBook({ ...s.rs.book, height: s.rs.book.height + h });
    }
    return [
      b("L1'", rotate(1)),
      b("R1'", rotate(-1)),
      b("L5", moveX(-5)),
      b("L1", moveX(-1)),
      b("R1", moveX(1)),
      b("R5", moveX(5)),
      b("U5", moveY(-5)),
      b("U1", moveY(-1)),
      b("D1", moveY(1)),
      b("D5", moveY(5)),
      b("W1", width(1)),
      b("W5", width(5)),
      b("H1", height(1)),
      b("H5", height(5)),
    ];
  } else {
    return [];
  }
}

export const buttons = (s: State) => [...scanningButtons(s), ...pageButtons(s)];
