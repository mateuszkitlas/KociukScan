import { Book, Page } from "./types.mjs";
import { arrayGet, satisfies } from "./utils.mjs";

export type State = State.Common & State.Union;
export namespace State {
  export type Common = {
    tmpPath: string;
    cPageIdx?: number;
    book: Book;
    miniatures?: Map<string, string>;
    allowPageResize: boolean;
    device?: string;
    modal?:
      | SettingsModal
      | { kind: "deletePage" | "reScanPage"; pageIdx: number }
      | { kind: "error"; message: string };
  };

  export type Union =
    | { kind: "scanning one" | "nothing" }
    | {
        kind: "scanning many";
        page?: Promise<Page>;
      }
    | {
        kind: "generating pdf";
        processedPages: number;
        startedAt: number;
      };

  export const fullPages = (pages: Page[], cPageIdx?: number) =>
    pages.reduce(
      ({ prevPrev, prev, acc }, page, idx) => {
        const props = page.props ?? prevPrev;
        return {
          prevPrev: prev,
          prev: props,
          acc: [...acc, { ...page, props, touched: !!page.props, idx, current: cPageIdx === idx }],
        };
      },
      {
        prevPrev: Page.defaultProps,
        prev: Page.defaultProps,
        acc: satisfies<Page.Full[]>([]),
      },
    ).acc;

  export const props = (pages: Page[], index: number) => {
    for (let i = index; ; i -= 2) {
      const page = arrayGet(pages, i);
      if (!page) return Page.defaultProps;
      if (page.props) return page.props;
    }
  };
}

export interface SettingsModal {
  kind: "settings";
  devices?: null | string[];
  modal?: { kind: "deleteProject" } | { kind: "importPages" };
}
