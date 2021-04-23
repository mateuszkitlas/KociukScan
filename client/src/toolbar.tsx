import React from 'react';
import './App.css';
import { httpRequest } from './http';
import { State } from './state';
import { Page, DPI } from "../../common/book";
import { sleep } from './utils';

type B = React.MouseEventHandler<HTMLDivElement>;
const b = (label: string, f: B, active: boolean) => (
  <div className={`button ${active ? "" : "inactive"}`} onClick={active ? f : undefined} key={label}>{label}</div>
);

const select = (values: number[], init: number, onChange: React.ChangeEventHandler<HTMLSelectElement>) => {
  return [
    <select onChange={onChange} value={init} key={`select${init}`}>
      {values.map(v => <option value={v} key={v}>{v} dpi</option>)}
    </select>
  ]
};

const dpiButton = (s: State) => 
  select([75, 100, 200, 300], s.rs.book.dpi, e => {
    const dpi = parseFloat(e.target.value) as DPI;
    s.setBook({ ...s.rs.book, dpi });
  });

const scanIf = async (s: State, kind: State["rs"]["kind"], setActive: (b: boolean) => boolean) => {
  const res = await httpRequest<Page>({ kind: "scan", book: s.rs.book });
  const rs = await s.getRS();
  if (setActive(rs.kind === kind)) {
    if (res.success) {
      return s.setRS(rs => ({ ...rs, book: { ...rs.book, pages: [...rs.book.pages, res.result] } }));
    } else {
      alert(JSON.stringify(res.result));
      return s.setRS(rs => ({ ...rs, kind: "nothing" }));
    }
  }
}

const scanningButtons = (s: State) => {
  const one: B = async _e => {
    s.setRS(rs => ({ ...rs, kind: "scanning one" }));
    await scanIf(s, "scanning one", active => active);
    s.setRS(rs => ({ ...rs, kind: "nothing" }));
  }
  const many: B = async _e => {
    s.setRS(rs => ({ ...rs, kind: "scanning many" }));
    let active = true;
    while(active) {
      /* eslint-disable no-loop-func
      */ await scanIf(s, "scanning many", activeNew => active = activeNew);
      await sleep((await s.getRS()).book.delay);
    }
  }
  const stop: B = _e => {
    s.setRS(rs => ({ ...rs, kind: "nothing" }));
  }
  
  const setDelay = (delta: number): B => e => {
    e.stopPropagation();
    if (s.rs.book.delay + delta >= 0) {
      s.setBook({ ...s.rs.book, delay: s.rs.book.delay + delta });
    }
  }
  
  return [
    ["scanning one", "scanning many"].includes(s.rs.kind)
      ? b("stop", stop, true)
      : s.rs.kind === "generating pdf"
      ? b("scan", one, false)
      : b("scan", one, true),
    <div
      className={`button ${s.rs.kind === "nothing" ? "" : "inactive"}`}
      onClick={s.rs.kind === "nothing" ? many : undefined}
      key="scan*"
    >
      scan with delay
      {b("+", setDelay(1), true)}
      {s.rs.book.delay}sec
      {b("-", setDelay(-1), true)}
    </div>
  ]
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
    const setZeroRotate: B = _e => {
      s.setPage({ ...page, rotate: 0 });
    }
    return [
      b("rL", rotate(-0.5), true),
      b("rR", rotate(0.5), true),
      b("0*", setZeroRotate, true),
      b("90*", rotate(90), true),
      b("180*", rotate(180), true),
      b("L", moveX(-1), true),
      b("R", moveX(1), true),
      b("U", moveY(-1), true),
      b("D", moveY(1), true),
    ];
  } else {
    return [];
  }
}

const downloadButtons = (s: State) => {
  const download: B = async _e => {
    s.setRS(rs => ({ ...rs, kind: "generating pdf" }));
    const r = await httpRequest<{ path: string }>({ kind: "pdf", book: s.rs.book });
    s.setRS(rs => ({ ...rs, kind: "nothing" }));
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
  return [b("pdf", download, s.rs.kind === "nothing")]
}

export const buttons = (s: State) => [
  ...dpiButton(s),
  ...scanningButtons(s),
  downloadButtons(s),
  ...pageButtons(s),
];
