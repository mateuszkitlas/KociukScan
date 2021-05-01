import React from 'react';
import './App.css';
import { State } from './state';
import { DPI } from "./types";
import { sleep } from './utils';
import {
  FaUndo, FaRedo, FaAngleDown, FaAngleUp, FaAngleRight, FaAngleLeft, FaPaw, FaStop, FaFilePdf,
  FaFileUpload, FaFileDownload } from 'react-icons/fa';
import { ProcessedPageOpts } from './logic';
import { pdf, scanX } from './scanner';
import { exportBook, importBook } from './exportBook';
import { Settings } from './Settings';

type B = React.MouseEventHandler<HTMLDivElement>;
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
  const page = await scanX(ProcessedPageOpts.fromLast(s.rs));
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
      ? <div className="button" onClick={stop} key="stop" title="Stop"><FaStop /></div>
      : s.rs.kind === "generating pdf"
      ? <div className="button inactive" key="one" title="Scan"><FaPaw /></div>
      : <div className="button" onClick={one} key="one" title="Scan"><FaPaw /></div>,
    <div
      className={`button ${s.rs.kind === "nothing" ? "" : "inactive"}`}
      onClick={s.rs.kind === "nothing" ? many : undefined}
      key="scan*"
      title="Scan many pages"
    >
      <FaPaw />
      <div className="button" onClick={setDelay(-1)} key="-" title="-1 second" >-</div>
      {s.rs.book.delay}sec
      <div className="button" onClick={setDelay(1)} key="+" title="+1 second" >+</div>
    </div>,
    <div
      className="button"
      onClick={() => exportBook(s)}
      key="export"
      title="Save"
    >
      <FaFileDownload/>
    </div>,
    <div
      className="button"
      onClick={() => importBook(s)}
      key="import"
      title="Load"
    >
      <FaFileUpload/>
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
    const allowPageResize: React.ChangeEventHandler<HTMLInputElement> = e => {
      s.setRS(rs => ({ ...rs, allowPageResize: e.target.checked }));
    }
    return [
      <div className="button" onClick={rotate(-0.5)} key="rl" title="Rotate left by 0.5º" ><FaUndo /></div>,
      <div className="button" onClick={rotate(0.5)}  key="rr" title="Rotate right by 0.5º"><FaRedo /></div>,
      <div className="button" onClick={rotate(90)}   key="90*" title="Rotate by 90º" >90º</div>,
      <div className="button" onClick={rotate(180)}  key="180*" title="Rotate by 180º">180º</div>,
      <div className="button" onClick={moveX(-1)} key="ml" title="Move left" ><FaAngleLeft /></div>,
      <div className="button" onClick={moveX(1)}  key="mr" title="Move right"><FaAngleRight /></div>,
      <div className="button" onClick={moveY(-1)} key="mu" title="Move up"   ><FaAngleUp /></div>,
      <div className="button" onClick={moveY(1)}  key="md" title="Move down" ><FaAngleDown /></div>,
      <label key="allowPageResize">
        <input className="button" type="checkbox" checked={s.rs.allowPageResize} onChange={allowPageResize}/>
        allow page resize
      </label>
    ];
  } else {
    return [];
  }
}

const downloadButtons = (s: State) => {
  const download: B = async _e => {
    s.setRS(rs => ({ ...rs, kind: "generating pdf", processedPages: 0 }));
    await pdf(s);
    s.setRS(rs => ({ ...rs, kind: "nothing" }));
  }
  return (
    <div
      className={`button ${s.rs.kind === "nothing" ? "" : "inactive"}`}
      onClick={download}
      key="pdf"
      title="Generate PDF"
    >
      <FaFilePdf />
      {
        s.rs.kind === "generating pdf"
         ? `${s.rs.processedPages}/${s.rs.book.pages.length}`
         : undefined
      }
    </div>
  );
}



export const buttons = (s: State) => [
  ...dpiButton(s),
  ...scanningButtons(s),
  downloadButtons(s),
  ...pageButtons(s),
  <Settings s={s} key="settings"/>
];
