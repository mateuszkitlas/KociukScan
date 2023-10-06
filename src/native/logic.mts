import { Book, Color, Page } from "./types.mjs";
import { State } from "./state.mjs";

export const scaleByPage = (page: Page) => 850 / page.original.width;

export interface ProcessPage {
  width: number;
  height: number;
  props: Page.Props;
  id: number;
  scale: number;
}
export namespace ProcessPage {
  export const from = (book: Book, idx: number): ProcessPage => ({
    width: book.width,
    height: book.height,
    id: book.pages[idx].id,
    props: {
      ...State.props(book.pages, idx),
      color: Color.merge(book.pages[idx], book),
    },
    scale: scaleByPage(book.pages[idx]),
  });
}
