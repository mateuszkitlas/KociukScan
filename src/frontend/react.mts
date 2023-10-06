import { DependencyList, useEffect, useState, MouseEventHandler, useMemo } from "react";
import { Falsy, SRecord, URecord, notFalsy } from "../native/utils.mjs";
export const useDocument = <K extends keyof DocumentEventMap>(
  type: K,
  listener: (event: DocumentEventMap[K]) => void,
  dependencies?: DependencyList,
) => {
  useEffect(() => {
    const g = (e: DocumentEventMap[K]) => {
      e.stopPropagation();
      listener(e);
    };
    document.addEventListener(type, g);
    return () => document.removeEventListener(type, g);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listener, type, ...(dependencies ?? [])]);
};

export function usePartialState<C extends URecord, U extends URecord, M extends URecord>(
  common: C,
  union: U,
  more: (state: C & U) => M,
) {
  type X<A, B> = (Partial<A> & B) | Partial<A>;
  type SetPartialState<C extends URecord, U extends URecord> = (
    arg: X<C, U> | ((prevState: C & U & M) => X<C, U>),
  ) => void;
  const [state, setState] = useState({ ...common, ...union });
  const m = (state: C & U) => ({ ...state, ...more(state) });
  const set: SetPartialState<C, U> = arg =>
    setState(prevState => ({ ...prevState, ...(typeof arg === "function" ? arg(m(prevState)) : arg) }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return [useMemo(() => m(state), [state]), set] as const;
}

export const mouse =
  (f: () => void): MouseEventHandler =>
  ev => {
    ev.stopPropagation();
    f();
  };

export const className = (...args: (SRecord<boolean | Falsy> | string | Falsy)[]) => ({
  className: args
    .filter(notFalsy)
    .flatMap((x): string[] =>
      typeof x === "string"
        ? [x]
        : Object.entries(x)
            .filter(([_, v]) => v)
            .map(([k]) => k),
    )
    .join(" "),
});
