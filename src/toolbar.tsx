import React from "react";
import "./App.css";
import { PageNr, State } from "./state";
import { FaUndo, FaRedo, FaFilePdf, FaCopy, FaTrash, FaEdit } from "react-icons/fa";
import { pdf, scan } from "./scanner";
import { Settings } from "./Settings";
import { ScanningButtons } from "./ScanningButtons";
import { Color, Page } from "./types";
import { ModalYesNo } from "./modal";
import md5 from "md5";

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
        pages: [
          ...rs.book.pages.slice(0, pageNr + 1),
          newPage,
          ...rs.book.pages.slice(pageNr + 1),
        ]
      }
    };
  });
};

export const deleteAction = (s: State, page: Page) => s.addModal((key, dispose) => <ModalYesNo
  key={key}
  onYes={() => {
    s.setRS(rs => ({ ...rs, currentPage: { hash: page.hash } }));
    s.deletePage(page);
    dispose();
  }}
  onNo={dispose}
>Are you sure?
</ModalYesNo>);

const pageButtons = (s: State) => {
  const page = s.getPage(s.rs.currentPage);
  if (page) {
    const rotate = (deg: number): B => () => {
      const properties = Page.properties(s.rs.book, page);
      const rotate = properties.rotate + deg;
      s.setPage({ ...page, properties: { ...properties, rotate } });
    };
    const setColor = (c: Partial<Color>) => s.setRS(rs =>
      ({ ...rs, book: { ...rs.book, color: { ...rs.book.color, ...c } } })
    );
    return [
      <div key="duplicate" className="button" onClick={() => duplicateAction(s, page)} title="Duplicate"><FaCopy /></div>,
      <div key="delete" className="button" onClick={() => deleteAction(s, page)} title="Delete"><FaTrash /></div>,
      <div
        key="rescan"
        className="button"
        onClick={() => s.addModal((key, dispose) =>
          <ModalYesNo
            key={key}
            onYes={async () => {
              dispose();
              s.setRS(rs => ({ ...rs, kind: "scanning one" }));
              const pageGetter = await scan(s);
              if (pageGetter) {
                const newPage = await pageGetter();
                s.setRS(rs => ({
                  ...rs,
                  kind: "nothing",
                  currentPage: PageNr.get(newPage),
                  book: {
                    ...rs.book,
                    pages: rs.book.pages.map(p => PageNr.eq(p)(page) ? newPage : p)
                  }
                }));
              } else {
                s.setRS(rs => ({ ...rs, kind: "nothing" }));
              }
            }}
            onNo={dispose}
          >Are you sure you want to scan this page again?
          </ModalYesNo>
        )}
        title="Scan again this page"
      ><FaEdit />
      </div>,
      <div className="button" onClick={rotate(-0.5)} key="rl" title="Rotate left by 0.5º" ><FaUndo /></div>,
      <div className="button" onClick={rotate(0.5)}  key="rr" title="Rotate right by 0.5º"><FaRedo /></div>,
      <div className="button" onClick={rotate(90)}   key="90*" title="Rotate by 90º">90º</div>,
      <div className="button" onClick={rotate(180)}  key="180*" title="Rotate by 180º">180º</div>,
      <input
        onChange={e => setColor(({ contrast: parseFloat(e.target.value) }))}
        key="contrast-book"
        title="Contrast"
        type="range"
        min="0.5"
        max="4"
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
        />resize
      </label>
    ];
  } else {
    return [];
  }
};

const downloadButtons = (s: State) => {
  const download: B = async () => {
    await pdf(s);
    s.setRS(rs => ({ ...rs, kind: "nothing" }));
  };
  const f = (processed: number, all: number, startedAt: number) => {
    const elapsed = (Date.now() - startedAt) / 1000;
    const v = Math.round(elapsed / processed * 10) / 10;
    if (elapsed > 0 && processed > 0) {
      const seconds = Math.round((all - processed)/processed*elapsed);
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
      {
        s.rs.kind === "generating pdf"
          ? f(s.rs.processedPages, s.rs.book.pages.length, s.rs.startedAt)
          : undefined
      }
    </div>
  );
};



export const buttons = (s: State) => [
  <ScanningButtons s={s} key="ScanningButtons"/>,
  downloadButtons(s),
  ...pageButtons(s),
  <Settings s={s} key="Settings"/>
];
