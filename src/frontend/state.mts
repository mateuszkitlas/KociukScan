import { Book, Color, Page } from "../native/types.mjs";
import { State } from "../native/state.mjs";
import { usePartialState } from "./react.mjs";
import { InitProps, invoke } from "./utils.mjs";
import { arrayGet, satisfies, validIndex } from "../native/utils.mjs";
import { useMemo } from "react";

export type StatePair = { state: X[0]; set: X[1] };
export type SetState = X[1];
type X = ReturnType<typeof useKociukState>;

export const useKociukState = (props: InitProps) => {
  const [state, set] = usePartialState(
    satisfies<State.Common>({
      allowPageResize: false,
      ...props,
    }),
    satisfies<State.Union>({ kind: "nothing" }),
    state => {
      const fullPages = State.fullPages(state.book.pages);
      return {
        fullPages,
        cPageFull: arrayGet(fullPages, state.cPageIdx),
      };
    },
  );
  type SState = typeof state;
  return [
    state,
    useMemo(() => {
      const book = (arg: Partial<Book> | ((book: Book, state: SState) => Partial<Book>)) =>
        set(rs => ({
          book: { ...rs.book, ...(typeof arg === "function" ? arg(rs.book, rs) : arg) },
        }));
      const setPages = (f: (pages: Page[], state: SState) => Page[]) =>
        book((_, rs) => ({ pages: f(rs.book.pages, rs) }));
      type PageMod = (Partial<Page.Full> & { idx: number; id: number }) | undefined;
      const mod = (arg: PageMod | ((prevState: SState) => PageMod)) =>
        setPages((pages, state) => {
          const x = typeof arg === "function" ? arg(state) : arg;
          if (!x) return pages;
          const { id, idx, ...page } = x;
          return page && pages[idx]?.id === id
            ? pages.with(idx, { ...pages[idx], ...page })
            : pages;
        });
      return Object.assign(set, {
        invoke: invoke(message => set({ modal: { kind: "error", message } })),
        current: {
          rotate: (deltaDeg: number) =>
            mod(rs =>
              rs.cPageFull
                ? {
                    ...rs.cPageFull,
                    props: {
                      ...rs.cPageFull.props,
                      rotate: rs.cPageFull.props.rotate + deltaDeg,
                    },
                  }
                : undefined,
            ),
          nextPrevPage: (deltaIndex: number) =>
            set(rs => ({
              cPageIdx:
                rs.cPageIdx === undefined
                  ? undefined
                  : validIndex(rs.book.pages, rs.cPageIdx + deltaIndex),
            })),
          move: (deltaX: number, deltaY: number) =>
            mod(rs =>
              rs.cPageFull
                ? {
                    ...rs.cPageFull,
                    props: {
                      ...rs.cPageFull.props,
                      x: rs.cPageFull.props.x + deltaX,
                      y: rs.cPageFull.props.y + deltaY,
                    },
                  }
                : undefined,
            ),
        },
        book: Object.assign(book, {
          color: (c: Partial<Color>) =>
            book(prevBook => ({ ...prevBook, color: { ...prevBook.color, ...c } })),
        }),
        pages: Object.assign(setPages, {
          del: (idx: number) => setPages(pages => pages.filter((_, i) => i !== idx)),
          mod,
          duplicate: (id: number) =>
            setPages(pages => {
              const idx = pages.findIndex(p => p.id === id);
              return [...pages.slice(0, idx + 1), ...pages.slice(idx)];
            }),
        }),
      });
    }, [set]),
  ] as const;
};
