import React, { useEffect } from "react";
import "./App.css";
import { MiniPage } from "./MiniPage";
import { PageNr, State, StateContext, StateProvider } from "./state";
import { buttons, deleteAction, duplicateAction } from "./toolbar";
import { PageElt } from "./page";
import { mainPageSize, offset } from "./offset";
import { Page } from "./types";

const X = ({ s }: { s: State }) => {
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
      case "Delete-":     page && deleteAction(s, page); return;
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
    {s.rs.modals.map(m => m.node)}
  </div>;
};

const AppProvided = () => <div id="App"><X s={React.useContext(StateContext)}/></div>;
const App = () => (<StateProvider><AppProvided /></StateProvider>);

export default App;
