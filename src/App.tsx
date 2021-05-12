import React, { useEffect } from "react";
import "./App.css";
import { MiniPage } from "./MiniPage";
import { emptyRawState, PageNr, State, StateContext, StateProvider } from "./state";
import { buttons, duplicateAction } from "./toolbar";
import { PageElt } from "./page";
import { mainPageSize, offset } from "./offset";
import { Page } from "./types";
import { ModalWithClose, ModalYesNo } from "./modal";
import { Settings } from "./Settings/Settings";
import { FileDrop } from "react-file-drop";
import { scan, scanFromFile } from "./scanner";

const X = ({ s }: { s: State }) => {
  const addFiles = async (fl: FileList) => {
    const newPages = await Promise.all(Array.from(fl).map(async f => scanFromFile(await f.arrayBuffer())));
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
    let pressed = false;
    const onKeyDown = async ({ code, shiftKey }: KeyboardEvent) => {
      if (pressed) return;
      pressed = true;
      switch (`${code}${shiftKey ? "+" : "-"}`) {
      case "ArrowDown-":  nextPrevPage(1); return;
      case "ArrowUp-":    nextPrevPage(-1); return;
      case "ArrowLeft-":  rotate(-0.25); return;
      case "ArrowRight-": rotate(0.25); return;
      case "ArrowDown+":  move(0, 1); return;
      case "ArrowUp+":    move(0, -1); return;
      case "ArrowLeft+":  move(-1, 0); return;
      case "ArrowRight+": move(1, 0); return;
      case "KeyD-":       page && duplicateAction(s, page); return;
      case "Delete-":     page && s.setRS(rs => ({ ...rs, modal: { kind: "deletePage", pageNr: PageNr.get(page) } })); return;
      }
    };
    const onKeyUp = () => { pressed = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });
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

    { s.rs.modal?.kind === "settings" && <ModalWithClose
      title="Settings"
      onClose={() => s.setRS(rs => ({ ...rs, modal: undefined }))}
    >
      <Settings modal={s.rs.modal} s={s}/>
    </ModalWithClose>}

    { s.rs.modal?.kind === "deletePage" && <ModalYesNo
      onYes={() => {
        if (s.rs.modal?.kind === "deletePage") {
          s.deletePage(s.rs.modal.pageNr);
          s.setRS(rs => ({ ...rs, currentPage: undefined, modal: undefined }));
        }
      }}
      onNo={() => s.setRS(rs => ({ ...rs, modal: undefined }))}
    >Are you sure?
    </ModalYesNo>}

    { s.rs.modal?.kind === "settings" && s.rs.modal.modal?.kind === "importPages" && <ModalWithClose
      onClose={() => s.setRS(rs =>
        (s.rs.modal?.kind === "settings" && s.rs.modal.modal?.kind === "importPages")
          ? { ...rs, modal: { ...s.rs.modal, modal: undefined } }
          : rs )}
      title="Import pages"
    >
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
    </ModalWithClose>}

    { s.rs.modal?.kind === "settings" && s.rs.modal.modal?.kind === "deleteProject" && <ModalYesNo
      onYes={() => s.setRS(() => emptyRawState)}
      onNo={() => s.setRS(rs =>
        (s.rs.modal?.kind === "settings" && s.rs.modal.modal?.kind === "deleteProject")
          ? { ...rs, modal: { ...s.rs.modal, modal: undefined } }
          : rs )}
    >Are you sure?
    </ModalYesNo>}

    { s.rs.modal?.kind === "errorScan" && <ModalWithClose
      title="Error"
      onClose={() => s.setRS(rs => ({ ...rs, modal: undefined }))}
    >{s.rs.modal.message}</ModalWithClose>}
    
    { s.rs.modal?.kind === "rescanPage" && <ModalYesNo
      onYes={async () => {
        if (s.rs.modal?.kind === "rescanPage") {
          const oldPageNr = s.rs.modal.pageNr;
          s.setRS(rs => ({ ...rs, kind: "scanning one", modal: undefined }));
          const pageGetter = await scan(s);
          if (pageGetter) {
            const newPage = await pageGetter();
            s.setRS(rs => ({
              ...rs,
              kind: "nothing",
              currentPage: PageNr.get(newPage),
              book: {
                ...rs.book,
                pages: rs.book.pages.map(p => PageNr.eq(p)(oldPageNr) ? newPage : p)
              }
            }));
          } else {
            s.setRS(rs => ({ ...rs, kind: "nothing" }));
          }
        }
      }}
      onNo={() => s.setRS(rs => ({ ...rs, modal: undefined }))}
    >Are you sure you want to scan this page again?
    </ModalYesNo>}
  </div>;
};

const AppProvided = () => <div id="App"><X s={React.useContext(StateContext)}/></div>;
const App = () => (<StateProvider><AppProvided /></StateProvider>);

export default App;
