import React from 'react';
import './App.css';
import { State } from './state';
import { DPI } from "./types";
import { sleep } from './utils';
import { FaUndo, FaRedo, FaAngleDown, FaAngleUp, FaAngleRight, FaAngleLeft, FaPaw, FaStop, FaFilePdf } from 'react-icons/fa';
import { toProcessedPageOptsFromLast } from './logic';
import { pdf, scan } from './src/main';

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
  const page = await scan(toProcessedPageOptsFromLast(s.rs.book));
  const rs = await s.getRS();
  if (setActive(rs.kind === kind)) {
    return s.setRS(rs => ({ ...rs, book: { ...rs.book, pages: [...rs.book.pages, page] } }));
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
      ? <div className="button" onClick={stop} key="stop"><FaStop /></div>
      : s.rs.kind === "generating pdf"
      ? <div className="button inactive" key="one"><FaPaw /></div>
      : <div className="button" onClick={one} key="one"><FaPaw /></div>,
    <div
      className={`button ${s.rs.kind === "nothing" ? "" : "inactive"}`}
      onClick={s.rs.kind === "nothing" ? many : undefined}
      key="scan*"
    >
      <FaPaw />
      {b("+", setDelay(1), true)}
      {s.rs.book.delay}sec
      {b("-", setDelay(-1), true)}
    </div>
  ]
};

const pageButtons = (s: State) => {
  const page = s.getPage(s.rs.currentPage);
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
      <div className="button" onClick={rotate(-0.5)} key="rl"><FaUndo /></div>,
      <div className="button" onClick={rotate(0.5)} key="rr"><FaRedo /></div>,
      b("0*", setZeroRotate, true),
      b("90*", rotate(90), true),
      b("180*", rotate(180), true),
      <div className="button" onClick={moveX(-1)} key="ml"><FaAngleLeft /></div>,
      <div className="button" onClick={moveX(1)}  key="mr"><FaAngleRight /></div>,
      <div className="button" onClick={moveY(-1)} key="mu"><FaAngleUp /></div>,
      <div className="button" onClick={moveY(1)}  key="md"><FaAngleDown /></div>,
    ];
  } else {
    return [];
  }
}

const downloadButtons = (s: State) => {
  const download: B = async _e => {
    s.setRS(rs => ({ ...rs, kind: "generating pdf" }));
    await pdf(s.rs.book);
    s.setRS(rs => ({ ...rs, kind: "nothing" }));
  }
  return (
    <div
      className={`button ${s.rs.kind === "nothing" ? "" : "inactive"}`}
      onClick={download}
      key="pdf"
    >
      <FaFilePdf />
    </div>
  );
}

export const buttons = (s: State) => [
  ...dpiButton(s),
  ...scanningButtons(s),
  downloadButtons(s),
  ...pageButtons(s),
];
