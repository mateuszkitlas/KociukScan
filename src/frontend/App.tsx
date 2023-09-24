import React, { useEffect } from "react";
import "./App.css";
import { MiniPage } from "./MiniPage";
import { StateContext, StateProvider } from "./state";
import { emptyRawState, PageNr, State } from "../native/state";
import { buttons, duplicateAction } from "./toolbar";
import { PageElt } from "./page";
import { mainPageSize, offset } from "./offset";
import { Page } from "../native/types";
import { ModalWithClose, ModalYesNo } from "./modal";
import { Settings } from "./Settings/Settings";
import { FileDrop } from "react-file-drop";
import { arrayBufferToBuffer, assertNotFalsy, toError } from "../native/utils";
import { ipcRendererInvoke } from "../backend/endpoints";
import { scan } from "./utils";

const X = ({ s }: { s: State }) => {
  const addFiles = async (fl: FileList) => {
    const newPages = await Promise.all(Array.from(fl).map(async f => ipcRendererInvoke("scanFromFile", arrayBufferToBuffer(await f.arrayBuffer()))));
    s.setRS(rs => ({ ...rs, book: { ...rs.book, pages: [...rs.book.pages, ...newPages] } }));
  };

  const page = s.getPage(s.rs.currentPage);
  const nextPrevPage = (movePageNr: number) => s.setRS(rs => {
    const pageNr = rs.currentPage;
    const nr = rs.book.pages.findIndex(PageNr.eq(pageNr));
    const nextPage: Page | undefined = rs.book.pages[nr + movePageNr];
    const nextPageNr = nextPage ? PageNr.get(nextPage) : pageNr;
    return { ...rs, currentPage: nextPageNr };
  });
  const rotate = (deg: number) => page
    ? s.setRS(rs => {
      const properties = Page.properties(s.rs.book, page);
      const rotate = properties.rotate + deg;
      return {
        ...rs,
        book: {
          ...rs.book,
          pages: rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...page, properties: { ...properties, rotate } } : p),
        }
      };
    })
    : undefined;
  const move = (dx: number, dy: number) => page
    ? s.setRS(rs => {
      const properties = Page.properties(s.rs.book, page);
      const x = properties.x + dx;
      const y = properties.y + dy;
      return {
        ...rs,
        book: {
          ...rs.book,
          pages: rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...page, properties: { ...properties, x, y } } : p),
        }
      };
    })
    : undefined;

  useEffect(() => {
    const pressed: Record<string, boolean> = {};
    const onKeyDown = async ({ code, shiftKey, ctrlKey }: KeyboardEvent) => {
      if (pressed[code]) return;
      pressed[code] = true;
      switch (`${code}${shiftKey ? "+" : "-"}`) {
      case "ArrowDown-":  nextPrevPage(1); return;
      case "ArrowUp-":    nextPrevPage(-1); return;
      case "ArrowLeft-":  rotate(-0.25); return;
      case "ArrowRight-": rotate(0.25); return;
      case "ArrowDown+":  move(0, ctrlKey ? 5 : 1); return;
      case "ArrowUp+":    move(0, ctrlKey ? -5 : -1); return;
      case "ArrowLeft+":  move(ctrlKey ? -5 : -1, 0); return;
      case "ArrowRight+": move(ctrlKey ? 5 : 1, 0); return;
      case "KeyD-":       page && duplicateAction(s, page); return;
      case "Delete-":     page && s.setRS(rs => ({ ...rs, modal: { kind: "deletePage", pageNr: PageNr.get(page) } })); return;
      }
    };
    const onKeyUp = ({ code }: KeyboardEvent) => { pressed[code] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });
  const closeModal = () => s.setRS(rs => ({ ...rs, modal: undefined }));
  
  return <div>
    <div id="wrapper" key="wrapper">
      <PageElt s={s}/>
      <div id="pages" key="pages" style={{ width: offset.x, height: mainPageSize().height }}>
        {s.rs.book.pages.map(page => <MiniPage key={PageNr.key(page)} page={page} s={s}/>)}
      </div>
    </div>
    <div id="toolbar" key="toolbar" style={{ transform: "scale(1)", paddingLeft: 5 }}>
      {buttons(s)}
    </div>

    {(() => {
      switch (s.rs.modal?.kind) {
      case "deletePage":
        const pageNr = s.rs.modal.pageNr;
        return <ModalYesNo
          onYes={() => {
            s.deletePage(pageNr);
            s.setRS(rs => ({ ...rs, currentPage: undefined, modal: undefined }));
          }}
          onNo={closeModal}
        >Are you sure?
        </ModalYesNo>;
      case "errorScan":
        return <ModalWithClose title="Error" onClose={closeModal}>{s.rs.modal.message}</ModalWithClose>;
      case "rescanPage":
        const oldPageNr = s.rs.modal.pageNr;
        return <ModalYesNo
          onYes={async () => {
            s.setRS(rs => ({ ...rs, kind: "scanning one", modal: undefined }));
            const newPage = await (await scan(s))?.();
            if (newPage)
              s.setRS(rs => ({
                ...rs,
                kind: "nothing",
                currentPage: PageNr.get(newPage),
                book: {
                  ...rs.book,
                  pages: rs.book.pages.map(p => PageNr.eq(p)(oldPageNr) ? newPage : p)
                }
              }));
            else
              s.setRS(rs => ({ ...rs, kind: "nothing" }));
          }}
          onNo={closeModal}
        >Are you sure you want to scan this page again?
        </ModalYesNo>;
      case "settings":
        return (() => {
          const modal = s.rs.modal;
          const closeModalModal = () => s.setRS(rs => ({ ...rs, modal: { ...modal, modal: undefined } }));
          switch (modal.modal?.kind) {
          case "deleteProject":
            return <ModalYesNo
              onYes={() => s.setRS(() => emptyRawState)}
              onNo={closeModalModal}
            >Are you sure?
            </ModalYesNo>;
          case "importPages":
            return <ModalWithClose onClose={closeModalModal} title="Import pages">
              <FileDrop
                onDrop={(files) => files && addFiles(files)}
              ><div style={{
                  width: 490,
                  height: 250,
                  border: "5px dashed #fff",
                  borderRadius: 15,
                  paddingTop: 240,
                  textAlign: "center",
                  fontSize: 30
                }}>Drop images here</div>
              </FileDrop>
            </ModalWithClose>;
          case undefined:
            return <ModalWithClose title="Settings" onClose={closeModal}>
              <Settings modal={modal} s={s}/>
            </ModalWithClose>;
          }
        })();
      }
    })()}
  </div>;
};

const AppProvided = () => <div id="App"><X s={React.useContext(StateContext)}/></div>;
const App = () => (<StateProvider><AppProvided /></StateProvider>);

export default App;
