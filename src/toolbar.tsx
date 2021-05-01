import React from 'react';
import './App.css';
import { State } from './state';
import { DPI } from "./types";
import { FaUndo, FaRedo, FaAngleDown, FaAngleUp, FaAngleRight, FaAngleLeft, FaFilePdf } from 'react-icons/fa';
import { pdf } from './scanner';
import { Settings } from './Settings';
import { ScanningButtons } from './ScanningButtons';

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
  <ScanningButtons s={s} key="ScanningButtons"/>,
  downloadButtons(s),
  ...pageButtons(s),
  <Settings s={s} key="Settings"/>
];
