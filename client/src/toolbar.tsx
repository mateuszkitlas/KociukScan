import React from 'react';
import './App.css';
import { createMiniature, httpRequest } from './utils';
import { State } from './state';
import { Page } from "../../common/book";

type B = React.MouseEventHandler<HTMLDivElement>;
const b = (label: string, f: B) => (<div className="button" onClick={f} key={label}>{label}</div>);


const scanningButtons = (s: State) => {
  const scanOnePage: B = async (_event) => {
    s.setRS({ ...s.rs, kind: "scanning one" });
    const res = await httpRequest<Page>({ kind: "scan", book: s.rs.book });
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
      s.setPage({ ...page, rotate: page.rotate + deg });
    }
    const moveX = (x: number): B => (_event) => {
      s.setPage({ ...page, x: page.x + x });
    }
    const moveY = (y: number): B => (_event) => {
      s.setPage({ ...page, y: page.y + y });
    }
    const width = (w: number): B => (_event) => {
      s.setBook({ ...s.rs.book, width: s.rs.book.width + w });
    }
    const height = (h: number): B => (_event) => {
      s.setBook({ ...s.rs.book, height: s.rs.book.height + h });
    }
    return [
      b("rL", rotate(-0.5)),
      b("rR", rotate(0.5)),
      b("L", moveX(-1)),
      b("R", moveX(1)),
      b("U", moveY(-1)),
      b("D", moveY(1)),
      b("W1", width(1)),
      b("W5", width(5)),
      b("H1", height(1)),
      b("H5", height(5)),
    ];
  } else {
    return [];
  }
}

const downloadButtons = (s: State) => {
  const download: B = async (_event) => {
    _event.stopPropagation();
    const r = await httpRequest<{ path: string }>({ kind: "pdf", book: s.rs.book });
    //alert(JSON.stringify(r));
    if (r.success) {
      const link = document.createElement('a');
      link.href = r.result.path;
      document.body.appendChild(link);
      link.setAttribute(
        'download',
        `${s.rs.book.title}.pdf`,
      );
      link.click();
      document.body.removeChild(link);
    } else {
      alert(JSON.stringify(r.result));
    }
  }
  return b("pdf", download);
}

export const buttons = (s: State) => [...scanningButtons(s), ...pageButtons(s), downloadButtons(s)];
