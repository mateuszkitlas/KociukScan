import React from "react";
import { PageNr, State } from "../native/state.mjs";
import { FaUndo, FaRedo, FaFilePdf, FaCopy, FaTrash, FaEdit, FaCog } from "react-icons/fa/index.js";
import { ScanningButtons } from "./ScanningButtons.js";
import { Color, Page } from "../native/types.mjs";
import md5 from "md5";
import { invoke } from "./utils.mjs";
import { toError } from "../native/utils.mjs";

type B = React.MouseEventHandler<HTMLDivElement>;

export const duplicateAction = (s: State, page: Page) => {
  const duplicated = md5(Date.now().toString());
  const newPage = { ...page, duplicated, properties: undefined };
  s.setRS(rs => {
    const pageNr = rs.book.pages.findIndex(PageNr.eq(page));
    return {
      ...rs,
      currentPage: { hash: page.hash, duplicated },
      book: {
        ...rs.book,
        pages: [...rs.book.pages.slice(0, pageNr + 1), newPage, ...rs.book.pages.slice(pageNr + 1)],
      },
    };
  });
};

const pageButtons = (s: State) => {
  const page = s.getPage(s.rs.currentPage);
  if (page) {
    const rotate =
      (deg: number): B =>
      () => {
        const properties = Page.properties(s.rs.book, page);
        const rotate = properties.rotate + deg;
        s.setPage({ ...page, properties: { ...properties, rotate } });
      };
    const setColor = (c: Partial<Color>) =>
      s.setRS(rs => ({
        ...rs,
        book: { ...rs.book, color: { ...rs.book.color, ...c } },
      }));
    return [
      <div key="duplicate" className="button" onClick={() => duplicateAction(s, page)} title="Duplicate">
        <FaCopy />
      </div>,
      <div
        key="delete"
        className="button"
        onClick={() =>
          s.setRS(rs => ({
            ...rs,
            modal: { kind: "deletePage", pageNr: PageNr.get(page) },
          }))
        }
        title="Delete"
      >
        <FaTrash />
      </div>,
      <div
        key="rescan"
        className="button"
        onClick={() =>
          s.setRS(rs => ({
            ...rs,
            modal: { kind: "reScanPage", pageNr: PageNr.get(page) },
          }))
        }
        title="Scan again this page"
      >
        <FaEdit />
      </div>,
      <div className="button" onClick={rotate(-0.5)} key="rl" title="Rotate left by 0.5º">
        <FaUndo />
      </div>,
      <div className="button" onClick={rotate(0.5)} key="rr" title="Rotate right by 0.5º">
        <FaRedo />
      </div>,
      <div className="button" onClick={rotate(90)} key="90*" title="Rotate by 90º">
        90º
      </div>,
      <div className="button" onClick={rotate(180)} key="180*" title="Rotate by 180º">
        180º
      </div>,
      <input
        onChange={e => setColor({ contrast: parseFloat(e.target.value) })}
        key="contrast-book"
        title="Contrast"
        type="range"
        min="1"
        max="2"
        step="0.05"
        value={s.rs.book.color.contrast}
        style={{
          position: "relative",
          top: 11,
          WebkitAppearance: "none",
          backgroundColor: "#445",
          padding: 5,
          borderRadius: 5,
          margin: "0 5px 0 5px",
        }}
      ></input>,
      <label key="allowPageResize">
        <input
          className="button"
          type="checkbox"
          checked={s.rs.allowPageResize}
          onChange={e => s.setRS(rs => ({ ...rs, allowPageResize: e.target.checked }))}
        />
        resize
      </label>,
    ];
  } else {
    return [];
  }
};

const downloadButtons = (s: State) => {
  const download: B = async () => {
    try {
      await invoke("pdf", s.rs.book);
    } catch (e) {
      s.setRS(rs => ({
        ...rs,
        modal: { kind: "errorScan", message: toError(e).message },
      }));
    }
    s.setRS(rs => ({ ...rs, kind: "nothing" }));
  };
  const f = (processed: number, all: number, startedAt: number) => {
    const elapsed = (Date.now() - startedAt) / 1000;
    const v = Math.round((elapsed / processed) * 10) / 10;
    if (elapsed > 0 && processed > 0) {
      const seconds = Math.round(((all - processed) / processed) * elapsed);
      const rMin = Math.floor(seconds / 60);
      const rSec = seconds % 60;
      const rSec2 = rSec < 10 ? `0${rSec}` : rSec;
      return `${processed}/${all} ${rMin}:${rSec2} (${v}s per page)`;
    } else {
      return `${processed}/${all}`;
    }
  };
  return (
    <div
      className={`button ${s.rs.kind === "nothing" ? "" : "inactive"}`}
      onClick={s.rs.kind === "nothing" ? download : undefined}
      key="pdf"
      title="Generate PDF"
    >
      <FaFilePdf />
      {s.rs.kind === "generating pdf" ? f(s.rs.processedPages, s.rs.book.pages.length, s.rs.startedAt) : undefined}
    </div>
  );
};

export const buttons = (s: State) => [
  <ScanningButtons s={s} key="ScanningButtons" />,
  downloadButtons(s),
  ...pageButtons(s),
  <div
    className="button"
    onClick={() => s.setRS(rs => ({ ...rs, modal: { kind: "settings" } }))}
    title="Settings"
    key="settings"
  >
    <FaCog />
  </div>,
];
