import React from 'react';
import './App.css';
import { httpRequest } from './utils';
import { State } from './state';
import { Page, Book } from "../../common/book";

type B = React.MouseEventHandler<HTMLDivElement>;
const b = (label: string, f: B) => (<div className="button" onClick={f} key={label}>{label}</div>);

const select = (values: number[], init: number, onChange: React.ChangeEventHandler<HTMLSelectElement>) => {
  return [
    <select onChange={onChange} value={init}>
      {values.map(v => <option value={v}>{v}</option>)}
    </select>
  ]
};

const dpiButton = (s: State) => 
  select([75, 100, 200, 300], s.rs.book.dpi, e => {
    const dpi = parseFloat(e.target.value) as Book["dpi"];
    s.setBook({ ...s.rs.book, dpi });
  });

const scanningButtons = (s: State) => {
  const scanOnePage: B = async (_event) => {
    s.setRS(rs => ({ ...rs, kind: "scanning one" }));
    const res = await httpRequest<Page>({ kind: "scan", book: s.rs.book });
    if (res.success) {
      s.addPage(res.result);
    } else {
      alert(JSON.stringify(res.result));
    }
    s.setRS(rs => ({ ...rs, kind: "nothing" }));
  }
  switch (s.rs.kind) {
    case "nothing": return [
      b("scan", scanOnePage),
      b("scan*", scanOnePage),
    ]
    case "scanning one": return [<span key="scanning">"scanning..."</span>]
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
    return [
      b("rL", rotate(-0.5)),
      b("rR", rotate(0.5)),
      b("90*", rotate(90)),
      b("180*", rotate(180)),
      b("L", moveX(-1)),
      b("R", moveX(1)),
      b("U", moveY(-1)),
      b("D", moveY(1)),
      select([1, 1.33], page.zoom, e => {
        const zoom = parseFloat(e.target.value);
        s.setPage({ ...page, zoom });
      }),
    ];
  } else {
    return [];
  }
}

const downloadButtons = (s: State) => {
  const download: B = async (_event) => {
    _event.stopPropagation();
    const r = await httpRequest<{ path: string }>({ kind: "pdf", book: s.rs.book });
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

export const buttons = (s: State) => [...scanningButtons(s), ...pageButtons(s), downloadButtons(s), ...dpiButton(s)];
